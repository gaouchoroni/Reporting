import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // User not authenticated, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the child routes
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
