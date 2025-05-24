# Spare Parts Reporting System

This project is a spare parts reporting system with a Django backend and a React frontend, designed to help manage inventory, orders, and shipments efficiently.

## User Features

*   **Authentication:**
    *   Users can log in with their username and password via a dedicated login page.
    *   Upon successful login, users receive a token that grants them access to protected API endpoints.
    *   A "Logout" button is available to clear the session and token.
*   **Dashboard:**
    *   Provides an at-a-glance overview of key metrics.
    *   Displays the "Total Current Stock Value" across all parts.
    *   Shows a list of recent "KPI Snapshots" (e.g., Stock Turnover, Average Stock Value).
    *   Includes a sample bar chart visualizing "Stock Turnover" KPIs.
*   **Part Management:**
    *   CRUD (Create, Read, Update, Delete) operations for spare parts.
    *   View part details including description, stock level, reorder point, supplier, and unit price.
*   **Order Management:**
    *   CRUD operations for orders.
    *   View order details, including items in each order.
    *   Filter orders by `Status` (e.g., Pending, Shipped, Delivered).
    *   Filter orders by `OrderDate` range (e.g., orders placed in the last week).
*   **Shipment Management:**
    *   CRUD operations for shipments associated with orders.
    *   Track shipment status, carrier, tracking number, and delivery dates.
    *   View calculated lead time for delivered shipments.
*   **Stock KPI Tracking:**
    *   Log and view various stock Key Performance Indicators (KPIs) like Stock Turnover, Average Stock Value, etc.

## Technical Overview

*   **Backend:** Django, Django REST Framework
    *   Token-based authentication (`dj-rest-auth`).
    *   Filtering (`django-filter`).
*   **Frontend:** React
    *   Component-based UI.
    *   Routing (`react-router-dom`).
    *   Charting (`chart.js`, `react-chartjs-2`).
    *   Notifications (`react-toastify`).

## Setup and Running

### Backend (Django)

1.  **Navigate to the backend project directory:**
    ```bash
    cd backend/reporting_api
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv env
    source env/bin/activate  # On macOS/Linux
    # env\Scripts\activate  # On Windows
    ```

3.  **Install dependencies:**
    The `requirements.txt` file includes Django, Django REST Framework, `dj-rest-auth` (for authentication), `django-filter` (for API filtering), `psycopg2-binary` (for PostgreSQL, though SQLite is used by default for simplicity), and `coreapi` (for API documentation).
    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply database migrations:**
    This will set up the necessary database tables for all apps, including the authentication system and API models.
    ```bash
    python manage.py migrate
    ```

5.  **Create a superuser (admin account):**
    This account is necessary to log into the Django admin interface and can also be used to log into the web application for initial testing.
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts to set a username, email (optional), and password.

6.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be running at `http://127.0.0.1:8000/`.
    You can access the Django Admin interface at `http://127.0.0.1:8000/admin/`.
    The auto-generated API documentation (once enabled) will be available at `http://127.0.0.1:8000/api/docs/`.

### Frontend (React)

1.  **Navigate to the frontend project directory:**
    ```bash
    cd frontend/reporting_ui
    ```

2.  **Install dependencies:**
    This will install React, `react-router-dom`, `chart.js`, `react-chartjs-2`, `react-toastify`, and other necessary packages.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```
    The frontend application will be running at `http://localhost:3000/`. It will automatically open in your default web browser.

## Accessing the Application

1.  Ensure both the backend and frontend servers are running.
2.  Open your web browser and navigate to `http://localhost:3000/`.
3.  You should be redirected to the login page. Use the superuser credentials created during the backend setup (or any other user created via Django admin) to log in.
4.  After logging in, you will be taken to the Dashboard.

This setup provides a comprehensive environment for managing spare parts data, tracking orders and shipments, and monitoring key performance indicators.
