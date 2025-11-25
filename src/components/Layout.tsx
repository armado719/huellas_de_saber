import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockMensajes } from '../data/mockData';
import { DATOS_COLEGIO } from '../types';
import Footer from './Footer';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardCheck,
  GraduationCap,
  FileText,
  Calendar,
  MessageSquare,
  CreditCard,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calcular mensajes no leídos
  const mensajesNoLeidos = useMemo(() => {
    const normalizarDestinatario = (destinatarioId: string | string[]): string[] => {
      return Array.isArray(destinatarioId) ? destinatarioId : [destinatarioId];
    };

    return mockMensajes.filter((m) => {
      const destinatarios = normalizarDestinatario(m.destinatarioId);
      return destinatarios.includes(user?.id || '1') && !m.leido;
    }).length;
  }, [user]);

  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: '/estudiantes',
      label: 'Estudiantes',
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: '/profesores',
      label: 'Profesores',
      icon: <UserCheck className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      path: '/asistencia',
      label: 'Asistencia',
      icon: <ClipboardCheck className="w-5 h-5" />,
    },
    {
      path: '/calificaciones',
      label: 'Calificaciones',
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      path: '/boletines',
      label: 'Boletines',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      path: '/horarios',
      label: 'Horarios',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      path: '/mensajes',
      label: 'Mensajes',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      path: '/pagos',
      label: 'Pagos',
      icon: <CreditCard className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      path: '/recursos',
      label: 'Recursos',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.rol || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary shadow-lg fixed top-0 left-0 right-0 z-30 border-b-4 border-primary">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2 shadow-md">
                <img
                  src="/images/escudo.png"
                  alt="Escudo Huellas Del Saber"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white drop-shadow-md">
                  Huellas Del Saber
                </h1>
                <p className="text-xs text-white/90">
                  NIT: {DATOS_COLEGIO.nit} | Tel: {DATOS_COLEGIO.telefono}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white drop-shadow">
                {user?.nombre}
              </p>
              <p className="text-xs text-white/90 capitalize">{user?.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/90 text-white transition-colors shadow-md"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-white shadow-lg transition-transform duration-300 z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        <nav className="p-4 overflow-y-auto h-full">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                      {item.path === '/mensajes' && mensajesNoLeidos > 0 && (
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                            isActive
                              ? 'bg-secondary text-white'
                              : 'bg-secondary text-white'
                          }`}
                        >
                          {mensajesNoLeidos}
                        </span>
                      )}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-20 pb-0 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6 min-h-[calc(100vh-280px)]">{children}</div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
