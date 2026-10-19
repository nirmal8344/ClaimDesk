import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User, PageResponse } from '../../types';
import {
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res: PageResponse<User> = await adminService.getCustomers({
        search: search.trim() || undefined,
        page,
        size: 10
      });
      setCustomers(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCustomers();
  };

  const toggleStatus = async (customer: User) => {
    const newStatus = customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setUpdatingId(customer.id);
    try {
      await adminService.updateCustomerStatus(customer.id, newStatus);
      setCustomers(prev =>
        prev.map(c => (c.id === customer.id ? { ...c, status: newStatus as 'ACTIVE' | 'INACTIVE' } : c))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Registered Policyholders</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
          Customer directory with account status and policy verification.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="app-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 420 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input"
              style={{ paddingLeft: 36, width: '100%', fontSize: 13.5 }}
            />
          </div>
          <button type="submit" className="app-btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
            Search
          </button>
        </form>
      </div>

      {/* Customer Table */}
      <div className="app-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading customers...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>No customers found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{c.fullName}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Mail size={12} /> {c.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={13} color="#9CA3AF" /> {c.phoneNumber || 'N/A'}
                      </div>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ fontSize: 12.5, color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.address || 'Chennai, India'}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: c.status === 'ACTIVE' ? '#ECFDF5' : '#FEF2F2',
                        color: c.status === 'ACTIVE' ? '#059669' : '#DC2626'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: '#6B7280' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active Member'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => toggleStatus(c)}
                        disabled={updatingId === c.id}
                        className={c.status === 'ACTIVE' ? 'app-btn-secondary' : 'app-btn-primary'}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12.5,
                          background: c.status === 'ACTIVE' ? undefined : '#059669'
                        }}
                      >
                        {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 13,
          color: '#6B7280'
        }}>
          <span>Page {page + 1} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="app-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12.5 }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="app-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12.5 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
