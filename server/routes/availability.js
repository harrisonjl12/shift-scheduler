const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Availability = require('../models/Availability');

/**
 * @route   GET /api/availability/:employeeId
 * @desc    Get all unavailability records for a specific employy
 * @access  Public
 */
router.get('/employeeId', async (req, res) => {
    try {
        const records = await Availability.find({ employeeId: req.params.employeeId });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/availibilty
 * @desc    Create a new unavailability record
 * @access  Public
 */
router.post('/', async (req, res) => {
    const { employeeId, unavailableDate } = req.body;

    if (!employeeId || !unavailableDate) {
        return res.status(400).json({ msg: 'Please provide both an employeeId and an unavailableDate.' });
    }

    try {
        const newRecord = new Availability({
            employeeId,
            unavailableDate
        });

        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'This date is already marked as unavailable for this employee.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE /api/availability/:recordId
 * @desc    Delete an unavailability record by its own _id
 * @access  Public
 */
router.delete('/:recordId', async (req, res) => {
    try {
        const record = await Availability.findById(req.params.recordId);

        if (!record) {
            return res.status(404).json({ msg: 'Availability record not found.' });
        }
        await record.deleteOne();
        res.json({ msg: 'Availability record removed.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;