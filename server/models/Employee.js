const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide the employee\'s name'],
        trim: true
    },

    contactInfo: {
        email: {
            type: String,
            required: [true, 'Please provide the employee\'s email'],
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
        },

        phone: {
            type: String,
            required: [true, 'Please provide the employee\'s phone number'],
            match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
        }
    },

    role: {
        type: String,
        enum: ['Lead', 'Staff'],
        default: 'Staff'
    },

    minShiftsPerWeek: {
        type: Number,
        default: 0
    },

    maxShiftsPerWeek: {
        type: Number,
        validate: {
            validator: function (value) {
                return value >= this.minShiftsPerWeek;
            },
            message: 'Max shifts per week cannot be less than min shifts.'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', EmployeeSchema);