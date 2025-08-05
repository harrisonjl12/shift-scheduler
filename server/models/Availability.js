const mongoose = require('mongoose');
const { Schema } = mongoose;

const AvailabilitySchema = new Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    unavailableDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
AvailabilitySchema.index({ employeeId: 1, unavailableDate: 1 }, { unique: true });
module.exports = mongoose.model('Availability', AvailabilitySchema);