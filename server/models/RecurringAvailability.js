const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecurringAvailabilitySchema = new Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },

    shiftTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShiftTemplate',
        required: true
    },

    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
}, {
    timestamps: true
});

RecurringAvailabilitySchema.index({ employeeId: 1, shiftTemplateId: 1, dayOfWeek: 1 }, { unique: true });
module.exports = mongoose.model('RecurringAvailability', RecurringAvailabilitySchema);