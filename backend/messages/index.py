"""
Функция для работы с сообщениями: отправка, получение и управление чатами.
Поддерживает создание диалогов, отправку разных типов сообщений и получение истории.
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        cursor_factory=RealDictCursor
    )

def get_or_create_chat(cursor, user1_id: int, user2_id: int) -> int:
    """Получает существующий чат или создает новый"""
    # Нормализуем порядок пользователей
    if user1_id > user2_id:
        user1_id, user2_id = user2_id, user1_id
    
    # Ищем существующий чат
    cursor.execute(
        "SELECT id FROM chats WHERE user1_id = %s AND user2_id = %s",
        (user1_id, user2_id)
    )
    chat = cursor.fetchone()
    
    if chat:
        return chat['id']
    
    # Создаем новый чат
    cursor.execute(
        "INSERT INTO chats (user1_id, user2_id) VALUES (%s, %s) RETURNING id",
        (user1_id, user2_id)
    )
    return cursor.fetchone()['id']

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Получить список чатов пользователя
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('user_id')
            chat_id = params.get('chat_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            # Получить сообщения конкретного чата
            if chat_id:
                cursor.execute(
                    """
                    SELECT m.id, m.sender_id, m.message_type, m.content, 
                           m.created_at, m.is_read,
                           u.username, u.display_name, u.avatar
                    FROM messages m
                    JOIN users u ON m.sender_id = u.id
                    WHERE m.chat_id = %s
                    ORDER BY m.created_at ASC
                    LIMIT 100
                    """,
                    (chat_id,)
                )
                messages = [dict(msg) for msg in cursor.fetchall()]
                
                # Отметить сообщения как прочитанные
                cursor.execute(
                    "UPDATE messages SET is_read = TRUE WHERE chat_id = %s AND sender_id != %s",
                    (chat_id, user_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'messages': messages}),
                    'isBase64Encoded': False
                }
            
            # Получить список всех чатов
            cursor.execute(
                """
                SELECT c.id as chat_id,
                       CASE 
                           WHEN c.user1_id = %s THEN c.user2_id
                           ELSE c.user1_id
                       END as other_user_id,
                       u.username, u.display_name, u.avatar,
                       (CURRENT_TIMESTAMP - u.last_seen) < INTERVAL '5 minutes' as online,
                       (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                       (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != %s AND is_read = FALSE) as unread_count
                FROM chats c
                JOIN users u ON u.id = CASE WHEN c.user1_id = %s THEN c.user2_id ELSE c.user1_id END
                WHERE c.user1_id = %s OR c.user2_id = %s
                ORDER BY last_message_time DESC NULLS LAST
                """,
                (user_id, user_id, user_id, user_id, user_id)
            )
            chats = [dict(chat) for chat in cursor.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'chats': chats}),
                'isBase64Encoded': False
            }
        
        # Отправить сообщение
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'send')
            
            if action == 'send':
                sender_id = body.get('sender_id')
                recipient_id = body.get('recipient_id')
                content = body.get('content', '').strip()
                message_type = body.get('message_type', 'text')
                
                if not sender_id or not recipient_id or not content:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'sender_id, recipient_id и content обязательны'}),
                        'isBase64Encoded': False
                    }
                
                # Получить или создать чат
                chat_id = get_or_create_chat(cursor, int(sender_id), int(recipient_id))
                
                # Отправить сообщение
                cursor.execute(
                    """
                    INSERT INTO messages (chat_id, sender_id, message_type, content)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, created_at
                    """,
                    (chat_id, sender_id, message_type, content)
                )
                message = cursor.fetchone()
                
                # Обновить last_seen отправителя
                cursor.execute("UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = %s", (sender_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'message_id': message['id'],
                        'chat_id': chat_id,
                        'created_at': str(message['created_at'])
                    }),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
