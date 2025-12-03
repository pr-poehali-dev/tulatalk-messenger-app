import { useState, useEffect } from 'react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Sidebar from '@/components/Sidebar';
import AuthScreen from '@/components/AuthScreen';
import ContactsSection from '@/components/ContactsSection';

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

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  status?: string;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('chats');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setAuthToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadChats();
    }
  }, [currentUser]);

  const loadChats = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/c15521f0-23f4-4e20-a9bd-802605ad3088?user_id=${currentUser.id}`
      );
      const data = await response.json();
      
      if (response.ok && data.chats) {
        const mappedChats = data.chats.map((chat: any) => ({
          id: chat.other_user_id,
          chatId: chat.chat_id,
          userId: chat.other_user_id,
          name: chat.display_name,
          avatar: chat.avatar,
          lastMessage: chat.last_message || 'Нет сообщений',
          time: chat.last_message_time
            ? new Date(chat.last_message_time).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          unread: chat.unread_count || 0,
          online: chat.online || false,
        }));
        setChats(mappedChats);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const handleLogin = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      localStorage.clear();
      setCurrentUser(null);
      setAuthToken('');
      setChats([]);
      setSelectedChat(null);
    }
  };

  const handleStartChat = async (userId: number) => {
    if (!currentUser) return;

    // Ищем существующий чат
    const existingChat = chats.find((chat) => chat.userId === userId);
    if (existingChat) {
      setSelectedChat(existingChat);
      setActiveSection('chats');
      return;
    }

    // Загружаем информацию о пользователе
    try {
      const response = await fetch('https://functions.poehali.dev/25ca7e89-6e43-45b6-a21e-c97413df0701', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        const newChat: Chat = {
          id: userId,
          userId: userId,
          name: data.user.display_name,
          avatar: data.user.avatar,
          lastMessage: 'Начните общение',
          time: '',
          unread: 0,
          online: data.user.online || false,
        };
        setSelectedChat(newChat);
        setActiveSection('chats');
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {activeSection === 'chats' && (
          <>
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
            
            <ChatWindow
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
              currentUserId={currentUser.id}
              onMessageSent={loadChats}
            />
          </>
        )}

        {activeSection === 'contacts' && (
          <ContactsSection
            currentUserId={currentUser.id}
            onStartChat={handleStartChat}
          />
        )}

        {activeSection !== 'chats' && activeSection !== 'contacts' && (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="text-center animate-fade-in">
              <div className="text-7xl mb-6">🚧</div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Раздел в разработке
              </h2>
              <p className="text-muted-foreground text-lg">
                Этот раздел скоро будет доступен
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
