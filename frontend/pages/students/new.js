import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import StudentForm from '../../components/forms/StudentForm';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function NewStudentPage() {
  const { user, loading } = useProtectedRoute();
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !isAdmin) return null;

  return (
    <Layout>
      <Head><title>Add Student — College Portal</title></Head>

      <div className="animate-fade-in-up max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/students" className="hover:text-indigo-600 transition-colors">Students</Link>
          <span>/</span>
          <span className="text-gray-600">Add New Student</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>Add New Student</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the student details across all sections</p>
        </div>

        <StudentForm />
      </div>
    </Layout>
  );
}
