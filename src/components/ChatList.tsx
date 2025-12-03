import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onMenuClick: () => void;
}

const ChatList = ({ chats, selectedChat, onSelectChat, onMenuClick }: ChatListProps) => {
  return (
    <div className="w-full md:w-96 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="Menu" size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-primary">Tulatalk</h1>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="Search" size={24} className="text-foreground" />
          </button>
        </div>
        <div className="relative">
          <Icon
            name="Search"
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
          />
          <Input
            placeholder="Поиск чатов..."
            className="pl-11 bg-muted/50 border-0 rounded-xl focus:bg-muted transition-colors h-11"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat, index) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-primary/5 active:bg-primary/10 transition-all duration-200 border-l-4 relative group ${
              selectedChat?.id === chat.id
                ? 'bg-primary/10 border-l-primary shadow-sm'
                : 'border-l-transparent'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl shadow-sm ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                {chat.avatar}
              </div>
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card animate-pulse-soft shadow-lg" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {chat.name}
                </h3>
                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0 font-medium">
                  {chat.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {chat.lastMessage}
              </p>
            </div>

            {chat.unread > 0 && (
              <Badge className="bg-gradient-to-br from-primary to-secondary text-white animate-scale-in shadow-md min-w-[24px] h-6">
                {chat.unread}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatList;