import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { claimService } from '../../services/claimService';
import { Claim, PageResponse } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Search,
  Filter,
  MoreVertical,
  Plus,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3
} from 'lucide-react';

export const CustomerClaims: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res: PageResponse<Claim> = await claimService.getCustomerClaims({
        status: activeTab === 'ALL' ? undefined : activeTab,
        search: search.trim() || undefined,
        page,
        size: 10
      });
      setClaims(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [activeTab, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchClaims();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>My Claims</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
            Track the status of all your claims.
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/new-claim')}
          className="btn-dark"
          style={{ padding: '9px 18px', borderRadius: 10 }}
        >
          <Plus size={16} />
          <span>New Claim</span>
        </button>
      </div>

      {/* Search and Tabs Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: 440, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search claims, policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 40, borderRadius: 20 }}
          />
        </form>

        <div className="filter-tabs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'Draft', label: 'Drafts' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Documents Required', label: 'Documents Required' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Settled', label: 'Settled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(0); }}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="app-table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Policy Type</th>
              <th>Incident Date</th>
              <th>Submitted On</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 36, color: '#6B7280' }}>
                  Loading claims...
                </td>
              </tr>
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>
                  No claims found matching your filter criteria.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr
                  key={claim.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (claim.status === 'Draft') {
                      navigate(`/customer/new-claim?draftId=${claim.id}`);
                    } else {
                      navigate(`/customer/claims/${claim.id}`);
                    }
                  }}
                >
                  <td style={{ fontWeight: 700, color: '#111827' }}>
                    {claim.claimNumber}
                  </td>
                  <td>{claim.policyType || claim.claimType}</td>
                  <td>{claim.incidentDate}</td>
                  <td>{claim.createdAt?.split('T')[0]}</td>
                  <td>
                    <StatusBadge status={claim.status} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {claim.status === 'Draft' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/new-claim?draftId=${claim.id}`);
                        }}
                        style={{
                          background: '#EEF2FF',
                          color: '#4F46E5',
                          border: '1px solid #C7D2FE',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title="Resume Draft"
                      >
                        <Edit3 size={13} />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/claims/${claim.id}`);
                        }}
                        style={{ background: 'transparent', color: '#6B7280', padding: 6, borderRadius: 6, cursor: 'pointer' }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#4B5563', padding: '0 8px' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
