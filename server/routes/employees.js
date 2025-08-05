const express = require('express');
const router = express.Router();

const Employee = require('../models/Employee');

/**
 * @route   POST /api/employees
 * @desc    Create a new employee
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const newEmployee = new Employee({
            name: req.body.name,
            contactInfo: {
                email: req.body.email,
                phone: req.body.phone
            },
            role: req.body.role,
            minShiftsPerWeek: req.body.minShiftsPerWeek,
            maxShiftsPerWeek: req.body.maxShiftsPerWeek
        });
        const employee = await newEmployee.save();
        res.status(201).json(employee);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Validation Error', error: err.message });
        }
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /api/employees/:id
 * @desc    Update an employee
 * @access  Public
 */
router.put('/:id', async (req, res) => {
    const { name, contactInfo, role, minShiftsPerWeek, maxShiftsPerWeek } = req.body;
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        employee.name = name;
        employee.contactInfo = contactInfo;
        employee.role = role;
        employee.minShiftsPerWeek = minShiftsPerWeek;
        employee.maxShiftsPerWeek = maxShiftsPerWeek;

        await employee.save();
        res.json(employee);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete an employee
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ msg: 'Employee not found' });
        }
        await employee.deleteOne();
        res.json({ msg: 'Employee removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;