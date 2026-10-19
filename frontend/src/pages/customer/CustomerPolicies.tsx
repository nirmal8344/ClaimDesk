import React, { useEffect, useState } from 'react';
import { policyService } from '../../services/policyService';
import { Policy } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldCheck,
  Car,
  Heart,
  Home,
  MoreVertical
} from 'lucide-react';

export const CustomerPolicies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await policyService.getCustomerPolicies();
      setPolicies(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const counts = {
    ALL: policies.length,
    ACTIVE: policies.filter(p => p.status === 'ACTIVE').length,
    EXPIRED: policies.filter(p => p.status === 'EXPIRED').length,
    CANCELLED: policies.filter(p => p.status === 'CANCELLED').length,
  };

  const filtered = policies.filter(p => {
    if (activeTab === 'ALL') return true;
    return p.status === activeTab;
  });

  const getPolicyIcon = (type: string) => {
    const norm = (type || '').toLowerCase();
    if (norm.includes('motor') || norm.includes('vehicle')) return <Car size={22} color="#6C5DD3" />;
    if (norm.includes('health')) return <Heart size={22} color="#EF4444" />;
    return <Home size={22} color="#3B82F6" />;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>My Policies</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
            Manage and view your insurance policies
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
        >
          All ({counts.ALL})
        </button>
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
        >
          Active ({counts.ACTIVE})
        </button>
        <button
          onClick={() => setActiveTab('EXPIRED')}
          className={`tab-btn ${activeTab === 'EXPIRED' ? 'active' : ''}`}
        >
          Expired ({counts.EXPIRED})
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`tab-btn ${activeTab === 'CANCELLED' ? 'active' : ''}`}
        >
          Cancelled ({counts.CANCELLED})
        </button>
      </div>

      {/* Policies List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading policies...</div>
        ) : filtered.length === 0 ? (
          <div className="app-card" style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <ShieldCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4B5563' }}>No policies found in this category</div>
            <p style={{ fontSize: 13, marginTop: 4 }}>Your insurance policies will be listed here once issued by an administrator.</p>
          </div>
        ) : (
          filtered.map((policy) => (
            <div
              key={policy.id}
              className="app-card"
              style={{
                padding: '22px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#F8F9FD',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getPolicyIcon(policy.policyType)}
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {policy.policyType}
                  </h3>
                  <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span><strong>Policy No:</strong> {policy.policyNumber}</span>
                    <span><strong>Company:</strong> {policy.providerCompany}</span>
                    <span><strong>Coverage:</strong> ₹{policy.coverageAmount?.toLocaleString('en-IN')}</span>
                    <span><strong>Premium:</strong> ₹{policy.premiumAmount?.toLocaleString('en-IN')} / {policy.premiumTerm || 'year'}</span>
                  </div>

                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, display: 'flex', gap: 16 }}>
                    <span>Start: {policy.startDate}</span>
                    <span>End Date: {policy.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Right Status & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <StatusBadge status={policy.status} />
                <button
                  style={{
                    background: 'transparent',
                    color: '#9CA3AF',
                    padding: 6,
                    borderRadius: 6
                  }}
                  title="Policy Actions"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerPolicies;
