# Spare Parts Reporting System

This project is a spare parts reporting system with a Django backend and a React frontend.

## Setup and Running

### Backend (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend/reporting_api
    ```

2.  **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv env
    source env/bin/activate  # On Windows use `env\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply migrations:**
    ```bash
    python manage.py migrate
    ```

5.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend will be running at `http://127.0.0.1:8000/`.

### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend/reporting_ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```
    The frontend will be running at `http://localhost:3000/`.
    Make sure you have Node.js and npm installed. You can download them from [https://nodejs.org/](https://nodejs.org/).
