const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScheduledShiftSchema = new Schema({
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

    date: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    }
}, {
    timestamps: true
});

ScheduledShiftSchema.index({ employeeId: 1, shiftTemplateId: 1, date: 1 }, { unique: true });

ScheduledShiftSchema.index({ date: 1 });

module.exports = mongoose.model('ScheduledShift', ScheduledShiftSchema);