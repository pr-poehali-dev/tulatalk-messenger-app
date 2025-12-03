import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isMine: boolean;
  type: 'text' | 'sticker' | 'image';
}

interface ChatWindowProps {
  chat: Chat | null;
  onBack: () => void;
}

const ChatWindow = ({ chat, onBack }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Привет! Как дела? 👋',
      time: '14:30',
      isMine: false,
      type: 'text',
    },
    {
      id: 2,
      text: 'Отлично! Работаю над новым проектом',
      time: '14:31',
      isMine: true,
      type: 'text',
    },
    {
      id: 3,
      text: '🎉',
      time: '14:32',
      isMine: false,
      type: 'sticker',
    },
    {
      id: 4,
      text: 'Звучит здорово! Расскажешь подробнее?',
      time: '14:32',
      isMine: false,
      type: 'text',
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMine: true,
        type: 'text',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center bg-muted/30">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Добро пожаловать в Tulatalk
          </h2>
          <p className="text-muted-foreground">
            Выберите чат, чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background animate-fade-in">
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Icon name="ArrowLeft" size={24} />
        </button>

        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
            {chat.avatar}
          </div>
          {chat.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse-soft" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">
            {chat.online ? 'В сети' : 'Был(а) недавно'}
          </p>
        </div>

        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Icon name="Phone" size={22} className="text-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Icon name="Video" size={22} className="text-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Icon name="MoreVertical" size={22} className="text-foreground" />
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'} animate-scale-in`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.isMine
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {msg.type === 'sticker' ? (
                  <div className="text-5xl">{msg.text}</div>
                ) : (
                  <p className="break-words">{msg.text}</p>
                )}
                <div
                  className={`text-xs mt-1 ${
                    msg.isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
            <Icon name="Plus" size={24} className="text-muted-foreground" />
          </button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-muted border-0"
          />

          <button className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
            <Icon name="Smile" size={24} className="text-muted-foreground" />
          </button>

          {message.trim() ? (
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full w-10 h-10 flex-shrink-0"
            >
              <Icon name="Send" size={20} />
            </Button>
          ) : (
            <button className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
              <Icon name="Mic" size={24} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
