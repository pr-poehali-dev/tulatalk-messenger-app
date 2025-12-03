import { useState, useRef, useEffect } from 'react';
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
  userId?: number;
  chatId?: number;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isMine: boolean;
  type: 'text' | 'sticker' | 'image' | 'video' | 'voice';
  duration?: number;
  sender_id?: number;
}

interface ChatWindowProps {
  chat: Chat | null;
  onBack: () => void;
  currentUserId: number;
  onMessageSent?: () => void;
}

const ChatWindow = ({ chat, onBack, currentUserId, onMessageSent }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chat?.chatId) {
      loadMessages();
    }
  }, [chat?.chatId]);

  const loadMessages = async () => {
    if (!chat?.chatId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/c15521f0-23f4-4e20-a9bd-802605ad3088?user_id=${currentUserId}&chat_id=${chat.chatId}`
      );
      const data = await response.json();
      
      if (response.ok && data.messages) {
        const mappedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isMine: msg.sender_id === currentUserId,
          type: msg.message_type,
          sender_id: msg.sender_id,
        }));
        setMessages(mappedMessages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const stickers = [
    '😀', '😂', '🥰', '😍', '🤗', '😎',
    '🤔', '😮', '😴', '🤩', '😭', '😡',
    '👍', '👎', '👏', '🙏', '💪', '🎉',
    '❤️', '💔', '🔥', '⭐', '✨', '💯',
  ];

  const handleSend = async () => {
    if (!message.trim() || !chat) return;

    const textToSend = message;
    setMessage('');

    try {
      const response = await fetch('https://functions.poehali.dev/c15521f0-23f4-4e20-a9bd-802605ad3088', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          sender_id: currentUserId,
          recipient_id: chat.userId || chat.id,
          content: textToSend,
          message_type: 'text',
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const newMessage: Message = {
          id: data.message_id,
          text: textToSend,
          time: new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isMine: true,
          type: 'text',
          sender_id: currentUserId,
        };
        setMessages([...messages, newMessage]);
        onMessageSent?.();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessage(textToSend);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: URL.createObjectURL(file),
        time: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMine: true,
        type: 'image',
      };
      setMessages([...messages, newMessage]);
      setShowAttachMenu(false);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: URL.createObjectURL(file),
        time: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMine: true,
        type: 'video',
      };
      setMessages([...messages, newMessage]);
      setShowAttachMenu(false);
    }
  };

  const handleStickerSelect = async (sticker: string) => {
    if (!chat) return;

    setShowStickerPicker(false);

    try {
      const response = await fetch('https://functions.poehali.dev/c15521f0-23f4-4e20-a9bd-802605ad3088', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          sender_id: currentUserId,
          recipient_id: chat.userId || chat.id,
          content: sticker,
          message_type: 'sticker',
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const newMessage: Message = {
          id: data.message_id,
          text: sticker,
          time: new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isMine: true,
          type: 'sticker',
          sender_id: currentUserId,
        };
        setMessages([...messages, newMessage]);
        onMessageSent?.();
      }
    } catch (err) {
      console.error('Failed to send sticker:', err);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    const newMessage: Message = {
      id: messages.length + 1,
      text: 'Голосовое сообщение',
      time: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isMine: true,
      type: 'voice',
      duration: recordingTime,
    };
    setMessages([...messages, newMessage]);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!chat) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center animate-fade-in">
          <div className="text-7xl mb-6 animate-pulse-soft">💬</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
            Добро пожаловать в Tulatalk
          </h2>
          <p className="text-muted-foreground text-lg">
            Выберите чат, чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20 animate-fade-in">
      <div className="p-3 md:p-4 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-2 md:gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <Icon name="ArrowLeft" size={24} className="text-primary" />
        </button>

        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl md:text-2xl ring-2 ring-primary/10 shadow-sm">
            {chat.avatar}
          </div>
          {chat.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse-soft shadow-md" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate text-sm md:text-base">{chat.name}</h2>
          <p className="text-xs text-primary/70 font-medium">
            {chat.online ? '✓ В сети' : 'Был(а) недавно'}
          </p>
        </div>

        <button className="p-2 hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95 hidden sm:block">
          <Icon name="Phone" size={20} className="text-primary" />
        </button>
        <button className="p-2 hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95 hidden sm:block">
          <Icon name="Video" size={20} className="text-primary" />
        </button>
        <button className="p-2 hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95">
          <Icon name="MoreVertical" size={20} className="text-primary" />
        </button>
      </div>

      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'} animate-scale-in`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm ${
                  msg.isMine
                    ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm'
                    : 'bg-card text-foreground rounded-bl-sm border border-border'
                }`}
              >
                {msg.type === 'sticker' ? (
                  <div className="text-5xl">{msg.text}</div>
                ) : msg.type === 'image' ? (
                  <img
                    src={msg.text}
                    alt="Фото"
                    className="max-w-full rounded-lg"
                  />
                ) : msg.type === 'video' ? (
                  <video
                    src={msg.text}
                    controls
                    className="max-w-full rounded-lg"
                  />
                ) : msg.type === 'voice' ? (
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full w-9 h-9 hover:bg-background/20"
                    >
                      <Icon name="Play" size={18} />
                    </Button>
                    <div className="flex-1 h-1.5 bg-background/30 rounded-full overflow-hidden">
                      <div className="h-full bg-background/50 w-0" />
                    </div>
                    <span className="text-xs font-medium">{formatTime(msg.duration || 0)}</span>
                  </div>
                ) : (
                  <p className="break-words">{msg.text}</p>
                )}
                <div
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    msg.isMine ? 'text-white/70 justify-end' : 'text-muted-foreground'
                  }`}
                >
                  <span>{msg.time}</span>
                  {msg.isMine && <Icon name="Check" size={14} className="text-white/70" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 md:p-4 border-t border-border bg-card/80 backdrop-blur-sm safe-area-bottom">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoSelect}
        />

        {showAttachMenu && (
          <div className="absolute bottom-16 md:bottom-20 left-2 md:left-4 bg-card border border-border rounded-2xl shadow-2xl p-2 animate-scale-in z-50">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 rounded-xl transition-all w-full text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Icon name="Image" size={22} className="text-blue-600" />
              </div>
              <span className="font-semibold text-foreground">Фото</span>
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-3 px-4 py-3 hover:bg-purple-500/10 rounded-xl transition-all w-full text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Icon name="Video" size={22} className="text-purple-600" />
              </div>
              <span className="font-semibold text-foreground">Видео</span>
            </button>
          </div>
        )}

        {showStickerPicker && (
          <div className="absolute bottom-16 md:bottom-20 right-2 md:right-4 bg-card border border-border rounded-2xl shadow-2xl p-3 md:p-4 animate-scale-in z-50">
            <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Стикеры</h3>
            <div className="grid grid-cols-6 gap-1 md:gap-2 max-w-xs">
              {stickers.map((sticker, index) => (
                <button
                  key={index}
                  onClick={() => handleStickerSelect(sticker)}
                  className="text-2xl md:text-3xl hover:scale-125 transition-transform p-2 hover:bg-primary/5 rounded-lg active:scale-95"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        )}

        {isRecording && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-card flex items-center justify-center gap-4 animate-fade-in z-50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse-soft shadow-lg">
                <Icon name="Mic" size={26} className="text-white" />
              </div>
              <div className="text-3xl font-mono font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                {formatTime(recordingTime)}
              </div>
            </div>
            <Button
              onClick={stopRecording}
              size="icon"
              className="rounded-full w-16 h-16 shadow-lg hover:scale-110 transition-transform"
            >
              <Icon name="Send" size={26} />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Icon name="Plus" size={22} className="text-primary" />
          </button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-muted/50 border-0 rounded-xl focus:bg-muted transition-colors h-11 text-sm md:text-base"
          />

          <button
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="p-2 hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Icon name="Smile" size={22} className="text-primary" />
          </button>

          {message.trim() ? (
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full w-11 h-11 flex-shrink-0 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-br from-primary to-secondary"
            >
              <Icon name="Send" size={20} />
            </Button>
          ) : (
            <button
              onClick={startRecording}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Icon name="Mic" size={22} className="text-red-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;