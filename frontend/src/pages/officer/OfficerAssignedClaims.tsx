import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { claimService } from '../../services/claimService';
import { Claim, PageResponse } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  ChevronDown
} from 'lucide-react';

export const OfficerAssignedClaims: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = () => {
    if (location.pathname.includes('pending-documents')) return 'Documents Required';
    if (location.pathname.includes('under-review')) return 'Under Review';
    if (location.pathname.includes('assessment')) return 'Assessment';
    if (location.pathname.includes('completed')) return 'Settled';
    return 'ALL';
  };

  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(getInitialTab());
    setPage(0);
  }, [location.pathname]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res: PageResponse<Claim> = await claimService.getOfficerClaims({
        status: activeTab === 'ALL' ? undefined : activeTab,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        claimType: typeFilter === 'ALL' ? undefined : typeFilter,
        search: search.trim() || undefined,
        page,
        size: 10
      });
      setClaims(res.content);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [activeTab, priorityFilter, typeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchClaims();
  };

  const getPageTitle = () => {
    if (location.pathname.includes('pending-documents')) return 'Pending Documents';
    if (location.pathname.includes('under-review')) return 'Claims Under Review';
    if (location.pathname.includes('assessment')) return 'Claims in Assessment';
    if (location.pathname.includes('completed')) return 'Completed Claims';
    return 'Assigned Claims';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{getPageTitle()}</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
          Claims assigned to you for review and processing.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div className="filter-tabs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'Submitted', label: 'New' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Documents Required', label: 'Documents Required' },
            { id: 'Assessment', label: 'In Assessment' },
            { id: 'Settled', label: 'Settled / Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(0); }}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: 320, width: '100%', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search claim ID, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 38, borderRadius: 20, fontSize: 13 }}
          />
        </form>
      </div>

      {/* Filter Dropdowns matching Screenshot 2 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        background: '#FFFFFF',
        padding: '12px 16px',
        borderRadius: 12,
        border: '1px solid #E5E7EB'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4B5563', fontWeight: 600 }}>
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
          className="form-select"
          style={{ width: 'auto', fontSize: 13, padding: '6px 12px' }}
        >
          <option value="ALL">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Claim Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          className="form-select"
          style={{ width: 'auto', fontSize: 13, padding: '6px 12px' }}
        >
          <option value="ALL">All Types</option>
          <option value="Vehicle Damage">Vehicle Damage</option>
          <option value="Property Damage">Property Damage</option>
          <option value="Health Insurance">Health Insurance</option>
          <option value="Travel">Travel</option>
          <option value="Electronics/Device">Electronics/Device</option>
        </select>

        {(priorityFilter !== 'ALL' || typeFilter !== 'ALL' || search) && (
          <button
            onClick={() => {
              setPriorityFilter('ALL');
              setTypeFilter('ALL');
              setSearch('');
              setPage(0);
            }}
            style={{ background: 'transparent', color: '#6C5DD3', fontSize: 12.5, fontWeight: 600, padding: '4px 8px' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table matching Screenshot 2 */}
      <div className="app-table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Customer</th>
              <th>Policy Type</th>
              <th>Submitted On</th>
              <th>Status</th>
              <th>Priority</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 36, color: '#6B7280' }}>
                  Loading assigned claims...
                </td>
              </tr>
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>
                  No claims found matching selected filters.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr
                  key={claim.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/officer/claims/${claim.id}`)}
                >
                  <td style={{ fontWeight: 700, color: '#111827' }}>
                    {claim.claimNumber}
                  </td>
                  <td>{claim.customerName}</td>
                  <td>{claim.policyType || claim.claimType}</td>
                  <td>{claim.createdAt?.split('T')[0] || '12 Oct 2024'}</td>
                  <td>
                    <StatusBadge status={claim.status} />
                  </td>
                  <td>
                    <StatusBadge status={claim.priority || 'Medium'} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/officer/claims/${claim.id}`);
                      }}
                      style={{ background: 'transparent', color: '#6B7280', padding: 6 }}
                    >
                      <MoreVertical size={16} />
                    </button>
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
