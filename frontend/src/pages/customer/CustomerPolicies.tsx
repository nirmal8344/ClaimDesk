import React, { useEffect, useState } from 'react';
import { policyService } from '../../services/policyService';
import { Policy } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  ShieldCheck,
  ShieldPlus,
  Car,
  Heart,
  Home,
  Info,
  RefreshCw,
  Calendar,
  Building2,
  FileText,
  IndianRupee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CustomerPolicies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('ALL');
  const [loading, setLoading] = useState(true);

  // Register Policy Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyType, setPolicyType] = useState('Motor Comprehensive');
  const [providerCompany, setProviderCompany] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [premiumTerm, setPremiumTerm] = useState('year');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverageDescription, setCoverageDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Policy Details Modal State
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const generateRandomPolicyNumber = () => {
    return `POL-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const initForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setPolicyNumber(generateRandomPolicyNumber());
    setPolicyType('Motor Comprehensive');
    setProviderCompany('');
    setCoverageAmount('');
    setPremiumAmount('');
    setPremiumTerm('year');
    setStartDate(today);
    setEndDate(nextYear);
    setCoverageDescription('');
    setFormError(null);
  };

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await policyService.getCustomerPolicies();
      setPolicies(res || []);
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
    if (norm.includes('motor') || norm.includes('vehicle') || norm.includes('car')) return <Car size={22} color="#6C5DD3" />;
    if (norm.includes('health') || norm.includes('medic')) return <Heart size={22} color="#EF4444" />;
    return <Home size={22} color="#3B82F6" />;
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹ 0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenAddModal = () => {
    initForm();
    setShowAddModal(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validations
    if (!policyType.trim()) {
      setFormError('Policy category / type is required.');
      return;
    }
    if (!providerCompany.trim()) {
      setFormError('Insurance provider company name is required.');
      return;
    }
    const numCoverage = Number(coverageAmount);
    if (isNaN(numCoverage) || numCoverage <= 0) {
      setFormError('Coverage amount must be a positive number.');
      return;
    }
    const numPremium = Number(premiumAmount);
    if (isNaN(numPremium) || numPremium < 0) {
      setFormError('Premium amount must be positive or zero.');
      return;
    }
    if (!startDate) {
      setFormError('Start date is required.');
      return;
    }
    if (!endDate) {
      setFormError('Expiry / End date is required.');
      return;
    }
    if (endDate < startDate) {
      setFormError('Expiry date cannot be earlier than policy start date.');
      return;
    }

    try {
      setSubmitting(true);
      const newPolicy = await policyService.createCustomerPolicy({
        policyNumber: policyNumber.trim() || undefined,
        policyType: policyType.trim(),
        providerCompany: providerCompany.trim(),
        coverageAmount: numCoverage,
        premiumAmount: numPremium,
        premiumTerm,
        startDate,
        endDate,
        coverageDescription: coverageDescription.trim() || undefined
      });

      setShowAddModal(false);
      setSuccessMsg(`Policy #${newPolicy.policyNumber} has been successfully registered!`);
      // Immediate UI update
      await fetchPolicies();
      setActiveTab('ALL');

      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to register policy. Please verify all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>My Policies</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
            Register, manage, and view your active insurance policies
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="app-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13.5 }}
          id="btn-register-policy"
        >
          <ShieldPlus size={17} /> Register Policy
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          fontSize: 13.5,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

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
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Click <strong>"Register Policy"</strong> above to register an existing policy or add a new one.
            </p>
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
                    <span><strong>Insurer:</strong> {policy.providerCompany}</span>
                    <span><strong>Coverage:</strong> {formatCurrency(policy.coverageAmount)}</span>
                    <span><strong>Premium:</strong> {formatCurrency(policy.premiumAmount)} / {policy.premiumTerm || 'year'}</span>
                  </div>

                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, display: 'flex', gap: 16 }}>
                    <span><strong>Start:</strong> {policy.startDate}</span>
                    <span><strong>Expiry Date:</strong> {policy.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Right Status & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusBadge status={policy.status} />
                <button
                  onClick={() => setSelectedPolicy(policy)}
                  className="app-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '6px 12px' }}
                  title="View Policy Details"
                >
                  <Info size={15} /> Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Policy Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Insurance Policy"
        subtitle="Add your insurance policy details to file and track claims seamlessly."
        maxWidth={580}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="app-btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="register-policy-form"
              disabled={submitting}
              className="app-btn-primary"
            >
              {submitting ? 'Registering...' : 'Register Policy'}
            </button>
          </>
        }
      >
        <form id="register-policy-form" onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span>{formError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="app-label">Policy Number *</label>
                <button
                  type="button"
                  onClick={() => setPolicyNumber(generateRandomPolicyNumber())}
                  style={{ background: 'transparent', border: 'none', color: '#6C5DD3', fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  <RefreshCw size={11} /> Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g. POL-123456"
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="app-label">Policy Category / Type *</label>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              >
                <option value="Motor Comprehensive">Motor Comprehensive</option>
                <option value="Health Individual">Health Individual</option>
                <option value="Health Family Floater">Health Family Floater</option>
                <option value="Property Home">Property Home</option>
                <option value="Travel Global">Travel Global</option>
                <option value="Electronics Protection">Electronics Protection</option>
              </select>
            </div>
          </div>

          <div>
            <label className="app-label">Insurer / Provider Company *</label>
            <input
              type="text"
              required
              value={providerCompany}
              onChange={(e) => setProviderCompany(e.target.value)}
              placeholder="e.g. Star Health, HDFC ERGO, Aegis Insurance"
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="app-label">Coverage Amount (INR) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(e.target.value)}
                placeholder="e.g. 500000"
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="app-label">Premium Amount (INR) *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={premiumAmount}
                  onChange={(e) => setPremiumAmount(e.target.value)}
                  placeholder="e.g. 12000"
                  className="app-input"
                  style={{ flex: 1 }}
                />
                <select
                  value={premiumTerm}
                  onChange={(e) => setPremiumTerm(e.target.value)}
                  className="app-input"
                  style={{ width: 90 }}
                >
                  <option value="year">/ yr</option>
                  <option value="month">/ mo</option>
                  <option value="quarter">/ qtr</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="app-label">Policy Start Date *</label>
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
              <label className="app-label">Expiry / End Date *</label>
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
              placeholder="e.g. Comprehensive own damage with zero depreciation and 3rd party cover"
              className="app-input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>

      {/* Policy Details Inspection Modal */}
      {selectedPolicy && (
        <Modal
          isOpen={!!selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          title={`Policy Details #${selectedPolicy.policyNumber}`}
          subtitle="Complete policy schedule and coverage parameters."
          maxWidth={540}
          footer={
            <button
              type="button"
              onClick={() => setSelectedPolicy(null)}
              className="app-btn-primary"
            >
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748B' }}>Status</span>
                <div style={{ marginTop: 2 }}><StatusBadge status={selectedPolicy.status} /></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Policy Number</span>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>{selectedPolicy.policyNumber}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div>
                <span style={{ color: '#64748B' }}>Category / Type:</span>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>{selectedPolicy.policyType}</div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Insurer / Company:</span>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>{selectedPolicy.providerCompany}</div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Sum Insured (Coverage):</span>
                <div style={{ fontWeight: 700, color: '#059669', fontSize: 14 }}>{formatCurrency(selectedPolicy.coverageAmount)}</div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Premium:</span>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>
                  {formatCurrency(selectedPolicy.premiumAmount)} / {selectedPolicy.premiumTerm || 'year'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Effective Date:</span>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>{selectedPolicy.startDate}</div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Expiry Date:</span>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>{selectedPolicy.endDate}</div>
              </div>
            </div>

            {selectedPolicy.coverageDescription && (
              <div style={{ padding: '10px 12px', background: '#F1F5F9', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>Coverage Inclusions:</span>
                <p style={{ marginTop: 4, color: '#334155', lineHeight: 1.5 }}>{selectedPolicy.coverageDescription}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerPolicies;
