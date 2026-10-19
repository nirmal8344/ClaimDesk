import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

export const CustomerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const getNotifIcon = (title: string) => {
    const norm = title.toLowerCase();
    if (norm.includes('document')) return <AlertCircle size={18} color="#EF4444" />;
    if (norm.includes('review')) return <Clock size={18} color="#D97706" />;
    if (norm.includes('approved')) return <CheckCircle2 size={18} color="#059669" />;
    if (norm.includes('settled')) return <CheckCircle2 size={18} color="#2563EB" />;
    return <Bell size={18} color="#6C5DD3" />;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Notifications</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
            Stay updated about your claims.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary"
            style={{ fontSize: 13, padding: '7px 14px' }}
          >
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="app-card" style={{ padding: '12px 0' }}>
        {loading ? (
          <div style={{ padding: 36, textAlign: 'center', color: '#6B7280' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4B5563' }}>No notifications yet</div>
            <p style={{ fontSize: 13, marginTop: 4 }}>You will be notified here when your claim status changes.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                background: n.isRead ? 'transparent' : '#FAF8FF',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ marginTop: 2 }}>
                  {getNotifIcon(n.title)}
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#4B5563', marginTop: 3 }}>
                    {n.message}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                {n.createdAt?.replace('T', ' ').slice(0, 16)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
