// client/src/components/EmployeeManagerPage.jsx

import React, { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { Trash2, Edit, UserPlus } from 'lucide-react';

function EmployeeManagerPage() {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Staff',
        minShiftsPerWeek: '',
        maxShiftsPerWeek: ''
    });
    const [error, setError] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await API.get('/api/employees');
            setEmployees(response.data);
        } catch (err) {
            toast.error('Could not fetch employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCurrentEmployeeChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email' || name === 'phone') {
            setCurrentEmployee(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, [name]: value }
            }));
        } else {
            setCurrentEmployee(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding employee..');
        try {
            await API.post('/api/employees', formData);
            setFormData({ name: '', email: '', phone: '', role: 'Staff', minShiftsPerWeek: '', maxShiftsPerWeek: '' });
            fetchEmployees();
            toast.success('Employee added successfully!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create employee.', { id: toastId });
        }
    };

    const handleDelete = async (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee? This will also remove their availability preferences.')) {
            const toastId = toast.loading('Deleting employee...');
            try {
                await API.delete(`/api/employees/${employeeId}`);
                fetchEmployees();
                toast.success('Employee deleted.', { id: toastId });
            } catch (err) {
                toast.error('Failed to delete employee.', { id: toastId });
            }
        }
    };

    const handleEditClick = (employee) => {
        setCurrentEmployee({ ...employee });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!currentEmployee) return;

        // Ensure shift limits are numbers
        const updatedEmployeeData = {
            ...currentEmployee,
            minShiftsPerWeek: currentEmployee.minShiftsPerWeek ? Number(currentEmployee.minShiftsPerWeek) : 0,
            maxShiftsPerWeek: currentEmployee.maxShiftsPerWeek ? Number(currentEmployee.maxShiftsPerWeek) : undefined
        };
        const toastId = toast.loading('Updating employee...');
        try {
            await API.put(`/api/employees/${currentEmployee._id}`, updatedEmployeeData);
            setIsEditModalOpen(false);
            setCurrentEmployee(null);
            fetchEmployees();
            toast.success('Employee updated.', { id: toastId });
        } catch (err) {
            toast.error('Failed to update employee.', { id: toastId });
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Employee Management</h1>

                    {/* Add Employee Form */}
                    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700">Add New Employee</h2>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                            <select name="role" id="role" value={formData.role} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="Staff">Staff</option>
                                <option value="Lead">Lead</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="minShiftsPerWeek" className="block text-sm font-medium text-gray-600 mb-1">Min Shifts/Week</label>
                                <input type="number" name="minShiftsPerWeek" id="minShiftsPerWeek" value={formData.minShiftsPerWeek} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" min="0" />
                            </div>
                            <div>
                                <label htmlFor="maxShiftsPerWeek" className="block text-sm font-medium text-gray-600 mb-1">Max Shifts/Week</label>
                                <input type="number" name="maxShiftsPerWeek" id="maxShiftsPerWeek" value={formData.maxShiftsPerWeek} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" min="0" />
                            </div>
                        </div>
                        <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Employee</button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </form>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Current Employees ({employees.length})</h2>
                        {loading ? (
                            <p className="text-center text-gray-500 py-4">Loading employees...</p>
                        ) : employees.length === 0 ? (
                            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                                <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No Employees Found</h3>
                                <p className="mt-1 text-sm text-gray-500">Add your first employee using the form above.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {employees.map(employee => (
                                    <li key={employee._id} className="bg-gray-50 p-4 rounded-md flex justify-between items-center shadow-sm flex-wrap">
                                        <div className="flex-grow">
                                            <span className="font-bold text-gray-800">{employee.name}</span>
                                            <span className="block text-sm text-gray-600">{employee.contactInfo.email}</span>
                                        </div>
                                        <div className="text-right mt-2 sm:mt-0 flex items-center space-x-4">
                                            <div>
                                                <span className="text-gray-600 bg-gray-200 text-xs font-medium px-3 py-1 rounded-full">{employee.role}</span>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Shifts: {employee.minShiftsPerWeek ?? 'N/A'} - {employee.maxShiftsPerWeek ?? 'N/A'}
                                                </div>
                                            </div>
                                            <div className="flex space-x-1">
                                                <button onClick={() => handleEditClick(employee)} className="p-2 text-gray-500 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition-colors"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(employee._id)} className="p-2 text-gray-500 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Employee Modal */}
            {isEditModalOpen && currentEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="edit-name" name="name" value={currentEmployee.name} onChange={handleCurrentEmployeeChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="edit-email" name="email" value={currentEmployee.contactInfo.email} onChange={handleCurrentEmployeeChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">Role</label>
                                <select id="edit-role" name="role" value={currentEmployee.role} onChange={handleCurrentEmployeeChange} className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="Cashier">Cashier</option>
                                    <option value="Cook">Cook</option>
                                    <option value="Server">Server</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Bartender">Bartender</option>
                                    <option value="Host">Host</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-minShifts" className="block text-sm font-medium text-gray-700">Min Shifts</label>
                                    <input type="number" id="edit-minShifts" name="minShiftsPerWeek" value={currentEmployee.minShiftsPerWeek ?? ''} onChange={handleCurrentEmployeeChange} className="w-full p-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="edit-maxShifts" className="block text-sm font-medium text-gray-700">Max Shifts</label>
                                    <input type="number" id="edit-maxShifts" name="maxShiftsPerWeek" value={currentEmployee.maxShiftsPerWeek ?? ''} onChange={handleCurrentEmployeeChange} className="w-full p-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default EmployeeManagerPage;
