# Automated Shift Scheduler

A full-stack MERN application designed to help managers automate and manage employee schedules. This tool streamlines the scheduling process by intelligently assigning shifts based on employee availability, weekly hour constraints, and business needs, while also providing a complete suite of management tools.

---

## Features

This application provides an end-to-end solution for schedule management, from data entry to a fully interactive and adjustable schedule.

* **Automated Schedule Generation:** The core of the application is an intelligent algorithm that generates a schedule for any given date range based on pre-defined requirements.
* **Smart Assignment Logic:** The scheduling engine respects employee constraints, including:
    * Recurring weekly availability for specific shifts.
    * Minimum and maximum desired shifts per week.
    * Prevents employees from being double-booked on the same day.
* **Interactive Calendar View:** The generated schedule is displayed in a clean, intuitive calendar grid, making it easy to see the week or month at a glance.
* **Manual Overrides:** Managers can click on any shift in the generated calendar to manually reassign it to another eligible employee, providing complete control over the final schedule.
* **Comprehensive Data Management:** Full CRUD (Create, Read, Update, Delete) functionality for:
    * **Employees:** Manage employee profiles, contact info, roles, and shift preferences.
    * **Shift Templates:** Define reusable shift types with specific start and end times.
* **Polished User Experience:** The interface is designed to be user-friendly and responsive, featuring:
    * Toast notifications for clear feedback on all actions.
    * Helpful loading states and empty-state messages.
    * A clean, icon-driven UI for intuitive navigation.

---

## Technology Stack

This project is built using the MERN stack and modern development practices.

* **Frontend:** **React** (with Vite), **Tailwind CSS**
* **Backend:** **Node.js** & **Express.js**
* **Database:** **MongoDB** (with Mongoose)
* **UI Libraries:** `lucide-react` for icons, `react-hot-toast` for notifications.
* **Deployment:** Hosted on **Vercel** (Frontend) and **Render** (Backend).

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js and npm installed.
* A free MongoDB Atlas account and cluster.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/shift-scheduler.git](https://github.com/your-username/shift-scheduler.git)
    cd shift-scheduler
    ```

2.  **Set up the Backend Server:**
    ```sh
    # Navigate to the server directory
    cd server
    
    # Install dependencies
    npm install
    
    # Create a .env file and add your MongoDB connection string
    MONGO_URI=your_mongodb_connection_string
    ```

3.  **Set up the Frontend Client:**
    ```sh
    # Navigate to the client directory from the root
    cd client
    
    # Install dependencies
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    * In a terminal in the `/server` directory: `npm run dev`

2.  **Start the Frontend Client:**
    * In a second terminal in the `/client` directory: `npm run dev`

---

## Project Status

This project is **feature-complete** and deployed. Future enhancements could include features like time-off requests, employee-facing accounts for self-service availability, or more advanced scheduling rules.