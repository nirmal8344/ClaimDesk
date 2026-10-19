import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Edit, Save, X } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile Edit
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await authService.updateProfile({
        fullName,
        phoneNumber,
        address
      });
      updateUser({
        fullName: res.fullName,
        phoneNumber: res.phoneNumber,
        address: res.address
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setUpdatingPassword(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>My Profile</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
          Manage your account details and password.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Personal Information Card matching Screenshot 1 */}
        <div className="app-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Personal Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: 'transparent',
                  color: '#6C5DD3',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                style={{ background: 'transparent', color: '#6B7280', fontSize: 13 }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {profileMsg && (
            <div style={{
              background: profileMsg.type === 'success' ? '#ECFDF5' : '#FEE2E2',
              color: profileMsg.type === 'success' ? '#059669' : '#DC2626',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16
            }}>
              {profileMsg.text}
            </div>
          )}

          {!editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Full Name</div>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: 2 }}>{user?.fullName}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Email Address</div>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: 2 }}>{user?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Phone Number</div>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: 2 }}>{user?.phoneNumber || 'Not provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Address</div>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: 2 }}>
                  {user?.address || 'Not provided'}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card matching Screenshot 1 */}
        <div className="app-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 20 }}>
            Change Password
          </h2>

          {passwordMsg && (
            <div style={{
              background: passwordMsg.type === 'success' ? '#ECFDF5' : '#FEE2E2',
              color: passwordMsg.type === 'success' ? '#059669' : '#DC2626',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16
            }}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="btn-dark"
              style={{ width: '100%', marginTop: 12, padding: 11 }}
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
