// client/src/components/ShiftManagerPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Edit, CalendarPlus } from 'lucide-react';

function ShiftManagerPage() {
    const [shifts, setShifts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: ''
    });
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentShift, setCurrentShift] = useState(null);

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/shifttemplates');
            setShifts(response.data);
        } catch (err) {
            toast.error('Could not fetch shift templates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCurrentShiftChange = (e) => {
        setCurrentShift({ ...currentShift, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding shift template...');

        try {
            await axios.post('/api/shifttemplates', formData);
            setFormData({ name: '', startTime: '', endTime: '' });
            fetchShifts();
            toast.success('Shift template added!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to create shift template.', { id: toastId });
        }
    };

    const handleDelete = async (shiftId) => {
        if (window.confirm('Are you sure you want to delete this shift template? This action cannot be undone.')) {
            const toastId = toast.loading('Deleting shift template...');
            try {
                await axios.delete(`/api/shifttemplates/${shiftId}`);
                fetchShifts();
                toast.success('Shift template deleted', { id: toastId })
            } catch (err) {
                toast.error('Failed to delete shift.', { id: toastId });
            }
        }
    };

    const handleEditClick = (shift) => {
        setCurrentShift({ ...shift });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!currentShift) return;
        const toastId = toast.loading('Updating shift template...');
        try {
            await axios.put(`/api/shifttemplates/${currentShift._id}`, currentShift);
            setIsEditModalOpen(false);
            setCurrentShift(null);
            fetchShifts();
            toast.success('Shift template updated', { id: toastId });
        } catch (err) {
            toast.error('Failed to update shift.', { id: toastId });
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Shift Template Management</h1>

                    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700">Add New Shift Template</h2>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Shift Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                                <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                                <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Shift Template</button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </form>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Existing Shifts ({shifts.length})</h2>
                        {loading ? (
                            <p className="text-center text-gray-500 py-4">Loading shifts...</p>
                        ) : shifts.length === 0 ? (
                            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                                <CalendarPlus className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No Shift Templates</h3>
                                <p className="mt-1 text-sm text-gray-500">Create your first shift template using the form above.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {shifts.map(shift => (
                                    <li key={shift._id} className="bg-gray-50 p-4 rounded-md flex justify-between items-center shadow-sm">
                                        <div>
                                            <span className="font-bold text-gray-800">{shift.name}</span>
                                            <span className="block text-sm text-gray-600">{shift.startTime} - {shift.endTime}</span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button onClick={() => handleEditClick(shift)} className="p-2 text-gray-500 rounded-md hover:bg-yellow-100 hover:text-yellow-600 transition-colors"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(shift._id)} className="p-2 text-gray-500 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && currentShift && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Shift Template</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Shift Name</label>
                                <input type="text" id="edit-name" name="name" value={currentShift.name} onChange={handleCurrentShiftChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="edit-startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input type="time" id="edit-startTime" name="startTime" value={currentShift.startTime} onChange={handleCurrentShiftChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="edit-endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                                <input type="time" id="edit-endTime" name="endTime" value={currentShift.endTime} onChange={handleCurrentShiftChange} required className="w-full p-2 border border-gray-300 rounded-md" />
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

export default ShiftManagerPage;
