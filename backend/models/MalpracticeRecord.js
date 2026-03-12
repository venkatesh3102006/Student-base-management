const mongoose = require('mongoose');

const malpracticeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    studentId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: [true, 'Malpractice type is required'],
      enum: [
        'Exam Malpractice',
        'Plagiarism',
        'Misconduct',
        'Attendance Fraud',
        'Ragging',
        'Property Damage',
        'Substance Abuse',
        'Harassment',
        'Other'
      ]
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    actionTaken: {
      type: String,
      maxlength: [1000, 'Action taken cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Resolved', 'Dismissed'],
      default: 'Pending'
    },
    examDetails: {
      examName: String,
      subjectCode: String,
      subjectName: String,
      hallTicket: String
    },
    witnesses: [String],
    penaltyGiven: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedByName: String,
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

malpracticeSchema.index({ student: 1 });
malpracticeSchema.index({ incidentDate: -1 });
malpracticeSchema.index({ type: 1 });
malpracticeSchema.index({ status: 1 });

module.exports = mongoose.model('MalpracticeRecord', malpracticeSchema);
