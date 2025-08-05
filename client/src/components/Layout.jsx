import React from 'react';
import { Toaster } from 'react-hot-toast';
import { SlidersHorizontal, Users, CalendarDays, GanttChartSquare } from 'lucide-react';

const navLinks = [
    { name: 'Generate Schedule', id: 'generator', icon: SlidersHorizontal },
    { name: 'Employees', id: 'employees', icon: Users },
    { name: 'Shift Templates', id: 'shifts', icon: CalendarDays },
    { name: 'Availability', id: 'availability', icon: GanttChartSquare },
];

function Layout({ currentPage, setCurrentPage, children }) {
    const navButtonStyles = "px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white";
    const activeStyles = "bg-gray-900 text-white";
    const inactiveStyles = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <div>
            {/* This component will display all the toast notifications */}
            <Toaster position="top-center" reverseOrder={false} />

            <nav className="bg-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-start h-16">
                        <div className="flex items-center">
                            <div className="flex space-x-4">
                                {navLinks.map(link => {
                                    const Icon = link.icon;
                                    return (
                                        <button
                                            key={link.id}
                                            onClick={() => setCurrentPage(link.id)}
                                            className={`${navButtonStyles} ${currentPage === link.id ? activeStyles : inactiveStyles}`}
                                        >
                                            <Icon size={16} />
                                            <span>{link.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="bg-gray-100 min-h-screen">
                {children}
            </main>
        </div>
    );
}

export default Layout;