import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CalendarCheck } from 'lucide-react';

function ScheduleGeneratorPage() {
    const [shiftTemplates, setShiftTemplates] = useState([]);
    const [requirements, setRequirements] = useState({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [generatedSchedule, setGeneratedSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [eligibleEmployees, setEligibleEmployees] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [availabilityMap, setAvailabilityMap] = useState(new Map());

    // Fetch shift templates on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [shiftsRes, employeesRes, availRes] = await Promise.all([
                    axios.get('/api/shifttemplates'),
                    axios.get('/api/employees'),
                    axios.get('/api/recurring-availability') // Fetches ALL availability records
                ]);
                setShiftTemplates(shiftsRes.data);
                setAllEmployees(employeesRes.data);

                // Process availability data for quick lookups on the frontend
                const newAvailabilityMap = new Map();
                availRes.data.forEach(avail => {
                    const key = avail.employeeId.toString();
                    if (!newAvailabilityMap.has(key)) {
                        newAvailabilityMap.set(key, new Set());
                    }
                    newAvailabilityMap.get(key).add(`${avail.dayOfWeek}-${avail.shiftTemplateId.toString()}`);
                });
                setAvailabilityMap(newAvailabilityMap);

            } catch (err) {
                setError('Could not fetch initial data.');
                console.error(err);
            }
        };
        fetchInitialData();
    }, []);

    const handleRequirementChange = (shiftId, count) => {
        setRequirements(prev => ({
            ...prev,
            [shiftId]: Number(count)
        }));
    };

    const handleGenerateSchedule = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select a start and end date.');
            return;
        }
        setLoading(true);
        setGeneratedSchedule(null);

        const toastId = toast.loading('Generating schedule...');
        try {
            const res = await axios.post('/api/schedule/generate', {
                startDate,
                endDate,
                requirements
            });

            const populatedSchedule = await populateScheduleDetails(res.data);
            setGeneratedSchedule(populatedSchedule);
            toast.success('Schedule generated successfully!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to generate schedule.', { id: toastId });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get names for employees and shifts
    const populateScheduleDetails = async (schedule) => {
        if (!Array.isArray(schedule)) return {};

        try {
            const [employeesRes, shiftsRes] = await Promise.all([
                axios.get('/api/employees'),
                axios.get('/api/shifttemplates')
            ]);
            const employeesMap = new Map(employeesRes.data.map(e => [e._id, e.name]));
            const shiftsMap = new Map(shiftsRes.data.map(s => [s._id, s.name]));

            const populated = schedule.map(shift => ({
                ...shift,
                employeeName: employeesMap.get(shift.employeeId) || 'Unknown',
                shiftName: shiftsMap.get(shift.shiftTemplateId) || 'Unknown'
            }));

            // Group shifts by date
            const groupedByDate = populated.reduce((acc, shift) => {
                const dateKey = shift.date.substring(0, 10);

                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(shift);
                return acc;
            }, {});

            return groupedByDate;

        } catch (error) {
            console.error("Error populating schedule details", error);
            setError("Could not load full schedule details.");
            return {};
        }
    };

    const calendarGrid = useMemo(() => {
        if (!generatedSchedule || !startDate || !endDate) return null;

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        // Get the day of the week for the ACTUAL start date of the range.
        const startingDayOfWeek = start.getDay(); // 0 for Sunday, 1 for Monday...

        let grid = [];
        // Add empty cells for padding to align the start date with the correct day column.
        for (let i = 0; i < startingDayOfWeek; i++) {
            grid.push({ key: `empty-${i}`, isEmpty: true });
        }

        // Add a cell for each day in the selected date range.
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateKey = currentDate.toISOString().substring(0, 10);
            grid.push({
                key: dateKey,
                date: new Date(currentDate),
                shifts: generatedSchedule[dateKey] || []
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return grid;
    }, [generatedSchedule, startDate, endDate]);

    const handleShiftClick = (shift, dateKey) => {
        const shiftDate = new Date(`${dateKey}T00:00:00`);
        const dayOfWeek = shiftDate.getDay();

        // Find employees available for this specific shift and day
        const eligible = allEmployees.filter(emp => {
            const empId = emp._id.toString();
            const availabilityKey = `${dayOfWeek}-${shift.shiftTemplateId}`;
            return availabilityMap.has(empId) && availabilityMap.get(empId).has(availabilityKey);
        });

        setEditingShift({ ...shift, dateKey }); // Store the shift and its date key
        setEligibleEmployees(eligible);
        setIsEditModalOpen(true);
    };

    const handleReassignment = async (newEmployeeId) => {
        if (!editingShift || !newEmployeeId) return;

        try {
            await axios.put(`/api/schedule/${editingShift._id}`, { employeeId: newEmployeeId });

            // Update the schedule state locally to reflect the change immediately
            setGeneratedSchedule(prevSchedule => {
                const newSchedule = { ...prevSchedule };
                const shiftsForDay = [...newSchedule[editingShift.dateKey]];
                const shiftIndex = shiftsForDay.findIndex(s => s._id === editingShift._id);

                if (shiftIndex > -1) {
                    const newEmployee = allEmployees.find(e => e._id === newEmployeeId);
                    shiftsForDay[shiftIndex].employeeId = newEmployeeId;
                    shiftsForDay[shiftIndex].employeeName = newEmployee ? newEmployee.name : 'Unknown';
                }

                newSchedule[editingShift.dateKey] = shiftsForDay;
                return newSchedule;
            });

            setIsEditModalOpen(false);
            setEditingShift(null);

        } catch (err) {
            setError('Failed to reassign shift.');
            console.error(err);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Generate Schedule</h1>

                    {/* Step 1: Date Range */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">1. Select Date Range</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-600">Start Date</label>
                                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-600">End Date</label>
                                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Shift Requirements */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">2. Define Daily Shift Requirements</h2>
                        <div className="space-y-2">
                            {shiftTemplates.map(shift => (
                                <div key={shift._id} className="flex items-center justify-between">
                                    <label htmlFor={`req-${shift._id}`} className="text-gray-600">{shift.name} ({shift.startTime} - {shift.endTime})</label>
                                    <input type="number" id={`req-${shift._id}`} min="0" defaultValue="0" onChange={e => handleRequirementChange(shift._id, e.target.value)} className="w-20 p-1 border border-gray-300 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Generate Button */}
                    <button onClick={handleGenerateSchedule} disabled={loading} className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Generating...' : 'Generate Schedule'}
                    </button>

                    {/* Step 4: Display Schedule */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Generated Schedule</h2>
                        {!generatedSchedule ? (
                            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                                <CalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No Schedule Generated</h3>
                                <p className="mt-1 text-sm text-gray-500">Select a date range and define your requirements to generate a new schedule.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center font-semibold py-2 bg-gray-100">{day}</div>
                                ))}
                                {calendarGrid.map(day => (
                                    day.isEmpty ? <div key={day.key} className="bg-gray-50"></div> : (
                                        <div key={day.key} className="p-2 bg-white min-h-[120px]">
                                            <div className="font-bold text-right text-sm text-gray-500">{day.date.getDate()}</div>
                                            <div className="text-xs mt-1 space-y-1">
                                                {day.shifts.map(shift => (
                                                    <div key={shift._id} onClick={() => handleShiftClick(shift, day.key)} className="bg-blue-100 text-blue-800 p-1 rounded cursor-pointer hover:bg-blue-200 transition-colors">
                                                        <div className="font-semibold">{shift.shiftName}</div>
                                                        <div>{shift.employeeName}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Reassignment Modal */}
            {isEditModalOpen && editingShift && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Reassign Shift</h2>
                        <div className="mb-4 space-y-1">
                            <p><span className="font-semibold">Shift:</span> {editingShift.shiftName}</p>
                            <p><span className="font-semibold">Date:</span> {new Date(`${editingShift.dateKey}T00:00:00`).toDateString()}</p>
                            <p><span className="font-semibold">Current:</span> {editingShift.employeeName}</p>
                        </div>
                        <div>
                            <label htmlFor="reassign-select" className="block text-sm font-medium text-gray-700 mb-1">Assign to:</label>
                            <select
                                id="reassign-select"
                                defaultValue={editingShift.employeeId}
                                onChange={(e) => handleReassignment(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {eligibleEmployees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4 mt-2">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 font-semibold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ScheduleGeneratorPage;