import React, { useState, useEffect } from 'react';
import API from '../api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const customStyles = `
  .react-calendar {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background-color: white; /* Ensure calendar has a background */
  }

  /* Style for the navigation bar (month, year, arrows) */
  .react-calendar__navigation button {
    color: #007bff;
    min-width: 44px;
    background: none;
    font-size: 16px;
    margin-top: 8px;
  }

  /* Style for the day of the week labels (Sun, Mon, etc.) */
  .react-calendar__month-view__weekdays__weekday {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
    color: #333;
  }

  /* Default style for each date tile */
  .react-calendar__tile {
    max-width: 100%;
    padding: 10px 6.6667px;
    background: none;
    text-align: center;
    line-height: 16px;
    border-radius: 4px;
  }

  /* Style for today's date */
  .react-calendar__tile--now {
    background: #e6f7ff;
    color: #0062cc;
  }
  
  /* Style for a hovered or focused date */
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #f0f0f0;
  }

  /* Style for the specifically marked unavailable days */
  .unavailable-day {
    background-color: #ff4d4d !important; /* Use !important to override other styles */
    color: white !important;
    border-radius: 50%;
  }
`;

function AvailabilityManagerPage() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [availability, setAvailability] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await API.get('/api/employees');
                setEmployees(res.data);
            } catch (err) {
                setError('Could not fetch employees.');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (!selectedEmployee) {
            setAvailability([]);
            return;
        }
        const fetchAvailability = async () => {
            try {
                const res = await API.get(`/api/availability/${selectedEmployee}`);
                setAvailability(res.data);
            } catch (err) {
                setError('Could not fetch availability for this employee.');
                setAvailability([]);
            }
        };
        fetchAvailability();
    }, [selectedEmployee]);

    const handleDateClick = async (date) => {
        if (!selectedEmployee) {
            setError('Please select an employee first.');
            return;
        }
        setError('');

        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const existingRecord = availability.find(record => {
            const recordDate = new Date(record.unavailableDate);
            return recordDate.getTime() === normalizedDate.getTime();
        });

        try {
            if (existingRecord) {
                await API.delete(`/api/availability/${existingRecord._id}`);
            } else {
                await API.post('/api/availability', {
                    employeeId: selectedEmployee,
                    unavailableDate: normalizedDate,
                });
            }
            const res = await API.get(`/api/availability/${selectedEmployee}`);
            setAvailability(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update availability');
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const isUnavailable = availability.some(record => {
                const recordDate = new Date(record.unavailableDate);
                return date.getFullYear() === recordDate.getFullYear() &&
                    date.getMonth() === recordDate.getMonth() &&
                    date.getDate() === recordDate.getDate();
            });
            if (isUnavailable) {
                return 'unavailable-day';
            }
        }
        return null;
    };

    return (
        <>
            <style>{customStyles}</style>
            <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Manage Employee Availability</h1>

                    {loading && <p>Loading employees...</p>}
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    {/* Employee Selector */}
                    <div className="mb-6">
                        <label htmlFor="employee-select" className="block text-lg font-medium text-gray-700 mb-2">
                            Select an Employee
                        </label>
                        <select
                            id="employee-select"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Please choose an employee --</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Calendar */}
                    {selectedEmployee && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-600 mb-4">
                                Click a date to toggle availability
                            </h2>
                            <Calendar
                                onClickDay={handleDateClick}
                                tileClassName={tileClassName}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AvailabilityManagerPage;