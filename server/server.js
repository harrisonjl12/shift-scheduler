// server/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employees');
const shiftTemplateRoutes = require('./routes/shiftTemplates');
const availabilityRoutes = require('./routes/availability');
const recurringAvailabilityRoutes = require('./routes/recurringAvailability');
const scheduleRoutes = require('./routes/schedule');
require('dotenv').config(); //Loads environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: 'https://shift-scheduler-iota.vercel.app',
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(express.json()); // Allow the server to parse JSON bodies

// --- Mongoose Connection ---
const uri = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected...");

        // Start listening for requests only after the DB connection is successful
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error(err.message);
        process.exit(1); // Exit the process with failure
    }
};

// --- Routes ---
// A simple test route to make sure everything is working
app.get('/', (req, res) => {
    res.json({ message: "Hello from the Backend server!" });
});
app.use('/api/employees', employeeRoutes);
app.use('/api/shifttemplates', shiftTemplateRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/recurring-availability', recurringAvailabilityRoutes);
app.use('/api/schedule', scheduleRoutes);
// --- Start the Connection ---
connectDB();