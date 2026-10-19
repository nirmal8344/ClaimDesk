import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShieldCheck,
  FilePlus,
  FileText,
  Bell,
  User,
  ClipboardList,
  FileClock,
  FileCheck2,
  Calculator,
  CheckCircle2,
  Users,
  UserCheck,
  FolderKanban,
  BarChart3,
  Settings,
  Shield,
  X,
  LogOut,
  Home
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'CUSTOMER';
  const isWhiteTheme = role === 'CUSTOMER' || role === 'CLAIM_OFFICER';

  let navItems: Array<{ label: string; path: string; icon: React.ReactNode; badge?: number }> = [];

  if (role === 'CUSTOMER') {
    navItems = [
      { label: 'Dashboard', path: '/customer/dashboard', icon: <LayoutDashboard size={19} /> },
      { label: 'My Policies', path: '/customer/policies', icon: <ShieldCheck size={19} /> },
      { label: 'New Claim', path: '/customer/new-claim', icon: <FilePlus size={19} /> },
      { label: 'My Claims', path: '/customer/claims', icon: <FileText size={19} /> },
      { label: 'Notifications', path: '/customer/notifications', icon: <Bell size={19} />, badge: unreadCount },
      { label: 'Profile', path: '/customer/profile', icon: <User size={19} /> },
    ];
  } else if (role === 'CLAIM_OFFICER') {
    navItems = [
      { label: 'Dashboard', path: '/officer/dashboard', icon: <Home size={19} /> },
      { label: 'Assigned Claims', path: '/officer/claims', icon: <FileText size={19} /> },
      { label: 'Pending Documents', path: '/officer/pending-documents', icon: <FileClock size={19} /> },
      { label: 'Claims Under Review', path: '/officer/under-review', icon: <FileCheck2 size={19} /> },
      { label: 'Assessment', path: '/officer/assessment', icon: <BarChart3 size={19} /> },
      { label: 'Completed Claims', path: '/officer/completed', icon: <CheckCircle2 size={19} /> },
      { label: 'Notifications', path: '/officer/notifications', icon: <Bell size={19} />, badge: unreadCount },
      { label: 'Profile', path: '/officer/profile', icon: <User size={19} /> },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={19} /> },
      { label: 'Claims', path: '/admin/claims', icon: <FileText size={19} /> },
      { label: 'Customers', path: '/admin/customers', icon: <Users size={19} /> },
      { label: 'Officers', path: '/admin/officers', icon: <UserCheck size={19} /> },
      { label: 'Policies', path: '/admin/policies', icon: <ShieldCheck size={19} /> },
      { label: 'Claim Categories', path: '/admin/categories', icon: <FolderKanban size={19} /> },
      { label: 'Reports', path: '/admin/reports', icon: <BarChart3 size={19} /> },
      { label: 'Settings', path: '/admin/settings', icon: <Settings size={19} /> },
      { label: 'Notifications', path: '/admin/notifications', icon: <Bell size={19} />, badge: unreadCount },
      { label: 'Profile', path: '/admin/profile', icon: <User size={19} /> },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: 250,
          background: isWhiteTheme ? '#FFFFFF' : 'var(--bg-sidebar)',
          color: isWhiteTheme ? '#64748B' : 'var(--text-sidebar)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          borderRight: isWhiteTheme ? '1px solid #ECEEF4' : '1px solid #1F2130',
          transition: 'transform 0.3s ease',
        }}
        className={isOpen ? 'sidebar-open' : 'sidebar-closed'}
      >
        {/* Brand Header */}
        <div style={{
          padding: isWhiteTheme ? '26px 24px 16px' : '24px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isWhiteTheme ? 'none' : '1px solid #202235'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
          }}>
            <img
              src={isWhiteTheme ? '/brand/claimdesk-logo.png' : '/brand/claimdesk-logo-white.png'}
              alt="ClaimDesk"
              style={{
                height: 32,
                width: 'auto',
                maxWidth: 165,
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              color: isWhiteTheme ? '#64748B' : '#9EA3B5',
              display: 'none',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '20px 14px', overflowY: 'auto' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? (isWhiteTheme ? '#5046E5' : '#FFFFFF')
                    : (isWhiteTheme ? '#64748B' : '#9EA3B5'),
                  background: isActive
                    ? (isWhiteTheme ? '#EDE8FA' : '#6C5DD3')
                    : 'transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none'
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 9999
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        {isWhiteTheme ? (
          /* Logout Button at bottom with red logout icon */
          <div style={{
            padding: '16px 20px 24px',
            borderTop: '1px solid #F1F3F8'
          }}>
            <button
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'transparent',
                border: 'none',
                padding: '8px 4px',
                cursor: 'pointer',
                borderRadius: 8,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                flexShrink: 0
              }}>
                <LogOut size={16} />
              </div>
              <span style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: '#EF4444'
              }}>
                Logout
              </span>
            </button>
          </div>
        ) : (
          /* Bottom User Role Badge for Staff */
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #202235',
            background: 'rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#6C5DD3',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13
            }}>
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CD'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName || 'ClaimDesk User'}
              </div>
              <div style={{ fontSize: 11, color: '#9EA3B5', textTransform: 'capitalize' }}>
                Administrator
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
