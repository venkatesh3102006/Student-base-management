import { useState } from 'react';
import { useRouter } from 'next/router';
import { studentsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100 mb-5">
    <h3 className="text-sm font-bold text-gray-700 mb-4 pb-3 border-b border-gray-50" style={{ fontFamily: 'Sora, sans-serif' }}>
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, children, full }) => (
  <div className={full ? 'sm:col-span-2 lg:col-span-3' : ''}>
    <label className="portal-label">{label}</label>
    {children}
  </div>
);

export default function StudentForm({ initialData = {}, isEdit = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [form, setForm] = useState({
    studentId: initialData.studentId || '',
    registerNumber: initialData.registerNumber || '',
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    department: initialData.department || '',
    year: initialData.year || '',
    semester: initialData.semester || '',
    cgpa: initialData.cgpa || '',
    attendance: initialData.attendance || '',
    bloodGroup: initialData.bloodGroup || '',
    gender: initialData.gender || '',
    category: initialData.category || 'General',
    dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
    admissionYear: initialData.admissionYear || '',
    batch: initialData.batch || '',
    scholarshipStatus: initialData.scholarshipStatus || false,
    hostelResident: initialData.hostelResident || false,
    disciplinaryNotes: initialData.disciplinaryNotes || '',
    remarks: initialData.remarks || '',
    // Address
    'address.street': initialData.address?.street || '',
    'address.city': initialData.address?.city || '',
    'address.state': initialData.address?.state || '',
    'address.pincode': initialData.address?.pincode || '',
    // Parent
    'parentDetails.fatherName': initialData.parentDetails?.fatherName || '',
    'parentDetails.fatherPhone': initialData.parentDetails?.fatherPhone || '',
    'parentDetails.fatherOccupation': initialData.parentDetails?.fatherOccupation || '',
    'parentDetails.motherName': initialData.parentDetails?.motherName || '',
    'parentDetails.motherPhone': initialData.parentDetails?.motherPhone || '',
    'parentDetails.motherOccupation': initialData.parentDetails?.motherOccupation || '',
  });

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const buildPayload = () => {
    const payload = {
      studentId: form.studentId,
      registerNumber: form.registerNumber,
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      year: parseInt(form.year),
      semester: parseInt(form.semester),
      cgpa: parseFloat(form.cgpa) || 0,
      attendance: parseFloat(form.attendance) || 0,
      bloodGroup: form.bloodGroup,
      gender: form.gender,
      category: form.category,
      dateOfBirth: form.dateOfBirth || undefined,
      admissionYear: parseInt(form.admissionYear) || undefined,
      batch: form.batch,
      scholarshipStatus: form.scholarshipStatus,
      hostelResident: form.hostelResident,
      disciplinaryNotes: form.disciplinaryNotes,
      remarks: form.remarks,
      address: {
        street: form['address.street'],
        city: form['address.city'],
        state: form['address.state'],
        pincode: form['address.pincode'],
        country: 'India'
      },
      parentDetails: {
        fatherName: form['parentDetails.fatherName'],
        fatherPhone: form['parentDetails.fatherPhone'],
        fatherOccupation: form['parentDetails.fatherOccupation'],
        motherName: form['parentDetails.motherName'],
        motherPhone: form['parentDetails.motherPhone'],
        motherOccupation: form['parentDetails.motherOccupation'],
      }
    };
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await studentsAPI.update(initialData._id, payload);
        toast.success('Student updated successfully');
        router.push(`/students/${initialData._id}`);
      } else {
        const res = await studentsAPI.create(payload);
        toast.success('Student added successfully');
        router.push(`/students/${res.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'academic', label: 'Academic' },
    { id: 'address', label: 'Address & Parents' },
    { id: 'notes', label: 'Notes & Other' },
  ];

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical', 'Chemical', 'Biotechnology'];

  return (
    <form onSubmit={handleSubmit}>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 shadow-card border border-gray-100 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <Section title="Basic Information">
          <Field label="Student ID *">
            <input className="portal-input" value={form.studentId} onChange={e => set('studentId', e.target.value)} required placeholder="STU001" disabled={isEdit} />
          </Field>
          <Field label="Register Number *">
            <input className="portal-input" value={form.registerNumber} onChange={e => set('registerNumber', e.target.value)} required placeholder="CS2021001" disabled={isEdit} />
          </Field>
          <Field label="Full Name *">
            <input className="portal-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Student Full Name" />
          </Field>
          <Field label="Email *">
            <input type="email" className="portal-input" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="student@college.edu" />
          </Field>
          <Field label="Phone">
            <input className="portal-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
          </Field>
          <Field label="Gender">
            <select className="portal-input" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Date of Birth">
            <input type="date" className="portal-input" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
          </Field>
          <Field label="Blood Group">
            <select className="portal-input" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg}>{bg}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select className="portal-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </Section>
      )}

      {/* Academic */}
      {activeTab === 'academic' && (
        <Section title="Academic Information">
          <Field label="Department *">
            <select className="portal-input" value={form.department} onChange={e => set('department', e.target.value)} required>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Year *">
            <select className="portal-input" value={form.year} onChange={e => set('year', e.target.value)} required>
              <option value="">Select Year</option>
              {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </Field>
          <Field label="Semester *">
            <select className="portal-input" value={form.semester} onChange={e => set('semester', e.target.value)} required>
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </Field>
          <Field label="CGPA">
            <input type="number" step="0.01" min="0" max="10" className="portal-input" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} placeholder="0.00 - 10.00" />
          </Field>
          <Field label="Attendance (%)">
            <input type="number" step="0.1" min="0" max="100" className="portal-input" value={form.attendance} onChange={e => set('attendance', e.target.value)} placeholder="0 - 100" />
          </Field>
          <Field label="Admission Year">
            <input type="number" className="portal-input" value={form.admissionYear} onChange={e => set('admissionYear', e.target.value)} placeholder="2021" />
          </Field>
          <Field label="Batch">
            <input className="portal-input" value={form.batch} onChange={e => set('batch', e.target.value)} placeholder="2021-2025" />
          </Field>
          <Field label="Scholarship">
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.scholarshipStatus} onChange={e => set('scholarshipStatus', e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                <span className="text-sm text-gray-600">Has Scholarship</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hostelResident} onChange={e => set('hostelResident', e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                <span className="text-sm text-gray-600">Hostel Resident</span>
              </label>
            </div>
          </Field>
        </Section>
      )}

      {/* Address & Parents */}
      {activeTab === 'address' && (
        <>
          <Section title="Address">
            <Field label="Street" full>
              <input className="portal-input" value={form['address.street']} onChange={e => set('address.street', e.target.value)} placeholder="Street address" />
            </Field>
            <Field label="City">
              <input className="portal-input" value={form['address.city']} onChange={e => set('address.city', e.target.value)} placeholder="City" />
            </Field>
            <Field label="State">
              <input className="portal-input" value={form['address.state']} onChange={e => set('address.state', e.target.value)} placeholder="State" />
            </Field>
            <Field label="Pincode">
              <input className="portal-input" value={form['address.pincode']} onChange={e => set('address.pincode', e.target.value)} placeholder="600001" />
            </Field>
          </Section>
          <Section title="Parent / Guardian Details">
            <Field label="Father's Name">
              <input className="portal-input" value={form['parentDetails.fatherName']} onChange={e => set('parentDetails.fatherName', e.target.value)} placeholder="Father's full name" />
            </Field>
            <Field label="Father's Phone">
              <input className="portal-input" value={form['parentDetails.fatherPhone']} onChange={e => set('parentDetails.fatherPhone', e.target.value)} placeholder="+91 9876543210" />
            </Field>
            <Field label="Father's Occupation">
              <input className="portal-input" value={form['parentDetails.fatherOccupation']} onChange={e => set('parentDetails.fatherOccupation', e.target.value)} placeholder="Occupation" />
            </Field>
            <Field label="Mother's Name">
              <input className="portal-input" value={form['parentDetails.motherName']} onChange={e => set('parentDetails.motherName', e.target.value)} placeholder="Mother's full name" />
            </Field>
            <Field label="Mother's Phone">
              <input className="portal-input" value={form['parentDetails.motherPhone']} onChange={e => set('parentDetails.motherPhone', e.target.value)} placeholder="+91 9876543210" />
            </Field>
            <Field label="Mother's Occupation">
              <input className="portal-input" value={form['parentDetails.motherOccupation']} onChange={e => set('parentDetails.motherOccupation', e.target.value)} placeholder="Occupation" />
            </Field>
          </Section>
        </>
      )}

      {/* Notes */}
      {activeTab === 'notes' && (
        <Section title="Notes & Remarks">
          <Field label="Disciplinary Notes" full>
            <textarea className="portal-input" rows={4} value={form.disciplinaryNotes} onChange={e => set('disciplinaryNotes', e.target.value)} placeholder="Any disciplinary history or notes..." />
          </Field>
          <Field label="Remarks" full>
            <textarea className="portal-input" rows={3} value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="General remarks about the student..." />
          </Field>
        </Section>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1e2a5e, #2d3d8e)', fontFamily: 'Sora, sans-serif' }}
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}
