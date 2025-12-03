"""
Функция для поиска пользователей и получения информации о них.
Позволяет искать по имени пользователя и получать список всех пользователей.
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
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        search_query = params.get('q', '').strip()
        current_user_id = params.get('user_id')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            if search_query:
                # Поиск пользователей
                cursor.execute(
                    """
                    SELECT id, username, display_name, avatar, status, 
                           (CURRENT_TIMESTAMP - last_seen) < INTERVAL '5 minutes' as online
                    FROM users 
                    WHERE (username ILIKE %s OR display_name ILIKE %s)
                    AND id != %s
                    LIMIT 50
                    """,
                    (f'%{search_query}%', f'%{search_query}%', current_user_id or 0)
                )
            else:
                # Получить всех пользователей (кроме текущего)
                cursor.execute(
                    """
                    SELECT id, username, display_name, avatar, status,
                           (CURRENT_TIMESTAMP - last_seen) < INTERVAL '5 minutes' as online
                    FROM users 
                    WHERE id != %s
                    ORDER BY display_name
                    LIMIT 100
                    """,
                    (current_user_id or 0,)
                )
            
            users = [dict(user) for user in cursor.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'users': users}),
                'isBase64Encoded': False
            }
        
        finally:
            cursor.close()
            conn.close()
    
    if method == 'POST':
        # Получить информацию о конкретном пользователе
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id обязателен'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                SELECT id, username, display_name, avatar, status,
                       (CURRENT_TIMESTAMP - last_seen) < INTERVAL '5 minutes' as online,
                       last_seen
                FROM users 
                WHERE id = %s
                """,
                (user_id,)
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Пользователь не найден'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'user': dict(user)}),
                'isBase64Encoded': False
            }
        
        finally:
            cursor.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }
