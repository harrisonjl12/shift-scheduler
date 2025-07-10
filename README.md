# Automated Shift Scheduler

A full-stack MERN application designed to help managers automate the creation of weekly and monthly employee schedules based on business needs and employee availability.

## Features

This application allows managers to streamline the scheduling process, reducing manual effort and preventing conflicts.

### Implemented Features
* **Employee Management:** Create, view, update, and delete employee profiles, including their name, contact information, and role.
* **Shift Template Management:** Define reusable shift templates (e.g., "Morning Shift", "Closing Shift") with specific start and end times.

### In-Progress & Planned Features
* **Availability Tracking:** Allow managers to input and view employee unavailability for specific dates or recurring times.
* **Automated Schedule Generation:** The core feature – an algorithm that will generate an optimal schedule based on shift requirements and employee availability.
* **Interactive Schedule View:** Display the generated schedule in a clear, easy-to-read calendar or table format.
* **Manual Overrides:** Allow managers to manually adjust the auto-generated schedule to handle exceptions.

## Technology Stack

This project is built using the MERN stack, a powerful and popular choice for building modern web applications.

* **Frontend:** [React](https://reactjs.org/) (with Vite)
* **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js installed on your machine: [Download Node.js](https://nodejs.org/)
* A free MongoDB Atlas account and cluster: [Create a MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas)

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

    # Install NPM packages
    npm install

    # Create a .env file in the /server directory
    # Add your MongoDB connection string to this file
    MONGO_URI=your_mongodb_connection_string
    ```

3.  **Set up the Frontend Client:**
    ```sh
    # Navigate to the client directory from the root folder
    cd client

    # Install NPM packages
    npm install
    ```

### Usage

To run the application, you will need to run the backend and frontend servers in two separate terminals.

1.  **Run the Backend Server:**
    * In a terminal pointed at the `/server` directory:
    ```sh
    npm run dev
    ```
    * Your API server should now be running on `http://localhost:5000`.

2.  **Run the Frontend Client:**
    * In a second terminal pointed at the `/client` directory:
    ```sh
    npm run dev
    ```
    * Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## Project Status

This project is currently **in development**. Core features like employee and shift management are functional. The next major milestone is the implementation of the scheduling algorithm.
