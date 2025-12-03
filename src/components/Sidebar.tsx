import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { icon: 'MessageSquare', label: 'Мои чаты', badge: null },
    { icon: 'Users', label: 'Контакты', badge: null },
    { icon: 'Image', label: 'Медиа', badge: null },
    { icon: 'Bell', label: 'Уведомления', badge: 3 },
    { icon: 'Settings', label: 'Настройки', badge: null },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:relative left-0 top-0 h-full w-80 bg-card border-r border-border z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isOpen ? 'animate-slide-in-left' : ''}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Меню</h2>
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                👤
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Иван Петров</h3>
                <p className="text-sm text-muted-foreground">@ivan_petrov</p>
              </div>
              <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon
                    name={item.icon as any}
                    size={20}
                    className="text-primary"
                  />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full animate-pulse-soft">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <Icon name="Moon" size={20} />
              Тёмная тема
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Icon name="LogOut" size={20} />
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
