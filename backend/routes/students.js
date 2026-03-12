const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Student = require('../models/Student');
const MalpracticeRecord = require('../models/MalpracticeRecord');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/students - Get all students with pagination, search, filter
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      year = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minCgpa = '',
      maxCgpa = ''
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) filter.department = { $regex: department, $options: 'i' };
    if (year) filter.year = parseInt(year);
    if (minCgpa !== '' || maxCgpa !== '') {
      filter.cgpa = {};
      if (minCgpa !== '') filter.cgpa.$gte = parseFloat(minCgpa);
      if (maxCgpa !== '') filter.cgpa.$lte = parseFloat(maxCgpa);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .select('-documents -semesterGPA')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/students/:id - Get single student with full details
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const malpracticeRecords = await MalpracticeRecord.find({ student: student._id })
      .sort({ incidentDate: -1 })
      .populate('reportedBy', 'name email');

    res.json({ success: true, data: { ...student.toObject(), malpracticeRecords } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/students - Create new student (Admin only)
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('registerNumber').notEmpty().withMessage('Register number is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('year').isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
    body('semester').isInt({ min: 1, max: 10 }).withMessage('Semester must be between 1 and 10')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      // Check for duplicate
      const exists = await Student.findOne({
        $or: [
          { studentId: req.body.studentId },
          { registerNumber: req.body.registerNumber },
          { email: req.body.email }
        ]
      });

      if (exists) {
        let field = 'Student ID';
        if (exists.registerNumber === req.body.registerNumber) field = 'Register Number';
        if (exists.email === req.body.email) field = 'Email';
        return res.status(400).json({ success: false, message: `${field} already exists` });
      }

      const student = await Student.create(req.body);
      res.status(201).json({ success: true, message: 'Student created successfully', data: student });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// PUT /api/students/:id - Update student (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Prevent changing unique fields to duplicates
    if (req.body.email && req.body.email !== student.email) {
      const emailExists = await Student.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/students/:id - Soft delete (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/students/departments/list - Get unique departments
router.get('/departments/list', protect, async (req, res) => {
  try {
    const departments = await Student.distinct('department', { isActive: true });
    res.json({ success: true, data: departments.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
