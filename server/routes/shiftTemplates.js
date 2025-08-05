const express = require('express');
const router = express.Router();

const ShiftTemplate = require('../models/ShiftTemplate');

/**
 * @route   POST /api/shifttemplates
 * @desc    Create a new shift template
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { name, startTime, endTime } = req.body;

        let shift = await ShiftTemplate.findOne({ name });
        if (shift) {
            return res.status(400).json({ msg: 'A shift template with this name already exists.' });
        }
        const newShiftTemplate = new ShiftTemplate({
            name,
            startTime,
            endTime
        });
        const savedShift = await newShiftTemplate.save();
        res.status(201).json(savedShift);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/shifttemplates
 * @desc    Get all shift templates
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const shifts = await ShiftTemplate.find().sort({ startTime: 1 });
        res.json(shifts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /api/shiftTemplates/:id
 * @desc    Update a shift template
 * @access  Public
 */
router.put('/:id', async (req, res) => {
    const { name, startTime, endTime } = req.body;
    try {
        let shift = await ShiftTemplate.findById(req.params.id);
        if (!shift) {
            return res.status(404).json({ msg: 'Shift template not found' });
        }
        shift.name = name;
        shift.startTime = startTime;
        shift.endTime = endTime;
        await shift.save();
        res.json(shift);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE /api/shiftTemplates/:id
 * @desc    Delete a shift template
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
    try {
        let shift = await ShiftTemplate.findById(req.params.id);
        if (!shift) {
            return res.status(404).json({ msg: 'Shift template not found' });
        }
        await shift.deleteOne();
        res.json({ msg: 'Shift template removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;