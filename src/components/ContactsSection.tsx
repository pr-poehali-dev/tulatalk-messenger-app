import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  status: string;
  online: boolean;
}

interface ContactsSectionProps {
  currentUserId: number;
  onStartChat: (userId: number) => void;
}

const ContactsSection = ({ currentUserId, onStartChat }: ContactsSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/25ca7e89-6e43-45b6-a21e-c97413df0701?user_id=${currentUserId}`
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/25ca7e89-6e43-45b6-a21e-c97413df0701?q=${encodeURIComponent(
          searchQuery
        )}&user_id=${currentUserId}`
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20">
      <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
          Контакты
        </h2>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icon
              name="Search"
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Поиск по имени или логину..."
              className="pl-11 bg-muted/50 border-0 rounded-xl h-11"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-6 rounded-xl"
          >
            Найти
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl mx-auto">
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                className="bg-card hover:bg-primary/5 rounded-2xl p-4 flex items-center gap-3 transition-all border border-border hover:border-primary/20 animate-scale-in shadow-sm hover:shadow-md"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl shadow-sm ring-2 ring-primary/10">
                    {user.avatar}
                  </div>
                  {user.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card animate-pulse-soft shadow-lg" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {user.display_name}
                  </h3>
                  <p className="text-sm text-primary/70 font-medium">@{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {user.status}
                  </p>
                </div>

                <Button
                  onClick={() => onStartChat(user.id)}
                  size="icon"
                  className="rounded-full w-11 h-11 bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg transition-all hover:scale-110"
                >
                  <Icon name="MessageCircle" size={20} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ContactsSection;
