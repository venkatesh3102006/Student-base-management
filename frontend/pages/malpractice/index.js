import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { malpracticeAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const severityColors = { Critical: 'badge-critical', High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
const statusColors = { Pending: 'badge-pending', Resolved: 'badge-resolved', 'Under Review': 'badge-review', Dismissed: 'badge-dismissed' };

export default function MalpracticePage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [fetching, setFetching] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '', severity: '', page: 1, limit: 10 });

  const fetchRecords = useCallback(async () => {
    setFetching(true);
    try {
      const res = await malpracticeAPI.getAll(filters);
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setFetching(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) fetchRecords();
  }, [user, fetchRecords]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this malpractice record?')) return;
    try {
      await malpracticeAPI.delete(id);
      toast.success('Record deleted');
      fetchRecords();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const updateFilter = (key, value) => setFilters(p => ({ ...p, [key]: value, page: 1 }));

  if (loading) return null;

  return (
    <Layout>
      <Head><title>Malpractice Records — College Portal</title></Head>

      <div className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>Malpractice Records</h1>
            <p className="text-gray-500 text-sm">{pagination.total} total records</p>
          </div>
          {isAdmin && (
            <Link
              href="/malpractice/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
            >
              + Add Record
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select className="portal-input" value={filters.status} onChange={e => updateFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              {['Pending', 'Under Review', 'Resolved', 'Dismissed'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="portal-input" value={filters.type} onChange={e => updateFilter('type', e.target.value)}>
              <option value="">All Types</option>
              {['Exam Malpractice', 'Plagiarism', 'Misconduct', 'Attendance Fraud', 'Ragging', 'Property Damage', 'Substance Abuse', 'Harassment', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="portal-input" value={filters.severity} onChange={e => updateFilter('severity', e.target.value)}>
              <option value="">All Severities</option>
              {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-sm">No malpractice records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full portal-table">
                <thead>
                  <tr>
                    <th className="text-left">Student</th>
                    <th className="text-left">Type</th>
                    <th className="text-left">Date</th>
                    <th className="text-left">Severity</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Reported By</th>
                    {isAdmin && <th className="text-left">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r._id}>
                      <td>
                        {r.student ? (
                          <Link href={`/students/${r.student._id}`} className="font-semibold text-sm text-gray-800 hover:text-indigo-600">
                            {r.student.name}
                            <p className="text-xs text-gray-400 font-normal">{r.student.studentId}</p>
                          </Link>
                        ) : <span className="text-gray-400 text-xs">Unknown</span>}
                      </td>
                      <td className="text-xs text-gray-600">{r.type}</td>
                      <td className="text-xs text-gray-600">
                        {new Date(r.incidentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${severityColors[r.severity] || ''}`}>
                          {r.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status] || ''}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">{r.reportedByName || '—'}</td>
                      {isAdmin && (
                        <td>
                          <div className="flex gap-1.5">
                            <Link href={`/malpractice/${r._id}/edit`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button onClick={() => handleDelete(r._id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!fetching && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50 bg-gray-50/50">
              <p className="text-xs text-gray-500">Total: {pagination.total} records</p>
              <div className="flex gap-1.5">
                <button disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100">← Prev</button>
                <button disabled={filters.page >= pagination.pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
