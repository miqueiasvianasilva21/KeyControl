import { createBrowserRouter, Navigate, Outlet } from "react-router"; 
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RoomProvider } from "./providers/RoomProvider";
import { KeyProvider } from "./providers/KeyProvider";
import { KitProvider } from "./providers/KitProvider";
import { ReceiveProvider } from "./providers/ReceiveProvider";
import { HistoryProvider } from "./providers/HistoryProvider"; 
import { UserProvider } from "./providers/UserProvider"; 
import { DashboardProvider } from "./providers/DashboardProvider";
import { Login } from "./views/Login";
import { Dashboard } from "./views/Dashboard";
import { Layout } from "./views/Layout";
import { Chaves } from "./views/Chaves";
import { Kits } from "./views/Kits";
import { ReceberChave } from "./views/ReceberChave";
import { Usuarios } from "./views/Usuarios";
import { Salas } from "./views/Salas";
import { HistoricoSalas } from "./views/HistoricoSalas";

const RotaProtegida = () => {
  const { estaLogado } = useAuth();
  
  if (!estaLogado) {
    return <Navigate to="/login" replace />; 
  }
  
  return <Outlet />; 
};

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        element: <RotaProtegida />,
        children: [
          {
            element: <Layout />,
            children: [
              {
                path: "/",
                element: <Navigate to="/dashboard" replace />,
              },
              { 
  path: "/chaves", 
  element: (
    <KeyProvider>
      <Chaves />
    </KeyProvider>
  ) 
},
              { 
  path: "/kits", 
  element: (
    <KitProvider>
      <Kits />
    </KitProvider>
  ) 
},
              { 
  path: "/receber", 
  element: (
    <ReceiveProvider>
      <ReceberChave />
    </ReceiveProvider>
  ) 
},
              { 
  path: "/usuarios", 
  element: (
    <UserProvider>
      <Usuarios />
    </UserProvider>
  ) 
},
{ 
  path: "/historico", 
  element: (
    <HistoryProvider>
      <HistoricoSalas />
    </HistoryProvider>
  ) 
},
{
  path: "/dashboard",
  element: (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  ),
},
              { 
                path: "/salas", 
                element: (
                  <RoomProvider>
                    <Salas />
                  </RoomProvider>
                ) 
              },
              
            ],
          },
        ],
      },
    ],
  },
]);