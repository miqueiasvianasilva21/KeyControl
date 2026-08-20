import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoomProvider } from './providers/RoomProvider';
import { ItemProvider } from './providers/ItemProvider';
import { ReceiveProvider } from './providers/ReceiveProvider';
import { HistoryProvider } from './providers/RoomHistoryProvider';
import { UserProvider } from './providers/UserProvider';
import { DashboardProvider } from './providers/DashboardProvider';
import { AdminProvider } from './providers/AdminProvider';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Layout } from './views/Layout';
import { Keys } from './views/Keys';
import { Kits } from './views/Kits';
import { Receive } from './views/Receive';
import { Users } from './views/Users';
import { Rooms } from './views/Rooms';
import { RoomHistory } from './views/RoomHistory';
import { Admins } from './views/Admins';

const RotaProtegida = () => {
  const { estaLogado, carregandoSessao } = useAuth();

  if (carregandoSessao) {
    return null;
  }

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
        path: '/login',
        element: <Login />,
      },
      {
        element: <RotaProtegida />,
        children: [
          {
            element: <Layout />,
            children: [
              {
                path: '/',
                element: <Navigate to="/dashboard" replace />,
              },
              {
                path: '/chaves',
                element: (
                  <ItemProvider>
                    <Keys />
                  </ItemProvider>
                ),
              },
              {
                path: '/kits',
                element: (
                  <ItemProvider>
                    <Kits />
                  </ItemProvider>
                ),
              },
              {
                path: '/receber',
                element: (
                  <ReceiveProvider>
                    <Receive />
                  </ReceiveProvider>
                ),
              },
              {
                path: '/usuarios',
                element: (
                  <UserProvider>
                    <Users />
                  </UserProvider>
                ),
              },
              {
                path: '/historico',
                element: (
                  <HistoryProvider>
                    <RoomHistory />
                  </HistoryProvider>
                ),
              },
              {
                path: '/dashboard',
                element: (
                  <DashboardProvider>
                    <Dashboard />
                  </DashboardProvider>
                ),
              },
              {
                path: '/administradores',
                element: (
                  <AdminProvider>
                    <Admins />
                  </AdminProvider>
                ),
              },
              {
                path: '/salas',
                element: (
                  <RoomProvider>
                    <Rooms />
                  </RoomProvider>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);
