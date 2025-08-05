const express = require('express');
const router = express.Router();

// Import all the models we'll need
const Employee = require('../models/Employee');
const ShiftTemplate = require('../models/ShiftTemplate');
const RecurringAvailability = require('../models/RecurringAvailability');
const ScheduledShift = require('../models/ScheduledShift');

/**
 * @route   POST /api/schedule/generate
 * @desc    Generate a new schedule for a given date range and requirements
 * @access  Public
 */
router.post('/generate', async (req, res) => {
    const { startDate, endDate, requirements } = req.body;

    if (!startDate || !endDate || !requirements) {
        return res.status(400).json({ msg: 'Please provide start date, end date, and shift requirements.' });
    }

    try {
        // --- 1. GATHER ALL NECESSARY DATA ---
        const allEmployees = await Employee.find();
        const allRecurringAvailability = await RecurringAvailability.find();

        const availabilityMap = new Map();
        for (const avail of allRecurringAvailability) {
            const key = avail.employeeId.toString();
            if (!availabilityMap.has(key)) {
                availabilityMap.set(key, new Set());
            }
            availabilityMap.get(key).add(`${avail.dayOfWeek}-${avail.shiftTemplateId.toString()}`);
        }

        const startParts = startDate.split('-').map(Number);
        const endParts = endDate.split('-').map(Number);

        const utcStartDate = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
        const utcEndDate = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));

        // --- 2. CLEAR ANY EXISTING DRAFT SHIFTS IN THE DATE RANGE ---
        await ScheduledShift.deleteMany({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
            status: 'Draft'
        });

        // --- 3. THE UPGRADED SCHEDULING ALGORITHM ---
        const generatedShifts = [];
        const currentDate = new Date(utcStartDate);
        const finalDate = new Date(utcEndDate);

        // Map to track weekly shift counts for each employee { employeeId: count }
        let weeklyShiftCounts = new Map();
        allEmployees.forEach(emp => weeklyShiftCounts.set(emp._id.toString(), 0));

        while (currentDate <= finalDate) {
            const dayOfWeek = currentDate.getUTCDay();

            // If it's Sunday (start of the week), reset the weekly shift counts
            if (dayOfWeek === 0) {
                weeklyShiftCounts = new Map();
                allEmployees.forEach(emp => weeklyShiftCounts.set(emp._id.toString(), 0));
            }

            const assignmentsForToday = new Set();

            for (const shiftTemplateId in requirements) {
                const requiredCount = requirements[shiftTemplateId];

                for (let i = 0; i < requiredCount; i++) {
                    // Find potential candidates who are available for this shift
                    let potentialCandidates = allEmployees.filter(emp => {
                        const empId = emp._id.toString();
                        const availabilityKey = `${dayOfWeek}-${shiftTemplateId}`;
                        const currentShiftCount = weeklyShiftCounts.get(empId) || 0;

                        // Check availability, if they haven't hit their max shifts, and if they aren't already working today
                        return availabilityMap.has(empId) &&
                            availabilityMap.get(empId).has(availabilityKey) &&
                            (!emp.maxShiftsPerWeek || currentShiftCount < emp.maxShiftsPerWeek) &&
                            !assignmentsForToday.has(empId);
                    });

                    if (potentialCandidates.length > 0) {
                        // **Smarter Assignment**: Prioritize employees who are furthest from their minimum shifts
                        potentialCandidates.sort((a, b) => {
                            const countA = weeklyShiftCounts.get(a._id.toString()) || 0;
                            const countB = weeklyShiftCounts.get(b._id.toString()) || 0;
                            return countA - countB; // Sorts in ascending order of shifts worked
                        });

                        const assignedEmployee = potentialCandidates[0];
                        const empId = assignedEmployee._id.toString();

                        const newShift = {
                            employeeId: assignedEmployee._id,
                            shiftTemplateId: shiftTemplateId,
                            date: new Date(currentDate),
                            status: 'Draft'
                        };
                        generatedShifts.push(newShift);

                        // Update tracking maps
                        assignmentsForToday.add(empId);
                        weeklyShiftCounts.set(empId, (weeklyShiftCounts.get(empId) || 0) + 1);

                    } else {
                        console.log(`Could not find an available employee for shift ${shiftTemplateId} on ${currentDate.toDateString()}`);
                    }
                }
            }
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        // --- 4. SAVE THE NEWLY GENERATED SHIFTS TO THE DATABASE ---
        if (generatedShifts.length > 0) {
            const savedShifts = await ScheduledShift.insertMany(generatedShifts);
            res.status(201).json(savedShifts);
        } else {
            res.json({ msg: 'No shifts were generated. Check availability and requirements.' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /api/schedule/:shiftId
 * @desc    Update a single scheduled shift
 * @access  Public
 */
router.put('/:shiftId', async (req, res) => {
    const { employeeId } = req.body;

    if (!employeeId) {
        return res.status(400).json({ msg: 'Scheduled shifts not found.' });
    }

    try {
        const shiftToUpdate = await ScheduledShift.findById(req.params.shiftId);

        if (!shiftToUpdate) {
            return res.status(404).json({ msg: 'Scheduled shift not found' });
        }
        shiftToUpdate.employeeId = employeeId;

        await shiftToUpdate.save();

        res.json(shiftToUpdate);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
