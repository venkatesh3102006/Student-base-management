import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { studentsAPI, malpracticeAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
    <span className="text-sm text-gray-700 font-medium text-right max-w-[60%]">{value || '—'}</span>
  </div>
);

const severityColors = { Critical: 'badge-critical', High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
const statusColors = { Pending: 'badge-pending', Resolved: 'badge-resolved', 'Under Review': 'badge-review', Dismissed: 'badge-dismissed' };

export default function StudentDetailPage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [student, setStudent] = useState(null);
  const [malpractice, setMalpractice] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMalpracticeForm, setShowMalpracticeForm] = useState(false);

  useEffect(() => {
    if (id && user) {
      studentsAPI.getById(id)
        .then(res => {
          setStudent(res.data.data);
          setMalpractice(res.data.data.malpracticeRecords || []);
        })
        .catch(() => toast.error('Student not found'))
        .finally(() => setFetching(false));
    }
  }, [id, user]);

  const handleDelete = async () => {
    if (!confirm(`Delete "${student.name}"? This cannot be undone.`)) return;
    try {
      await studentsAPI.delete(id);
      toast.success('Student deleted');
      router.push('/students');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading || fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!student) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic History' },
    { id: 'family', label: 'Family Details' },
    { id: 'malpractice', label: `Malpractice (${malpractice.length})` },
  ];

  return (
    <Layout>
      <Head><title>{student.name} — College Portal</title></Head>

      <div className="animate-fade-in-up max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/students" className="hover:text-indigo-600">Students</Link>
          <span>/</span>
          <span className="text-gray-600">{student.name}</span>
        </div>

        {/* Profile header */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>{student.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  student.cgpa >= 8 ? 'bg-emerald-100 text-emerald-700' :
                  student.cgpa >= 6 ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  CGPA: {student.cgpa?.toFixed(2) || 'N/A'}
                </span>
                {malpractice.length > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-100 text-rose-600">
                    ⚠ {malpractice.length} Case{malpractice.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>📋 {student.studentId}</span>
                <span>🎓 {student.department}</span>
                <span>📅 Year {student.year}, Sem {student.semester}</span>
                <span>📧 {student.email}</span>
                {student.phone && <span>📱 {student.phone}</span>}
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/students/${id}/edit`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-all"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-all"
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-5 pt-5 border-t border-gray-50">
            {[
              { label: 'Register No.', value: student.registerNumber },
              { label: 'CGPA', value: student.cgpa?.toFixed(2) || 'N/A' },
              { label: 'Attendance', value: student.attendance ? `${student.attendance}%` : 'N/A' },
              { label: 'Batch', value: student.batch || 'N/A' },
              { label: 'Category', value: student.category || 'N/A' },
              { label: 'Status', value: student.scholarshipStatus ? '🏆 Scholar' : 'Regular' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 shadow-card border border-gray-100 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Personal Information</h3>
              <InfoRow label="Full Name" value={student.name} />
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Phone" value={student.phone} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Blood Group" value={student.bloodGroup} />
              <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : null} />
              <InfoRow label="Hostel" value={student.hostelResident ? 'Yes' : 'No'} />
            </div>

            <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Address</h3>
              <InfoRow label="Street" value={student.address?.street} />
              <InfoRow label="City" value={student.address?.city} />
              <InfoRow label="State" value={student.address?.state} />
              <InfoRow label="Pincode" value={student.address?.pincode} />
              <InfoRow label="Country" value={student.address?.country || 'India'} />
            </div>

            {(student.disciplinaryNotes || student.remarks) && (
              <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100 lg:col-span-2">
                <h3 className="text-sm font-bold text-gray-600 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Notes & Remarks</h3>
                {student.disciplinaryNotes && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Disciplinary Notes</p>
                    <p className="text-sm text-gray-700 bg-rose-50 rounded-lg p-3">{student.disciplinaryNotes}</p>
                  </div>
                )}
                {student.remarks && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{student.remarks}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-700" style={{ fontFamily: 'Sora, sans-serif' }}>Semester-wise GPA History</h3>
            </div>
            {student.semesterGPA?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full portal-table">
                  <thead>
                    <tr>
                      <th className="text-left">Semester</th>
                      <th className="text-left">Year</th>
                      <th className="text-left">GPA</th>
                      <th className="text-left">Performance</th>
                      <th className="text-left">Subjects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.semesterGPA.sort((a, b) => a.semester - b.semester).map(sg => (
                      <tr key={sg.semester}>
                        <td className="font-semibold">Sem {sg.semester}</td>
                        <td>Year {sg.year}</td>
                        <td>
                          <span className={`font-bold px-2 py-0.5 rounded text-sm ${
                            sg.gpa >= 8 ? 'text-emerald-700 bg-emerald-50' :
                            sg.gpa >= 6 ? 'text-blue-700 bg-blue-50' :
                            'text-amber-700 bg-amber-50'
                          }`}>
                            {sg.gpa?.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${(sg.gpa / 10) * 100}%`,
                                background: sg.gpa >= 8 ? '#10b981' : sg.gpa >= 6 ? '#6366f1' : '#f59e0b'
                              }} />
                            </div>
                            <span className="text-xs text-gray-400">{(sg.gpa / 10 * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="text-xs text-gray-500">{sg.subjects?.length || 0} subjects</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                No semester records available
              </div>
            )}
          </div>
        )}

        {activeTab === 'family' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Father's Details</h3>
              <InfoRow label="Name" value={student.parentDetails?.fatherName} />
              <InfoRow label="Phone" value={student.parentDetails?.fatherPhone} />
              <InfoRow label="Occupation" value={student.parentDetails?.fatherOccupation} />
            </div>
            <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Mother's Details</h3>
              <InfoRow label="Name" value={student.parentDetails?.motherName} />
              <InfoRow label="Phone" value={student.parentDetails?.motherPhone} />
              <InfoRow label="Occupation" value={student.parentDetails?.motherOccupation} />
            </div>
          </div>
        )}

        {activeTab === 'malpractice' && (
          <div>
            {isAdmin && (
              <div className="mb-4 flex justify-end">
                <Link
                  href={`/malpractice/new?student=${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
                >
                  + Add Record
                </Link>
              </div>
            )}
            {malpractice.length === 0 ? (
              <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-500 text-sm">No malpractice records for this student</p>
              </div>
            ) : (
              <div className="space-y-3">
                {malpractice.map(m => (
                  <div key={m._id} className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{m.type}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(m.incidentDate).toLocaleDateString('en-IN')} · Reported by {m.reportedByName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${severityColors[m.severity] || 'badge-medium'}`}>
                          {m.severity}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[m.status] || 'badge-pending'}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{m.description}</p>
                    {m.actionTaken && (
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                        <strong>Action Taken:</strong> {m.actionTaken}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
