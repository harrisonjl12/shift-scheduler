// client/src/App.jsx

import React, { useState } from 'react';
import Layout from './components/Layout';
import EmployeeManagerPage from './components/EmployeeManagerPage';
import ShiftManagerPage from './components/ShiftManagerPage';
import WeeklyAvailability from './components/WeeklyAvailability';
import ScheduleGeneratorPage from './components/ScheduleGeneratorPage';

function App() {
  const [currentPage, setCurrentPage] = useState('generator');

  const renderPage = () => {
    switch (currentPage) {
      case 'employees':
        return <EmployeeManagerPage />;
      case 'shifts':
        return <ShiftManagerPage />;
      case 'availability':
        return <WeeklyAvailability />;
      case 'generator':
        return <ScheduleGeneratorPage />;
      default:
        return <ScheduleGeneratorPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;