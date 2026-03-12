const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const MalpracticeRecord = require('../models/MalpracticeRecord');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/stats/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalMalpractice,
      pendingMalpractice,
      departmentStats,
      yearStats,
      cgpaDistribution,
      recentStudents,
      recentMalpractice,
      malpracticeByType
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      MalpracticeRecord.countDocuments(),
      MalpracticeRecord.countDocuments({ status: 'Pending' }),
      Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 }, avgCgpa: { $avg: '$cgpa' } } },
        { $sort: { count: -1 } }
      ]),
      Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Student.aggregate([
        { $match: { isActive: true } },
        {
          $bucket: {
            groupBy: '$cgpa',
            boundaries: [0, 4, 5, 6, 7, 8, 9, 10.1],
            default: 'Other',
            output: { count: { $sum: 1 } }
          }
        }
      ]),
      Student.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name studentId department year cgpa createdAt'),
      MalpracticeRecord.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('student', 'name studentId'),
      MalpracticeRecord.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const avgCgpa = await Student.aggregate([
      { $match: { isActive: true, cgpa: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$cgpa' } } }
    ]);

    const avgAttendance = await Student.aggregate([
      { $match: { isActive: true, attendance: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$attendance' } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalFaculty,
          totalMalpractice,
          pendingMalpractice,
          avgCgpa: avgCgpa[0]?.avg?.toFixed(2) || 0,
          avgAttendance: avgAttendance[0]?.avg?.toFixed(1) || 0
        },
        departmentStats,
        yearStats,
        cgpaDistribution,
        recentStudents,
        recentMalpractice,
        malpracticeByType
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
