import React, { useState } from 'react';
import { Key, Trash2, AlertTriangle } from 'lucide-react';
import httpClient from '../../../services/httpClient';
import useAuthStore from '../../auth/store/authStore';
import { useToast } from '../../../context/ToastContext';

const changePassword = (currentPassword, newPassword) =>
  httpClient.put('/auth/change-password', { currentPassword, newPassword });
const deleteAccount = () => httpClient.delete('/auth/delete-account');

export default function SettingsPage() {
  const toast = useToast();
  const { logout } = useAuthStore();

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const response = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (response.data.success) {
        toast.success('Password updated successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else { toast.error(response.data.message || 'Failed to update password'); }
    } catch (error) { toast.error(error.response?.data?.message || 'Error updating password'); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') { toast.error('Please type DELETE to confirm'); return; }
    setLoading(true);
    try {
      const response = await deleteAccount();
      if (response.data.success) { toast.success('Account deleted'); setTimeout(() => logout(), 2000); }
      else { toast.error(response.data.message || 'Failed to delete account'); }
    } catch (error) { toast.error(error.response?.data?.message || 'Error deleting account'); }
    finally { setLoading(false); setShowDeleteConfirm(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-sky-900">Clinic Settings</h1>
        <p className="text-slate-500">Manage your account security and profile settings.</p>
      </section>

      {/* Password Management */}
      <article className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center"><Key size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Security & Password</h2>
            <p className="text-xs text-slate-500">Update your account password regularly.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="p-8 space-y-6 max-w-md">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password',     key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmPassword' },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
              <input type="password" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                value={passwordForm[key]}
                onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </article>

      {/* Danger Zone */}
      <article className="bg-rose-50/30 rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rose-100 bg-rose-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><Trash2 size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-rose-800">Danger Zone</h2>
            <p className="text-xs text-rose-600/70">Permanently remove your account and all clinical data.</p>
          </div>
        </div>
        <div className="p-8">
          <p className="text-sm text-slate-600 mb-6 max-w-2xl">
            Deleting your account is permanent and cannot be undone. This will remove your clinic profile, health packages, lab tests, and all history.
          </p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 border-2 border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center gap-2">
              <AlertTriangle size={18} /> Delete My Account
            </button>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-lg max-w-md">
              <h3 className="font-bold text-slate-800 mb-1">Are you absolutely sure?</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Type <strong className="text-rose-600">DELETE</strong> below to confirm.</p>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-100 outline-none transition-all mb-4"
                placeholder="Type DELETE"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={loading || deleteInput !== 'DELETE'}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold disabled:opacity-50">
                  Confirm Deletion
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
