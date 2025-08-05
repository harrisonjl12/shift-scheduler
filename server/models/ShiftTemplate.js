const mongoose = require('mongoose');
const { Schema } = mongoose;

const ShiftTemplateSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for the shift template'],
        trim: true,
        unique: true
    },
    startTime: {
        type: String,
        required: [true, 'Please provide a start time']
    },
    endTime: {
        type: String,
        required: [true, 'Please provide an end time']
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('ShiftTemplate', ShiftTemplateSchema);