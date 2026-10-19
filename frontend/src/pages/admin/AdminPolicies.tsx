import React, { useEffect, useState } from 'react';
import { policyService } from '../../services/policyService';
import { API_BASE_URL } from '../../services/api';
import { Policy, PageResponse } from '../../types';
import {
  Search,
  ShieldPlus,
  Car,
  Heart,
  Home,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminPolicies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal: Create Policy
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerId, setCustomerId] = useState('9'); // Default Arun Kumar
  const [policyNumber, setPolicyNumber] = useState(`POL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [policyType, setPolicyType] = useState('Motor Comprehensive');
  const [providerCompany, setProviderCompany] = useState('National Insurance');
  const [coverageAmount, setCoverageAmount] = useState('500000');
  const [premiumAmount, setPremiumAmount] = useState('18500');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2025-01-01');
  const [coverageDescription, setCoverageDescription] = useState('Comprehensive coverage including own damage and third-party liability.');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res: PageResponse<Policy> = await policyService.getAllPoliciesAdmin({
        search: search.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: 10
      });
      setPolicies(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchPolicies();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    try {
      await fetch(`${API_BASE_URL}/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('claimdesk_token')}`
        },
        body: JSON.stringify({
          customerId: Number(customerId),
          policyNumber,
          policyType,
          providerCompany,
          coverageAmount: Number(coverageAmount),
          premiumAmount: Number(premiumAmount),
          startDate,
          endDate,
          coverageDescription
        })
      });
      setMsg({ type: 'success', text: `Policy #${policyNumber} registered successfully!` });
      setShowAddModal(false);
      setPolicyNumber(`POL-${Math.floor(100000 + Math.random() * 900000)}`);
      fetchPolicies();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to issue policy.' });
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (amt: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const getPolicyIcon = (type: string) => {
    const norm = (type || '').toLowerCase();
    if (norm.includes('motor') || norm.includes('vehicle')) return <Car size={18} color="#6C5DD3" />;
    if (norm.includes('health')) return <Heart size={18} color="#EF4444" />;
    return <Home size={18} color="#3B82F6" />;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Policy Registry</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
            Active coverages, policyholder linkages, and insurance underwriting.
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setMsg(null); }}
          className="app-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13.5 }}
        >
          <ShieldPlus size={16} /> Issue New Policy
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
      <div className="app-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 300px', maxWidth: 420 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search policy #, holder name, or provider..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="app-input"
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Policies Table */}
      <div className="app-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading policies...</div>
        ) : policies.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>No policies found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Policy Details</th>
                  <th>Policyholder</th>
                  <th>Coverage</th>
                  <th>Premium</th>
                  <th>Validity Term</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: '#F3F4F8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getPolicyIcon(p.policyType)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{p.policyNumber}</div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>{p.policyType} • {p.providerCompany}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{p.customerName || `Customer #${p.customerId}`}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{p.customerEmail || 'Insured Member'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{formatCurrency(p.coverageAmount)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#4B5563' }}>{formatCurrency(p.premiumAmount)} / yr</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: '#374151' }}>
                        {p.startDate} to {p.endDate}
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
                        background: p.status === 'ACTIVE' ? '#ECFDF5' : '#FFFBEB',
                        color: p.status === 'ACTIVE' ? '#059669' : '#D97706'
                      }}>
                        {p.status}
                      </span>
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

      {/* Modal: Issue Policy */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Underwrite New Policy"
        subtitle="Issue and register a new active policy for an existing customer."
        maxWidth={560}
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
              form="create-policy-form"
              disabled={creating}
              className="app-btn-primary"
            >
              {creating ? 'Issuing...' : 'Issue Policy'}
            </button>
          </>
        }
      >
        <form id="create-policy-form" onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="app-label">Customer ID</label>
              <input
                type="number"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="app-label">Policy Number</label>
              <input
                type="text"
                required
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="app-label">Policy Type</label>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              >
                <option value="Motor Comprehensive">Motor Comprehensive</option>
                <option value="Health Individual">Health Individual</option>
                <option value="Property Home">Property Home</option>
                <option value="Travel Global">Travel Global</option>
              </select>
            </div>
            <div>
              <label className="app-label">Provider Company</label>
              <input
                type="text"
                required
                value={providerCompany}
                onChange={(e) => setProviderCompany(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="app-label">Coverage Amount (INR)</label>
              <input
                type="number"
                required
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="app-label">Annual Premium (INR)</label>
              <input
                type="number"
                required
                value={premiumAmount}
                onChange={(e) => setPremiumAmount(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="app-label">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="app-label">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label className="app-label">Coverage Description</label>
            <textarea
              rows={2}
              value={coverageDescription}
              onChange={(e) => setCoverageDescription(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
