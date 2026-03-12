import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { malpracticeAPI, studentsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function NewMalpracticePage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { student: prefilledStudent } = router.query;

  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({
    type: 'Exam Malpractice',
    severity: 'Medium',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    actionTaken: '',
    status: 'Pending',
    examDetails: { examName: '', subjectCode: '', subjectName: '' },
    penaltyGiven: ''
  });

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace('/dashboard');
  }, [user, loading, isAdmin, router]);

  // Load prefilled student
  useEffect(() => {
    if (prefilledStudent && user) {
      studentsAPI.getById(prefilledStudent)
        .then(res => setSelectedStudent(res.data.data))
        .catch(() => {});
    }
  }, [prefilledStudent, user]);

  const searchStudents = async (q) => {
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await studentsAPI.getAll({ search: q, limit: 6 });
      setSearchResults(res.data.data);
    } catch {}
  };

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) { toast.error('Please select a student'); return; }
    setSubmitting(true);
    try {
      await malpracticeAPI.create({ ...form, student: selectedStudent._id });
      toast.success('Malpractice record added');
      router.push('/malpractice');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <Layout>
      <Head><title>Add Malpractice Record — College Portal</title></Head>

      <div className="animate-fade-in-up max-w-2xl">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/malpractice" className="hover:text-indigo-600">Malpractice</Link>
          <span>/</span>
          <span className="text-gray-600">New Record</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>Add Malpractice Record</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student selector */}
          <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4 pb-3 border-b border-gray-50" style={{ fontFamily: 'Sora, sans-serif' }}>Select Student</h3>

            {selectedStudent ? (
              <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{selectedStudent.name}</p>
                    <p className="text-xs text-gray-500">{selectedStudent.studentId} · {selectedStudent.department}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedStudent(null)} className="text-xs text-rose-500 hover:underline">
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  className="portal-input"
                  placeholder="Search student by name or ID..."
                  value={studentSearch}
                  onChange={e => { setStudentSearch(e.target.value); searchStudents(e.target.value); }}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 max-h-48 overflow-y-auto">
                    {searchResults.map(s => (
                      <button key={s._id} type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-all flex items-center gap-3"
                        onClick={() => { setSelectedStudent(s); setSearchResults([]); setStudentSearch(''); }}>
                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {s.name.charAt(0)}
                        </span>
                        <span>
                          <p className="text-sm font-medium text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.studentId} · {s.department}</p>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Incident details */}
          <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4 pb-3 border-b border-gray-50" style={{ fontFamily: 'Sora, sans-serif' }}>Incident Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="portal-label">Type *</label>
                <select className="portal-input" value={form.type} onChange={e => set('type', e.target.value)} required>
                  {['Exam Malpractice', 'Plagiarism', 'Misconduct', 'Attendance Fraud', 'Ragging', 'Property Damage', 'Substance Abuse', 'Harassment', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="portal-label">Severity</label>
                <select className="portal-input" value={form.severity} onChange={e => set('severity', e.target.value)}>
                  {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="portal-label">Incident Date *</label>
                <input type="date" className="portal-input" value={form.incidentDate} onChange={e => set('incidentDate', e.target.value)} required />
              </div>
              <div>
                <label className="portal-label">Status</label>
                <select className="portal-input" value={form.status} onChange={e => set('status', e.target.value)}>
                  {['Pending', 'Under Review', 'Resolved', 'Dismissed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="portal-label">Description *</label>
                <textarea className="portal-input" rows={4} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Detailed description of the incident..." />
              </div>
              <div className="col-span-2">
                <label className="portal-label">Action Taken</label>
                <textarea className="portal-input" rows={2} value={form.actionTaken} onChange={e => set('actionTaken', e.target.value)} placeholder="What action was taken?" />
              </div>
              <div>
                <label className="portal-label">Penalty Given</label>
                <input className="portal-input" value={form.penaltyGiven} onChange={e => set('penaltyGiven', e.target.value)} placeholder="e.g. Grade reduction" />
              </div>
              <div>
                <label className="portal-label">Exam Subject</label>
                <input className="portal-input" value={form.examDetails.subjectName} onChange={e => set('examDetails', { ...form.examDetails, subjectName: e.target.value })} placeholder="Subject name (if exam related)" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', fontFamily: 'Sora, sans-serif' }}>
              {submitting ? 'Saving...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
