const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Some Windows environments use a local DNS resolver (127.0.0.1) that may refuse SRV
// lookups for MongoDB Atlas. Force a public resolver for the seed script.
if (dns.getServers().some((s) => s.startsWith('127.') || s === '::1')) {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Student = require('../models/Student');
const MalpracticeRecord = require('../models/MalpracticeRecord');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_portal';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical'];

const generateStudents = () => {
  const students = [];
  const names = [
    'Arjun Kumar', 'Priya Sharma', 'Rahul Singh', 'Ananya Patel', 'Vikram Nair',
    'Sneha Reddy', 'Karthik Rajan', 'Divya Menon', 'Arun Krishnan', 'Meera Iyer',
    'Rohit Gupta', 'Lakshmi Devi', 'Sanjay Verma', 'Pooja Rao', 'Suresh Babu',
    'Kavitha Nair', 'Deepak Sharma', 'Rekha Pillai', 'Manoj Kumar', 'Swathi Krishnamurthy',
    'Naveen Chandran', 'Ashwin Raj', 'Vidya Subramaniam', 'Praveen Mohan', 'Nisha Thomas'
  ];

  names.forEach((name, i) => {
    const dept = departments[i % departments.length];
    const year = (i % 4) + 1;
    const semester = year * 2 - (i % 2);
    const cgpa = (6 + Math.random() * 4).toFixed(2);
    const attendance = (65 + Math.random() * 35).toFixed(1);

    const semesterGPA = [];
    for (let s = 1; s <= semester - 1; s++) {
      semesterGPA.push({
        semester: s,
        year: Math.ceil(s / 2),
        gpa: parseFloat((6 + Math.random() * 4).toFixed(2)),
        subjects: [
          { name: 'Mathematics', grade: 'A', credits: 4, gradePoints: 9 },
          { name: 'Physics', grade: 'B+', credits: 3, gradePoints: 8 },
          { name: 'Programming', grade: 'A+', credits: 4, gradePoints: 10 }
        ]
      });
    }

    students.push({
      studentId: `STU${String(2021001 + i).slice(-4)}`,
      registerNumber: `${dept.substring(0, 2).toUpperCase()}${2021 - year + 1}${String(1001 + i).slice(-3)}`,
      name,
      email: `${name.toLowerCase().replace(/ /g, '.')}@college.edu`,
      phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
      department: dept,
      year,
      semester,
      cgpa: parseFloat(cgpa),
      semesterGPA,
      attendance: parseFloat(attendance),
      address: {
        street: `${Math.floor(100 + Math.random() * 900)} Main Street`,
        city: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'][i % 5],
        state: 'Tamil Nadu',
        pincode: `6${String(Math.floor(10000 + Math.random() * 90000))}`,
        country: 'India'
      },
      parentDetails: {
        fatherName: `${name.split(' ')[1]} Sr.`,
        fatherPhone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
        fatherOccupation: ['Engineer', 'Teacher', 'Farmer', 'Business', 'Doctor'][i % 5],
        motherName: `Mrs. ${name.split(' ')[1]}`,
        motherPhone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
        motherOccupation: ['Homemaker', 'Teacher', 'Nurse', 'Business'][i % 4]
      },
      bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-'][i % 6],
      dateOfBirth: new Date(2000 + (i % 5), i % 12, (i % 28) + 1),
      gender: i % 3 === 0 ? 'Female' : 'Male',
      category: ['General', 'OBC', 'SC', 'ST'][i % 4],
      admissionYear: 2021 - year + 1,
      batch: `${2021 - year + 1}-${2025 - year + 1}`,
      scholarshipStatus: i % 5 === 0,
      hostelResident: i % 3 === 0,
      remarks: i % 4 === 0 ? 'Good academic performance' : '',
      disciplinaryNotes: ''
    });
  });

  return students;
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await MalpracticeRecord.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Dr. Admin Kumar',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      phone: '+91 9876543210'
    });
    console.log('👤 Admin created: admin@college.edu / admin123');

    // Create faculty users
    const facultyData = [
      { name: 'Prof. Rajesh Iyer', email: 'faculty@college.edu', password: 'faculty123', department: 'Computer Science', phone: '+91 9876543211' },
      { name: 'Dr. Sunita Rao', email: 'sunita@college.edu', password: 'sunita123', department: 'Electronics', phone: '+91 9876543212' },
      { name: 'Prof. Venkat Swamy', email: 'venkat@college.edu', password: 'venkat123', department: 'Mechanical', phone: '+91 9876543213' }
    ];

    for (const f of facultyData) {
      await User.create({ ...f, role: 'faculty' });
    }
    console.log('👥 Faculty accounts created');

    // Create students
    const studentData = generateStudents();
    const students = await Student.insertMany(studentData);
    console.log(`🎓 Created ${students.length} student records`);

    // Create malpractice records
    const malpracticeTypes = ['Exam Malpractice', 'Plagiarism', 'Misconduct', 'Attendance Fraud', 'Ragging'];
    const severities = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Pending', 'Under Review', 'Resolved', 'Dismissed'];

    const malpracticeData = [];
    for (let i = 0; i < 8; i++) {
      const student = students[i * 3];
      malpracticeData.push({
        student: student._id,
        studentId: student.studentId,
        type: malpracticeTypes[i % malpracticeTypes.length],
        severity: severities[i % severities.length],
        incidentDate: new Date(2024, i % 12, (i % 28) + 1),
        description: `Student was found ${malpracticeTypes[i % malpracticeTypes.length].toLowerCase()} during ${['mid-semester', 'end-semester', 'internal'][i % 3]} examination. Detailed investigation was conducted.`,
        actionTaken: ['Warning issued', 'Marks deducted', 'Suspension for 3 days', 'Written apology taken', null][i % 5],
        status: statuses[i % statuses.length],
        reportedBy: admin._id,
        reportedByName: admin.name,
        examDetails: i % 2 === 0 ? {
          examName: 'End Semester Examination',
          subjectCode: `CS${301 + i}`,
          subjectName: ['Data Structures', 'DBMS', 'OS', 'Networks'][i % 4]
        } : undefined,
        penaltyGiven: i % 3 === 0 ? 'Grade reduction' : undefined
      });
    }

    await MalpracticeRecord.insertMany(malpracticeData);
    console.log(`⚠️  Created ${malpracticeData.length} malpractice records`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   admin@college.edu   / admin123');
    console.log('   Faculty: faculty@college.edu / faculty123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
