
import React, { useState, useEffect } from 'react';
import { API } from '../api';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';

// A static array representing the days of the week
const DAYS_OF_WEEK = [
    { name: 'Sunday', index: 0 },
    { name: 'Monday', index: 1 },
    { name: 'Tuesday', index: 2 },
    { name: 'Wednesday', index: 3 },
    { name: 'Thursday', index: 4 },
    { name: 'Friday', index: 5 },
    { name: 'Saturday', index: 6 },
];

function WeeklyAvailability() {
    const [employees, setEmployees] = useState([]);
    const [shiftTemplates, setShiftTemplates] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [preferences, setPreferences] = useState([]); // Stores recurring availability
    const [loading, setLoading] = useState(true);

    // Fetch employees and shift templates once on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [empRes, shiftRes] = await Promise.all([
                    API.get('/api/employees'),
                    API.get('/api/shifttemplates')
                ]);
                setEmployees(empRes.data);
                setShiftTemplates(shiftRes.data);
            } catch (err) {
                toast.error('Failed to load initial data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch recurring preferences whenever the selected employee changes
    useEffect(() => {
        if (!selectedEmployee) {
            setPreferences([]);
            return;
        }

        const fetchPreferences = async () => {
            try {
                const res = await API.get(`/api/recurring-availability/${selectedEmployee}`);
                setPreferences(res.data);
            } catch (err) {
                toast.error('Failed to load recurring availability.');
                console.error(err);
            }
        };

        fetchPreferences();
    }, [selectedEmployee]);

    const handleCheckboxChange = async (dayIndex, shiftTemplateId, isChecked) => {
        if (!selectedEmployee) return;

        const operationPromise = isChecked
            ? API.post('/api/recurring-availability', { employeeId: selectedEmployee, shiftTemplateId, dayOfWeek: dayIndex })
            : API.delete('/api/recurring-availability', { data: { employeeId: selectedEmployee, shiftTemplateId, dayOfWeek: dayIndex } });

        toast.promise(operationPromise, {
            loading: 'Updating availability...',
            success: (res) => {
                // Manually update state for instant feedback
                if (isChecked) {
                    setPreferences(prev => [...prev, res.data]);
                } else {
                    setPreferences(prev => prev.filter(p => !(p.dayOfWeek === dayIndex && p.shiftTemplateId === shiftTemplateId)));
                }
                return 'Availability updated!';
            },
            error: 'Could not update availability.',
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Default Weekly Availability</h1>

                <div className="mb-6">
                    <label htmlFor="employee-select" className="block text-lg font-medium text-gray-700 mb-2">Select an Employee</label>
                    <select
                        id="employee-select"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Please choose an employee --</option>
                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                    </select>
                </div>

                {!selectedEmployee ? (
                    <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Select an Employee</h3>
                        <p className="mt-1 text-sm text-gray-500">Choose an employee from the list above to view or edit their weekly availability.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day.index} className="bg-gray-50 p-3 rounded-lg border">
                                <h3 className="font-bold text-center mb-3">{day.name}</h3>
                                <div className="space-y-2">
                                    {shiftTemplates.map(shift => {
                                        const isChecked = preferences.some(p => p.dayOfWeek === day.index && p.shiftTemplateId === shift._id);
                                        return (
                                            <div key={shift._id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`${day.index}-${shift._id}`}
                                                    checked={isChecked}
                                                    onChange={(e) => handleCheckboxChange(day.index, shift._id, e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor={`${day.index}-${shift._id}`} className="ml-2 text-sm text-gray-700">{shift.name}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WeeklyAvailability;