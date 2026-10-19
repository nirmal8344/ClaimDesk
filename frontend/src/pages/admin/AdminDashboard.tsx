import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { claimService } from '../../services/claimService';
import { AdminDashboardData, Claim } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Filter
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, claimsRes] = await Promise.all([
          dashboardService.getAdminDashboard(),
          claimService.getOfficerClaims({ page: 0, size: 6 }).catch(() => ({ content: [] }))
        ]);
        setData(dashRes);
        setRecentClaims(claimsRes.content || []);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
        Loading enterprise metrics...
      </div>
    );
  }

  // Monthly trends data from backend
  const monthlyData = data?.monthlyClaims?.length ? data.monthlyClaims : [];

  const pieColors = ['#6C5DD3', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const statusPieData = data?.claimsByStatus && Object.keys(data.claimsByStatus).length > 0
    ? Object.entries(data.claimsByStatus).map(([name, value], i) => ({
        name,
        value: Number(value),
        color: pieColors[i % pieColors.length]
      }))
    : [];

  const formatCurrency = (amt: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: '#111827', margin: 0 }}>
            Enterprise Claims Overview 🛡️
          </h1>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0 0' }}>
            Administrator portal: system health, real-time throughput, and claim analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/admin/claims')}
            className="app-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12.5 }}
          >
            <Filter size={15} /> Manage Claims
          </button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 10
      }}>
        {/* Total Claims */}
        <div className="app-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0
          }}>
            <FileText size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Total Claims</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {data?.totalClaims || 0}
            </div>
          </div>
        </div>

        {/* Under Review */}
        <div className="app-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: '#F3E8FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7E22CE',
            flexShrink: 0
          }}>
            <Clock size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Under Review</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {data?.underReview || 0}
            </div>
          </div>
        </div>

        {/* Documents Pending */}
        <div className="app-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: '#FFFBEB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706',
            flexShrink: 0
          }}>
            <AlertCircle size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Docs Pending</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {data?.documentsPending || 0}
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="app-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            flexShrink: 0
          }}>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Approved</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {data?.approved || 0}
            </div>
          </div>
        </div>

        {/* Settled Claims */}
        <div className="app-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB',
            flexShrink: 0
          }}>
            <TrendingUp size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Settled</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {data?.settled || 0}
            </div>
          </div>
        </div>

        {/* Total Settlement Amount */}
        <div className="app-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: '#FAF5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6C5DD3',
            flexShrink: 0
          }}>
            <DollarSign size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Disbursed</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatCurrency(data?.totalSettlementAmount || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12 }}>
        {/* Monthly Submission & Settlement Bar Chart */}
        <div className="app-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Monthly Claims Throughput</h2>
              <p style={{ fontSize: 11.5, color: '#6B7280', margin: '2px 0 0 0' }}>Submitted vs Settled Claims</p>
            </div>
          </div>
          <div style={{ height: 160, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#E5E7EB" />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#E5E7EB" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Bar dataKey="submitted" name="Submitted" fill="#6C5DD3" radius={[3, 3, 0, 0]} />
                <Bar dataKey="settled" name="Settled" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims Status Breakdown Pie Chart */}
        <div className="app-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Status Distribution</h2>
              <p style={{ fontSize: 11.5, color: '#6B7280', margin: '2px 0 0 0' }}>Real-time status allocation</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <div style={{ flex: 1, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 125 }}>
              {statusPieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ color: '#6B7280', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <div
          onClick={() => navigate('/admin/customers')}
          className="app-card"
          style={{ padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EDE9FE', color: '#6C5DD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Customers</div>
            <div style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Manage customer accounts</div>
          </div>
          <ArrowRight size={15} color="#9CA3AF" />
        </div>

        <div
          onClick={() => navigate('/admin/officers')}
          className="app-card"
          style={{ padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserCheck size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Claim Officers</div>
            <div style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Workflows & caseload</div>
          </div>
          <ArrowRight size={15} color="#9CA3AF" />
        </div>

        <div
          onClick={() => navigate('/admin/policies')}
          className="app-card"
          style={{ padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Policy Registry</div>
            <div style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Active coverages & underwriting</div>
          </div>
          <ArrowRight size={15} color="#9CA3AF" />
        </div>

        <div
          onClick={() => navigate('/admin/reports')}
          className="app-card"
          style={{ padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Audit & Reports</div>
            <div style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Export CSV / Excel statements</div>
          </div>
          <ArrowRight size={15} color="#9CA3AF" />
        </div>
      </div>

      {/* Recent Claims Table */}
      <div className="app-card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Recent System Claims</h2>
            <p style={{ fontSize: 11.5, color: '#6B7280', margin: '2px 0 0 0' }}>Latest submissions requiring supervision</p>
          </div>
          <Link
            to="/admin/claims"
            style={{ fontSize: 12.5, color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            View All Claims <ArrowRight size={14} />
          </Link>
        </div>

        {recentClaims.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#6B7280', fontSize: 12.5 }}>
            No recent claims found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: 200, overflowY: 'auto' }}>
            <table className="app-table" style={{ fontSize: 12.5 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '8px 12px' }}>Claim No</th>
                  <th style={{ padding: '8px 12px' }}>Customer</th>
                  <th style={{ padding: '8px 12px' }}>Policy Type</th>
                  <th style={{ padding: '8px 12px' }}>Estimated Loss</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Assigned Officer</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.map((claim) => (
                  <tr key={claim.id}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#111827' }}>{claim.claimNumber}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.customerName}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{claim.customerEmail}</div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>{claim.policyType}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{formatCurrency(claim.estimatedLoss)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <StatusBadge status={claim.status} />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {claim.assignedOfficerName ? (
                        <span style={{ fontSize: 12, color: '#111827', fontWeight: 500 }}>
                          {claim.assignedOfficerName}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 600 }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        onClick={() => navigate(`/officer/claims/${claim.id}`)}
                        className="app-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
