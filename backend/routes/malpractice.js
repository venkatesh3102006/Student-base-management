const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MalpracticeRecord = require('../models/MalpracticeRecord');
const Student = require('../models/Student');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/malpractice - Get all records
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', type = '', severity = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await MalpracticeRecord.countDocuments(filter);
    const records = await MalpracticeRecord.find(filter)
      .populate('student', 'name studentId registerNumber department year')
      .populate('reportedBy', 'name')
      .sort({ incidentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: records,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/malpractice/student/:studentId
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const records = await MalpracticeRecord.find({ student: req.params.studentId })
      .populate('reportedBy', 'name email')
      .sort({ incidentDate: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/malpractice - Add new record (Admin only)
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('student').notEmpty().withMessage('Student ID is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('incidentDate').isISO8601().withMessage('Valid incident date is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const student = await Student.findById(req.body.student);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

      const record = await MalpracticeRecord.create({
        ...req.body,
        studentId: student.studentId,
        reportedBy: req.user._id,
        reportedByName: req.user.name
      });

      const populated = await record.populate('student', 'name studentId registerNumber');
      res.status(201).json({ success: true, message: 'Malpractice record added', data: populated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// PUT /api/malpractice/:id (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const record = await MalpracticeRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('student', 'name studentId');

    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record updated', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/malpractice/:id (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const record = await MalpracticeRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
