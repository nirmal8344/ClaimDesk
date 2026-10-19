import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { notificationService } from '../../services/notificationService';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const fetchUnread = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (_) {}
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: isAdmin ? '100dvh' : undefined,
        minHeight: isAdmin ? undefined : '100vh',
        overflow: isAdmin ? 'hidden' : undefined,
        background: 'var(--bg-app)'
      }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: isAdmin ? '100dvh' : undefined,
          overflow: isAdmin ? 'hidden' : undefined
        }}
      >
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
          onRefreshNotifications={fetchUnread}
        />

        <main
          className={isAdmin ? 'admin-main-viewport' : undefined}
          style={{
            flex: 1,
            padding: isAdmin ? '16px 24px' : '24px 28px',
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
            minHeight: 0,
            overflowY: isAdmin ? 'auto' : undefined,
            overflowX: 'hidden'
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
          .mobile-header-logo {
            display: block !important;
          }
          .mobile-close-btn {
            display: flex !important;
          }
          aside.sidebar-closed {
            position: fixed !important;
            transform: translateX(-100%);
          }
          aside.sidebar-open {
            position: fixed !important;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
