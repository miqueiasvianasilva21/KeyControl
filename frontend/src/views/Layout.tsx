import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Download,
  // Key,
  // Package,
  Users,
  LogOut,
  DoorOpen,
  History,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Salas', path: '/salas', icon: DoorOpen },
    // { name: 'Chaves', path: '/chaves', icon: Key },
    // { name: 'Kits', path: '/kits', icon: Package },
    { name: 'Receber Chave/Kit', path: '/receber', icon: Download },
    { name: 'Usuários', path: '/usuarios', icon: Users },
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Histórico por Sala', path: '/historico', icon: History },
    { name: 'Administradores', path: '/administradores', icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold">KeyControl</h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Section (Unificados) */}
        <div className="p-4 border-t border-border">
          {user ? (
            <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              {/* Avatar e Informações */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                  {user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Botão de Sair Minimalista */}
              <button
                onClick={handleLogout}
                title="Sair do sistema"
                className="p-2 -mr-1 rounded-md text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Fallback caso não encontre o usuário logado no momento */
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair do sistema</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
