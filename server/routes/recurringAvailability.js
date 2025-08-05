const express = require('express');
const router = express.Router();
const RecurringAvailability = require('../models/RecurringAvailability');

/**
 * @route   GET /api/recurring-availability
 * @desc    Get all recurring availability for ALL employees
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const allPreferences = await RecurringAvailability.find();
        res.json(allPreferences);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/recurring-availability/:employeeId
 * @desc    Get all recurring availability for a specific employee
 * @access  Public
 */
router.get('/:employeeId', async (req, res) => {
    try {
        const preferences = await RecurringAvailability.find({ employeeId: req.params.employeeId });
        res.json(preferences);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/recurring-availability
 * @desc    Create a new recurring availability preference
 * @access  Public
 */
router.post('/', async (req, res) => {
    const { employeeId, shiftTemplateId, dayOfWeek } = req.body;
    try {
        const newPreference = new RecurringAvailability({
            employeeId,
            shiftTemplateId,
            dayOfWeek
        });

        const preference = await newPreference.save();
        res.status(201).json(preference);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'This recurring preference has already been set.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE /api/recurring-availability
 * @desc    Delete a recurring availability preference
 * @access  Public
 */
router.delete('/', async (req, res) => {
    const { employeeId, shiftTemplateId, dayOfWeek } = req.body;
    try {
        const preference = await RecurringAvailability.findOne({
            employeeId,
            shiftTemplateId,
            dayOfWeek
        });

        if (!preference) {
            return res.status(400).json({ msg: 'Recurring preference not found.' });
        }

        await preference.deleteOne();
        res.json({ msg: 'Recurring preference removed.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;