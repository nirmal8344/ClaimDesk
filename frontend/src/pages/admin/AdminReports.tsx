import React, { useState } from 'react';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Filter,
  RotateCcw,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ReportCategory {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export const AdminReports: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const reportCategories: ReportCategory[] = [
    {
      id: 'claims',
      type: 'claims',
      title: 'Claims Master Audit Trail',
      description: 'Comprehensive dataset of all registered claims including incident dates, loss estimates, policy linkages, officer allocations, and resolution statuses.',
      icon: <BarChart3 size={22} />,
      iconBg: '#EDE9FE',
      iconColor: '#6C5DD3'
    },
    {
      id: 'customer_claims',
      type: 'customer_claims',
      title: 'Customer Claim History',
      description: 'Customer-specific claim registers detailing claimant contact info, linked policy numbers, incident histories, requested sums, and resolution progress.',
      icon: <Users size={22} />,
      iconBg: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      id: 'settlements',
      type: 'settlements',
      title: 'Settlement & Disbursement Register',
      description: 'Financial disbursement registers detailing approved claim sums, bank transaction references, payment dates, settlement statuses, and remarks.',
      icon: <DollarSign size={22} />,
      iconBg: '#ECFDF5',
      iconColor: '#059669'
    },
    {
      id: 'assessments',
      type: 'assessments',
      title: 'Claim Assessments Audit',
      description: 'Independent loss adjuster evaluations, eligible vs non-eligible loss variances, surveyor recommendations, and technical inspection remarks.',
      icon: <ShieldCheck size={22} />,
      iconBg: '#E0F2FE',
      iconColor: '#0284C7'
    },
    {
      id: 'documents',
      type: 'documents',
      title: 'Documents & Evidence Register',
      description: 'Document audit logs of submitted proof, RC certificates, medical records, photographic damage evidence, file sizes, and officer review verdicts.',
      icon: <FileText size={22} />,
      iconBg: '#FCE7F3',
      iconColor: '#DB2777'
    },
    {
      id: 'officers',
      type: 'officers',
      title: 'Officer Throughput & SLA',
      description: 'Caseload efficiency summary by claims adjuster: assigned volume, reviews pending, documents requested, approved and settled claim distributions.',
      icon: <TrendingUp size={22} />,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB'
    },
    {
      id: 'duration',
      type: 'duration',
      title: 'Processing Duration & SLA',
      description: 'Turnaround time tracking from submission date to current stage, days in processing, queue priority flags, and officer bottleneck analytics.',
      icon: <Clock size={22} />,
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED'
    }
  ];

  const handleExport = async (format: 'csv' | 'excel' | 'pdf', type: string) => {
    const key = `${format}-${type}`;
    setDownloading(key);
    setFeedback(null);

    try {
      const token = getAuthToken();
      const params = new URLSearchParams({ type });

      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`${API_BASE_URL}/reports/export/${format}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed with HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const ext = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'pdf';
      const today = new Date().toISOString().split('T')[0];
      a.download = `claimdesk_${type}_${today}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: `Report exported successfully: ${type.toUpperCase()} (${ext.toUpperCase()})`
      });

      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to generate report export. Please check server logs.'
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setFeedback(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Compliance & Audit Reports</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
          Export regulatory statements, claim audit trails, settlement disbursements, and operational analytics.
        </p>
      </div>

      {/* Global Feedback Alert */}
      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`,
          color: feedback.type === 'success' ? '#065F46' : '#B91C1C',
          fontSize: 13.5,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} color="#059669" />
          ) : (
            <AlertCircle size={18} color="#DC2626" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Active Export Filters Card */}
      <div className="app-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
            <Filter size={16} color="#6C5DD3" />
            <span>Active Export Filters</span>
          </div>
          {(statusFilter !== 'ALL' || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6C5DD3',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: '#64748B' }}>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="app-input"
              style={{ padding: '6px 12px', fontSize: 13, minWidth: 150 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Documents Required">Documents Required</option>
              <option value="Approved">Approved</option>
              <option value="Settled">Settled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: '#64748B' }}>From Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="app-input"
              style={{ padding: '5px 10px', fontSize: 13 }}
            />
          </div>

          {/* Date Range End */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: '#64748B' }}>To Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="app-input"
              style={{ padding: '5px 10px', fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 20 }}>
        {reportCategories.map((report) => (
          <div
            key={report.id}
            className="app-card"
            style={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 20
            }}
          >
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: report.iconBg,
                color: report.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                {report.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{report.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.5 }}>
                {report.description}
              </p>
            </div>

            {/* Export Buttons: CSV, Excel, PDF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                onClick={() => handleExport('csv', report.type)}
                disabled={downloading === `csv-${report.type}`}
                className="app-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  padding: '8px 10px'
                }}
                title={`Export ${report.title} as CSV`}
              >
                <FileDown size={15} />
                <span>{downloading === `csv-${report.type}` ? '...' : 'CSV'}</span>
              </button>

              <button
                onClick={() => handleExport('excel', report.type)}
                disabled={downloading === `excel-${report.type}`}
                className="app-btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  padding: '8px 10px',
                  background: '#059669',
                  borderColor: '#059669'
                }}
                title={`Export ${report.title} as Excel`}
              >
                <FileSpreadsheet size={15} />
                <span>{downloading === `excel-${report.type}` ? '...' : 'Excel'}</span>
              </button>

              <button
                onClick={() => handleExport('pdf', report.type)}
                disabled={downloading === `pdf-${report.type}`}
                className="app-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  padding: '8px 10px',
                  color: '#DC2626',
                  borderColor: '#FCA5A5'
                }}
                title={`Export ${report.title} as PDF`}
              >
                <FileText size={15} />
                <span>{downloading === `pdf-${report.type}` ? '...' : 'PDF'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
