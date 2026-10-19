import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User, PageResponse } from '../../types';
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal: Add Officer
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Claims Processing');
  const [employeeId, setEmployeeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialPassword, setInitialPassword] = useState('Officer@123');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res: PageResponse<User> = await adminService.getOfficers({
        search: search.trim() || undefined,
        page,
        size: 10
      });
      setOfficers(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchOfficers();
  };

  const toggleStatus = async (officer: User) => {
    const newStatus = officer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateOfficerStatus(officer.id, newStatus);
      setOfficers(prev =>
        prev.map(o => (o.id === officer.id ? { ...o, status: newStatus as 'ACTIVE' | 'INACTIVE' } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    try {
      await adminService.createOfficer({
        fullName,
        email,
        department,
        employeeId: employeeId || `OFF-${Math.floor(100 + Math.random() * 900)}`,
        phoneNumber,
        initialPassword
      });
      setMsg({ type: 'success', text: `Officer ${fullName} registered successfully!` });
      setShowAddModal(false);
      // Reset form
      setFullName('');
      setEmail('');
      setEmployeeId('');
      setPhoneNumber('');
      fetchOfficers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to create officer.' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Claim Officers</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
            Internal claims adjuster workforce and caseload assignments.
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setMsg(null); }}
          className="app-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13.5 }}
        >
          <UserPlus size={16} /> Add Claim Officer
        </button>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: msg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: msg.type === 'success' ? '#059669' : '#DC2626',
          fontSize: 13.5,
          fontWeight: 500
        }}>
          {msg.text}
        </div>
      )}

      {/* Search Toolbar */}
      <div className="app-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 420 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by officer name, employee ID, or email..."
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

      {/* Officer Table */}
      <div className="app-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading officers...</div>
        ) : officers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>No officers found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{o.fullName}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Mail size={12} /> {o.email}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '3px 8px', borderRadius: 4 }}>
                        {o.employeeId || `OFF-00${o.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: '#374151' }}>{o.department || 'Claims Processing'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={13} color="#9CA3AF" /> {o.phoneNumber || '+91 98765 43210'}
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
                        background: o.status === 'ACTIVE' ? '#ECFDF5' : '#FEF2F2',
                        color: o.status === 'ACTIVE' ? '#059669' : '#DC2626'
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => toggleStatus(o)}
                        className={o.status === 'ACTIVE' ? 'app-btn-secondary' : 'app-btn-primary'}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12.5,
                          background: o.status === 'ACTIVE' ? undefined : '#059669'
                        }}
                      >
                        {o.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

      {/* Modal: Add Officer */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Claim Officer"
        subtitle="Register a new officer account with department specialization."
        maxWidth={500}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-officer-form"
              disabled={creating}
              className="app-btn-primary"
            >
              {creating ? 'Saving...' : 'Create Officer'}
            </button>
          </>
        }
      >
        <form id="create-officer-form" onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="app-label">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh V"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="app-label">Official Email</label>
            <input
              type="email"
              required
              placeholder="e.g. ramesh.v@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="app-label">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              >
                <option value="Claims Processing">Claims Processing</option>
                <option value="Motor Claims">Motor Claims</option>
                <option value="Health Claims">Health Claims</option>
                <option value="Property Claims">Property Claims</option>
                <option value="Travel Claims">Travel Claims</option>
              </select>
            </div>
            <div>
              <label className="app-label">Employee ID</label>
              <input
                type="text"
                placeholder="e.g. OFF-008"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label className="app-label">Phone Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="app-label">Initial Password</label>
            <input
              type="text"
              required
              value={initialPassword}
              onChange={(e) => setInitialPassword(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
