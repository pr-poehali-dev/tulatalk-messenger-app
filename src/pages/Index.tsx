import { useState } from 'react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Sidebar from '@/components/Sidebar';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chats: Chat[] = [
    {
      id: 1,
      name: 'Анна Петрова',
      avatar: '👩‍💼',
      lastMessage: 'Привет! Как дела?',
      time: '14:32',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Команда разработки',
      avatar: '👥',
      lastMessage: 'Встреча перенесена на 15:00',
      time: '13:15',
      unread: 5,
      online: false,
    },
    {
      id: 3,
      name: 'Дмитрий Иванов',
      avatar: '👨‍💻',
      lastMessage: 'Отправил файлы',
      time: '11:48',
      unread: 0,
      online: true,
    },
    {
      id: 4,
      name: 'Мария Соколова',
      avatar: '👩‍🎨',
      lastMessage: 'Посмотри новый дизайн',
      time: '10:22',
      unread: 1,
      online: false,
    },
    {
      id: 5,
      name: 'Семья ❤️',
      avatar: '👨‍👩‍👧‍👦',
      lastMessage: 'Мама: Не забудь позвонить',
      time: 'Вчера',
      unread: 0,
      online: false,
    },
    {
      id: 6,
      name: 'Алексей Смирнов',
      avatar: '👨‍🔧',
      lastMessage: 'Все готово!',
      time: 'Вчера',
      unread: 0,
      online: false,
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-1 overflow-hidden">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <ChatWindow
          chat={selectedChat}
          onBack={() => setSelectedChat(null)}
        />
      </div>
    </div>
  );
};

export default Index;