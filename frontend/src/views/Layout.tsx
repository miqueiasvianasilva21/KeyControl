import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Download, Key, Package, Users, LogOut,DoorOpen,History } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Salas', path: '/salas', icon: DoorOpen },
    { name: "Chaves", path: "/chaves", icon: Key },
    { name: "Kits", path: "/kits", icon: Package },
    { name: "Receber Chave/Kit", path: "/receber", icon: Download },
    { name: "Usuários", path: "/usuarios", icon: Users },
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Histórico por Sala", path: "/historico", icon: History },
  ];

  const handleLogout = () => {
    // Lógica de logout
    console.log("Deslogando...");
    navigate("/login");
  };

  return (
    // bg-gray-50 garante o fundo cinza claro no painel principal
    <div className="flex h-screen bg-gray-50 dark:bg-background text-foreground transition-colors duration-300">
      
      {/* Sidebar - bg-card garante o fundo totalmente branco (e escuro no dark mode) */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold">KeyControl</h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Deslogar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}