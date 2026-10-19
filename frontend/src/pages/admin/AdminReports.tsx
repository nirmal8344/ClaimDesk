import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import {
  FileDown,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  CheckCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'excel', type: string) => {
    const key = `${format}-${type}`;
    setDownloading(key);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reports/export/${format}?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claimdesk_${type}_export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert('Report generated and downloaded.');
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Compliance & Audit Reports</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
          Export regulatory statements, claim audit trails, and settlement disbursements.
        </p>
      </div>

      {/* Report Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Claims Master Report */}
        <div className="app-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#EDE9FE',
              color: '#6C5DD3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Claims Master Audit Trail</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.5 }}>
              Comprehensive dataset of all registered claims including incident dates, loss estimates, officer allocations, and resolution statuses.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleExport('csv', 'claims')}
              disabled={downloading === 'csv-claims'}
              className="app-btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}
            >
              <FileDown size={16} /> CSV
            </button>
            <button
              onClick={() => handleExport('excel', 'claims')}
              disabled={downloading === 'excel-claims'}
              className="app-btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        </div>

        {/* Financial Disbursements Report */}
        <div className="app-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <DollarSign size={22} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Settlement & Payout Log</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.5 }}>
              Financial disbursement registers detailing approved claim sums, bank transaction references, payment dates, and recipient accounts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleExport('csv', 'settlements')}
              disabled={downloading === 'csv-settlements'}
              className="app-btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}
            >
              <FileDown size={16} /> CSV
            </button>
            <button
              onClick={() => handleExport('excel', 'settlements')}
              disabled={downloading === 'excel-settlements'}
              className="app-btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, background: '#059669' }}
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        </div>

        {/* Officer Performance Report */}
        <div className="app-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Officer Throughput & SLA</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.5 }}>
              Caseload efficiency summary by adjuster: turnaround times, pending document requests, loss assessment variance, and completion ratios.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleExport('csv', 'officers')}
              disabled={downloading === 'csv-officers'}
              className="app-btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}
            >
              <FileDown size={16} /> CSV
            </button>
            <button
              onClick={() => handleExport('excel', 'officers')}
              disabled={downloading === 'excel-officers'}
              className="app-btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, background: '#2563EB' }}
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
