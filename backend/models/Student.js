const mongoose = require('mongoose');

const semesterGPASchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  gpa: { type: Number, required: true, min: 0, max: 10 },
  subjects: [
    {
      name: String,
      grade: String,
      credits: Number,
      gradePoints: Number
    }
  ]
});

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true
    },
    registerNumber: {
      type: String,
      required: [true, 'Register number is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 5
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 10
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    semesterGPA: [semesterGPASchema],
    attendance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    parentDetails: {
      fatherName: String,
      fatherPhone: String,
      fatherOccupation: String,
      motherName: String,
      motherPhone: String,
      motherOccupation: String,
      guardianName: String,
      guardianPhone: String,
      guardianRelation: String
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', '']
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', '']
    },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', ''],
      default: 'General'
    },
    admissionYear: Number,
    batch: String,
    scholarshipStatus: {
      type: Boolean,
      default: false
    },
    hostelResident: {
      type: Boolean,
      default: false
    },
    disciplinaryNotes: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    photo: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for search performance
studentSchema.index({ name: 'text', registerNumber: 'text', studentId: 'text', email: 'text' });
studentSchema.index({ department: 1 });
studentSchema.index({ year: 1, semester: 1 });
studentSchema.index({ cgpa: 1 });

module.exports = mongoose.model('Student', studentSchema);
