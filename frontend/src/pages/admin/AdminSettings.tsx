import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { SystemSetting } from '../../types';
import {
  Settings,
  FolderKanban,
  Save,
  Plus,
  CheckCircle,
  X
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sets, cats] = await Promise.all([
        adminService.getSettings().catch(() => []),
        adminService.getCategories().catch(() => [])
      ]);
      setSettings(sets);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSetting = async (key: string, value: string, category?: string) => {
    setSavingKey(key);
    setMsg(null);
    try {
      await adminService.updateSetting(key, value, category);
      setMsg({ type: 'success', text: `Setting "${key}" updated successfully!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update setting.' });
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCat(true);
    setMsg(null);
    try {
      await adminService.addCategory({ name: catName, description: catDesc, status: 'ACTIVE' });
      setMsg({ type: 'success', text: `Category "${catName}" added!` });
      setShowCatModal(false);
      setCatName('');
      setCatDesc('');
      loadData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to add category.' });
    } finally {
      setSavingCat(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>System Settings & Categories</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
          Platform rules, SLA thresholds, security settings, and claim classification taxonomies.
        </p>
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

      {/* Claim Categories Section */}
      <div className="app-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderKanban size={18} color="var(--color-primary)" /> Claim Categories
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Enabled lines of insurance available to claimants</p>
          </div>
          <button
            onClick={() => setShowCatModal(true)}
            className="app-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Plus size={15} /> Add Category
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {categories.map((cat, i) => (
            <div key={cat.id || i} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: '#F8F9FD' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{cat.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: 4 }}>
                  {cat.status || 'ACTIVE'}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#6B7280', marginTop: 4 }}>
                {cat.description || 'Insurance coverage classification.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System Configurations Section */}
      <div className="app-card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} color="var(--color-primary)" /> System Configuration Parameters
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            SLA turnaround limits, maximum file attachment quotas, and approval rules
          </p>
        </div>

        {settings.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>
            No dynamic settings found. System defaults active.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {settings.map((s) => (
              <div key={s.id || s.settingKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: 13.5 }}>{s.settingKey}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Category: {s.category || 'General'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="text"
                    defaultValue={s.settingValue}
                    id={`setting-${s.settingKey}`}
                    className="app-input"
                    style={{ width: 180, fontSize: 13 }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`setting-${s.settingKey}`) as HTMLInputElement;
                      if (input) handleUpdateSetting(s.settingKey, input.value, s.category);
                    }}
                    disabled={savingKey === s.settingKey}
                    className="app-btn-secondary"
                    style={{ padding: '8px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Save size={14} /> {savingKey === s.settingKey ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Category */}
      <Modal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        title="Add Claim Category"
        maxWidth={440}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCatModal(false)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-cat-form"
              disabled={savingCat}
              className="app-btn-primary"
            >
              {savingCat ? 'Saving...' : 'Add Category'}
            </button>
          </>
        }
      >
        <form id="add-cat-form" onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="app-label">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Marine Cargo"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="app-label">Description</label>
            <textarea
              rows={3}
              placeholder="Classification scope and rules..."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
