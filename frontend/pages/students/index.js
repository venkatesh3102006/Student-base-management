import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { studentsAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [fetching, setFetching] = useState(true);
  const [departments, setDepartments] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    year: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const fetchStudents = useCallback(async () => {
    setFetching(true);
    try {
      const res = await studentsAPI.getAll(filters);
      setStudents(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setFetching(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) fetchStudents();
  }, [user, fetchStudents]);

  useEffect(() => {
    studentsAPI.getDepartments().then(res => setDepartments(res.data.data)).catch(() => {});
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student "${name}"? This action cannot be undone.`)) return;
    try {
      await studentsAPI.delete(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading) return null;

  return (
    <Layout>
      <Head><title>Students — College Portal</title></Head>

      <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>Students</h1>
            <p className="text-gray-500 text-sm">{pagination.total} total students</p>
          </div>
          {isAdmin && (
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #1e2a5e, #2d3d8e)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Student
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Search */}
            <div className="sm:col-span-2 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="portal-input pl-9"
                placeholder="Search by name, register no, ID..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            {/* Department */}
            <select
              className="portal-input"
              value={filters.department}
              onChange={(e) => updateFilter('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Year */}
            <select
              className="portal-input"
              value={filters.year}
              onChange={(e) => updateFilter('year', e.target.value)}
            >
              <option value="">All Years</option>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>

            {/* Sort */}
            <select
              className="portal-input"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="cgpa-desc">CGPA High-Low</option>
              <option value="cgpa-asc">CGPA Low-High</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-sm">Loading students...</span>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
              <p className="text-sm">No students found</p>
              {filters.search && (
                <button onClick={() => updateFilter('search', '')} className="mt-2 text-xs text-indigo-600 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full portal-table">
                <thead>
                  <tr>
                    <th className="text-left">Student</th>
                    <th className="text-left">Register No.</th>
                    <th className="text-left">Department</th>
                    <th className="text-left">Year/Sem</th>
                    <th className="text-left">CGPA</th>
                    <th className="text-left">Attendance</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <Link href={`/students/${s._id}`} className="font-semibold text-gray-800 hover:text-indigo-600 text-sm">
                              {s.name}
                            </Link>
                            <p className="text-xs text-gray-400">{s.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs font-mono text-gray-600">{s.registerNumber}</td>
                      <td className="text-xs text-gray-600">{s.department}</td>
                      <td className="text-xs text-gray-600">Y{s.year} / S{s.semester}</td>
                      <td>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          s.cgpa >= 8 ? 'text-emerald-700 bg-emerald-50' :
                          s.cgpa >= 6 ? 'text-blue-700 bg-blue-50' :
                          s.cgpa > 0 ? 'text-amber-700 bg-amber-50' :
                          'text-gray-400 bg-gray-50'
                        }`}>
                          {s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs font-medium ${
                          s.attendance >= 75 ? 'text-emerald-600' :
                          s.attendance >= 60 ? 'text-amber-600' :
                          s.attendance > 0 ? 'text-rose-600' : 'text-gray-400'
                        }`}>
                          {s.attendance > 0 ? `${s.attendance}%` : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/students/${s._id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="View"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {isAdmin && (
                            <>
                              <Link
                                href={`/students/${s._id}/edit`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                title="Edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button
                                onClick={() => handleDelete(s._id, s.name)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Delete"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!fetching && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing {((pagination.page - 1) * filters.limit) + 1} to {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setFilters(p => ({ ...p, page: pg }))}
                      className={`w-8 h-8 text-xs rounded-lg border transition-all ${
                        pagination.page === pg
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
