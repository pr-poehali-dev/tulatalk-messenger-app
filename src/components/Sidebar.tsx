import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { icon: 'MessageSquare', label: 'Мои чаты', badge: null, color: 'from-blue-500 to-blue-600' },
    { icon: 'Users', label: 'Контакты', badge: null, color: 'from-green-500 to-green-600' },
    { icon: 'Image', label: 'Медиа', badge: null, color: 'from-purple-500 to-purple-600' },
    { icon: 'Bell', label: 'Уведомления', badge: 3, color: 'from-orange-500 to-orange-600' },
    { icon: 'Settings', label: 'Настройки', badge: null, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:relative left-0 top-0 h-full w-80 bg-gradient-to-b from-card via-card to-background border-r border-border z-50 transition-transform duration-300 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isOpen ? 'animate-slide-in-left' : ''}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 md:p-6 border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">Меню</h2>
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <Icon name="X" size={24} className="text-primary" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl hover:from-primary/15 hover:to-secondary/15 transition-all cursor-pointer group shadow-sm border border-primary/10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-sm">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Иван Петров</h3>
                <p className="text-sm text-primary/70 font-medium">@ivan_petrov</p>
              </div>
              <Icon name="ChevronRight" size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon
                    name={item.icon as any}
                    size={20}
                    className="text-white"
                  />
                </div>
                <span className="flex-1 text-left font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse-soft shadow-md min-w-[24px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2 bg-gradient-to-t from-muted/20 to-transparent">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all font-semibold"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Icon name="Moon" size={18} className="text-white" />
              </div>
              Тёмная тема
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all font-semibold"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                <Icon name="LogOut" size={18} className="text-white" />
              </div>
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;