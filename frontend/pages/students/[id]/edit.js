import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import StudentForm from '../../../components/forms/StudentForm';
import { useProtectedRoute } from '../../../hooks/useProtectedRoute';
import { useAuth } from '../../../context/AuthContext';
import { studentsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function EditStudentPage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace('/dashboard');
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (id && user) {
      studentsAPI.getById(id)
        .then(res => setStudent(res.data.data))
        .catch(() => { toast.error('Student not found'); router.push('/students'); })
        .finally(() => setFetching(false));
    }
  }, [id, user]);

  if (loading || fetching || !isAdmin) return null;
  if (!student) return null;

  return (
    <Layout>
      <Head><title>Edit {student.name} — College Portal</title></Head>

      <div className="animate-fade-in-up max-w-5xl">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/students" className="hover:text-indigo-600">Students</Link>
          <span>/</span>
          <Link href={`/students/${id}`} className="hover:text-indigo-600">{student.name}</Link>
          <span>/</span>
          <span className="text-gray-600">Edit</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>Edit Student</h1>
          <p className="text-gray-500 text-sm mt-1">Update information for {student.name}</p>
        </div>

        <StudentForm initialData={student} isEdit={true} />
      </div>
    </Layout>
  );
}
