import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export default function UsersPage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'faculty', department: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace('/dashboard');
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      usersAPI.getAll()
        .then(res => setUsers(res.data.data))
        .catch(() => toast.error('Failed to load users'))
        .finally(() => setFetching(false));
    }
  }, [user, isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await usersAPI.create(form);
      setUsers(p => [res.data.data, ...p]);
      toast.success('User created successfully');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'faculty', department: '', phone: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await usersAPI.delete(id);
      setUsers(p => p.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await usersAPI.toggleStatus(id);
      setUsers(p => p.map(u => u._id === id ? res.data.data : u));
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading || !isAdmin) return null;

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical', 'Administration'];

  return (
    <Layout>
      <Head><title>Faculty Accounts — College Portal</title></Head>

      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>Faculty Accounts</h1>
            <p className="text-gray-500 text-sm">{users.length} accounts</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #1e2a5e, #2d3d8e)' }}
          >
            {showForm ? '✕ Cancel' : '+ Add Account'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100 mb-5 animate-fade-in-up">
            <h3 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Create New User Account</h3>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="portal-label">Full Name *</label>
                  <input className="portal-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Dr. John Smith" />
                </div>
                <div>
                  <label className="portal-label">Email *</label>
                  <input type="email" className="portal-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="faculty@college.edu" />
                </div>
                <div>
                  <label className="portal-label">Password *</label>
                  <input type="password" className="portal-input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="portal-label">Role</label>
                  <select className="portal-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="portal-label">Department</label>
                  <select className="portal-input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                    <option value="">Select</option>
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="portal-label">Phone</label>
                  <input className="portal-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1e2a5e, #2d3d8e)' }}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users grid */}
        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => (
              <div key={u._id} className="bg-white rounded-xl p-5 shadow-card border border-gray-100 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                      u.role === 'admin' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                    }`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      title={u.isActive ? 'Deactivate' : 'Activate'}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        u.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {u.isActive ? '✓' : '○'}
                    </button>
                    {u._id !== user._id && (
                      <button onClick={() => handleDelete(u._id, u.name)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 flex items-center justify-center transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p className="flex items-center gap-1.5">
                    <span>📧</span> {u.email}
                  </p>
                  {u.department && <p className="flex items-center gap-1.5"><span>🏛</span> {u.department}</p>}
                  {u.phone && <p className="flex items-center gap-1.5"><span>📱</span> {u.phone}</p>}
                  {u.lastLogin && <p className="flex items-center gap-1.5 text-gray-400"><span>🕒</span> Last login: {new Date(u.lastLogin).toLocaleDateString('en-IN')}</p>}
                </div>
                {!u.isActive && (
                  <div className="mt-3 text-xs text-rose-500 bg-rose-50 rounded-lg px-3 py-1.5 text-center font-medium">
                    Account Deactivated
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
