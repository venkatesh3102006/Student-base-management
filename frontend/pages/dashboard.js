import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/layout/Layout';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { statsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, subtitle, icon, color, href }) => {
  const content = (
    <div className={`stat-card group cursor-pointer transition-all duration-200 ${href ? 'hover:-translate-y-1' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-xl ${color}`}>
          {icon}
        </div>
        {href && (
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
};

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      statsAPI.dashboard()
        .then(res => setStats(res.data.data))
        .catch(console.error)
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const deptData = stats?.departmentStats?.map(d => ({
    name: d._id?.split(' ')[0] || d._id,
    students: d.count,
    avgCgpa: parseFloat(d.avgCgpa?.toFixed(2) || 0)
  })) || [];

  const malpracticeByType = stats?.malpracticeByType?.map(m => ({
    name: m._id,
    value: m.count
  })) || [];

  return (
    <Layout>
      <Head><title>Dashboard — College Portal</title></Head>

      <div className="animate-fade-in-up">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>
            {isAdmin ? 'Admin Dashboard' : 'Faculty Dashboard'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of student academic and disciplinary records
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
          <StatCard
            title="Total Students"
            value={stats?.overview?.totalStudents || 0}
            icon="🎓"
            color="bg-indigo-500"
            href="/students"
          />
          <StatCard
            title="Faculty"
            value={stats?.overview?.totalFaculty || 0}
            icon="👩‍🏫"
            color="bg-purple-500"
            href={isAdmin ? "/users" : null}
          />
          <StatCard
            title="Malpractice Cases"
            value={stats?.overview?.totalMalpractice || 0}
            icon="⚠️"
            color="bg-rose-500"
            href="/malpractice"
          />
          <StatCard
            title="Pending Cases"
            value={stats?.overview?.pendingMalpractice || 0}
            icon="⏳"
            color="bg-amber-500"
            subtitle="Awaiting review"
          />
          <StatCard
            title="Avg CGPA"
            value={stats?.overview?.avgCgpa || '—'}
            icon="📊"
            color="bg-emerald-500"
            subtitle="Across all students"
          />
          <StatCard
            title="Avg Attendance"
            value={stats?.overview?.avgAttendance ? `${stats.overview.avgAttendance}%` : '—'}
            icon="📅"
            color="bg-cyan-500"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
          {/* Department bar chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Students by Department
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Malpractice pie */}
          <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Malpractice by Type
            </h3>
            {malpracticeByType.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={malpracticeByType} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {malpracticeByType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {malpracticeByType.slice(0, 4).map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="truncate">{item.name}</span>
                      <span className="ml-auto font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Recent tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent students */}
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Sora, sans-serif' }}>Recent Students</h3>
              <Link href="/students" className="text-xs text-indigo-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full portal-table">
                <thead>
                  <tr>
                    <th className="text-left">Name</th>
                    <th className="text-left">Dept</th>
                    <th className="text-left">CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentStudents?.map(s => (
                    <tr key={s._id} className="cursor-pointer" onClick={() => {}}>
                      <td>
                        <Link href={`/students/${s._id}`} className="font-medium text-gray-800 hover:text-indigo-600">
                          {s.name}
                        </Link>
                        <p className="text-xs text-gray-400">{s.studentId}</p>
                      </td>
                      <td className="text-gray-600 text-xs">{s.department}</td>
                      <td>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          s.cgpa >= 8 ? 'text-emerald-700 bg-emerald-50' :
                          s.cgpa >= 6 ? 'text-blue-700 bg-blue-50' :
                          'text-red-600 bg-red-50'
                        }`}>
                          {s.cgpa?.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent malpractice */}
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Sora, sans-serif' }}>Recent Malpractice Cases</h3>
              <Link href="/malpractice" className="text-xs text-indigo-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full portal-table">
                <thead>
                  <tr>
                    <th className="text-left">Student</th>
                    <th className="text-left">Type</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentMalpractice?.map(m => (
                    <tr key={m._id}>
                      <td>
                        <p className="font-medium text-gray-800 text-xs">{m.student?.name}</p>
                        <p className="text-xs text-gray-400">{m.student?.studentId}</p>
                      </td>
                      <td className="text-xs text-gray-600">{m.type?.replace(' ', '\n')}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          m.status === 'Resolved' ? 'badge-resolved' :
                          m.status === 'Pending' ? 'badge-pending' :
                          m.status === 'Under Review' ? 'badge-review' :
                          'badge-dismissed'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
