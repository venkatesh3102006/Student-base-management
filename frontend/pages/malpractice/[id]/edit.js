import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import { useProtectedRoute } from '../../../hooks/useProtectedRoute';
import { useAuth } from '../../../context/AuthContext';
import { malpracticeAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function EditMalpracticePage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [record, setRecord] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace('/dashboard');
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (id && user) {
      // Fetch all, find by id - or we can get via getAll and find
      malpracticeAPI.getAll({ limit: 100 })
        .then(res => {
          const found = res.data.data.find(r => r._id === id);
          if (found) {
            setRecord(found);
            setForm({
              type: found.type,
              severity: found.severity,
              incidentDate: found.incidentDate?.split('T')[0] || '',
              description: found.description,
              actionTaken: found.actionTaken || '',
              status: found.status,
              penaltyGiven: found.penaltyGiven || ''
            });
          }
        })
        .catch(() => toast.error('Record not found'))
        .finally(() => setFetching(false));
    }
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await malpracticeAPI.update(id, form);
      toast.success('Record updated');
      router.push('/malpractice');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching || !isAdmin) return null;

  return (
    <Layout>
      <Head><title>Edit Record — College Portal</title></Head>
      <div className="animate-fade-in-up max-w-xl">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/malpractice" className="hover:text-indigo-600">Malpractice</Link>
          <span>/</span>
          <span className="text-gray-600">Edit Record</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>Edit Malpractice Record</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-card border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="portal-label">Type</label>
              <select className="portal-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {['Exam Malpractice', 'Plagiarism', 'Misconduct', 'Attendance Fraud', 'Ragging', 'Property Damage', 'Substance Abuse', 'Harassment', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="portal-label">Severity</label>
              <select className="portal-input" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="portal-label">Status</label>
              <select className="portal-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {['Pending', 'Under Review', 'Resolved', 'Dismissed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="portal-label">Incident Date</label>
              <input type="date" className="portal-input" value={form.incidentDate} onChange={e => setForm(p => ({ ...p, incidentDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="portal-label">Description</label>
            <textarea className="portal-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="portal-label">Action Taken</label>
            <textarea className="portal-input" rows={2} value={form.actionTaken} onChange={e => setForm(p => ({ ...p, actionTaken: e.target.value }))} />
          </div>
          <div>
            <label className="portal-label">Penalty Given</label>
            <input className="portal-input" value={form.penaltyGiven} onChange={e => setForm(p => ({ ...p, penaltyGiven: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
