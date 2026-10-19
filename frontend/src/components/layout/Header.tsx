import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Shield,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  unreadCount: number;
  onRefreshNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, unreadCount, onRefreshNotifications }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const list = await notificationService.getNotifications();
        setNotifications(list.slice(0, 6));
      } catch (_) {}
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      onRefreshNotifications();
    } catch (_) {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    if (user?.role === 'ADMIN') {
      navigate(`/admin/claims?search=${q}`);
    } else if (user?.role === 'CLAIM_OFFICER') {
      navigate(`/officer/claims?search=${q}`);
    } else {
      navigate(`/customer/claims?search=${q}`);
    }
  };


  const getRoleDisplayName = () => {
    if (user?.role === 'ADMIN') return 'Administrator';
    if (user?.role === 'CLAIM_OFFICER') return 'Claim Officer';
    return 'Customer';
  };

  return (
    <header style={{
      height: 70,
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Left: Mobile Toggle & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 500 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            padding: 8,
            color: '#4B5563',
            display: 'none',
            borderRadius: 8
          }}
          className="mobile-hamburger-btn"
        >
          <Menu size={22} />
        </button>

        <img
          src="/brand/claimdesk-logo.png"
          alt="ClaimDesk"
          className="mobile-header-logo"
          style={{
            height: 24,
            width: 'auto',
            display: 'none',
            objectFit: 'contain'
          }}
        />

        <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder={
              user?.role === 'CLAIM_OFFICER'
                ? "Search claims, policies, customers, documents..."
                : (user?.role === 'CUSTOMER' ? "Search claims, policies, documents..." : "Search claims, policies, officers...")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 16px 9px 40px',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              fontSize: 13.5,
              background: '#F9FAFB',
              color: '#1F2937',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
        </form>
      </div>

      {/* Right Controls: Notifications, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={handleOpenNotifications}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'transparent',
              color: '#4B5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'background 0.2s ease',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Bell size={20} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 5,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#EF4444',
                border: '1.5px solid #FFFFFF'
              }} />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '115%',
              width: 340,
              background: '#FFFFFF',
              borderRadius: 14,
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid #E5E7EB',
              padding: '14px 0',
              zIndex: 50
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 12px',
                borderBottom: '1px solid #F3F4F6'
              }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Notifications</span>
                <button
                  onClick={() => {
                    const rolePath = user?.role === 'ADMIN' ? '/admin/notifications' : user?.role === 'CLAIM_OFFICER' ? '/officer/notifications' : '/customer/notifications';
                    setShowNotifications(false);
                    navigate(rolePath);
                  }}
                  style={{ background: 'transparent', fontSize: 12, color: '#6C5DD3', fontWeight: 600 }}
                >
                  View All
                </button>
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #F9FAFB',
                        background: n.isRead ? 'transparent' : '#FAF8FF',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{n.title}</div>
                        {!n.isRead && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C5DD3' }} />
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              padding: '4px 6px',
              borderRadius: 8
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#1F2130',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13
            }}>
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </div>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {getRoleDisplayName()}
              </div>
            </div>

            <ChevronDown size={15} color="#9CA3AF" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '115%',
              width: 200,
              background: '#FFFFFF',
              borderRadius: 12,
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid #E5E7EB',
              padding: '6px 0',
              zIndex: 50
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.fullName}</div>
                <div style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  const profilePath = user?.role === 'ADMIN' ? '/admin/profile' : user?.role === 'CLAIM_OFFICER' ? '/officer/profile' : '/customer/profile';
                  navigate(profilePath);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  background: 'transparent',
                  color: '#374151',
                  fontSize: 13
                }}
              >
                <User size={16} />
                <span>My Profile</span>
              </button>

              <button
                onClick={logout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  background: 'transparent',
                  color: '#EF4444',
                  fontSize: 13,
                  borderTop: '1px solid #F3F4F6'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
