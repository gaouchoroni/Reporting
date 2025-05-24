import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get headers, including Authorization token if available
const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('authToken');
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    return headers;
};

// --- Auth Endpoints ---
export const loginUser = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { // Login doesn't require existing token
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ non_field_errors: ['Login failed. Please check credentials.'] }));
        throw new Error(errorBody.non_field_errors || errorBody.detail || 'Login failed.');
    }
    const data = await response.json();
    if (data.key) {
        localStorage.setItem('authToken', data.key);
        toast.success('Login successful!');
        return data; // Return user data and key
    }
    toast.error('Login successful, but no token received.');
    throw new Error('Login successful, but no token received.');
};

export const logoutUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // No token, so effectively logged out client-side
        return Promise.resolve(); 
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
            method: 'POST',
            headers: getAuthHeaders(), // Logout requires token
        });
        // dj-rest-auth logout returns 200 OK on success, or 401 if token is invalid
        if (!response.ok && response.status !== 401) { // Allow 401 as it means token is bad anyway
            const errorBody = await response.json().catch(() => ({ detail: 'Logout failed on server.' }));
            throw new Error(errorBody.detail || 'Logout failed on server.');
        }
    } catch (error) {
        console.error("Logout API call failed, proceeding with client-side logout:", error);
        // Still remove token client-side even if server call fails, to ensure user is logged out locally.
    } finally {
        localStorage.removeItem('authToken');
    }
};


// --- Part Endpoints ---
export const getParts = async () => {
    const response = await fetch(`${API_BASE_URL}/parts/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    // Do not toast success for every GET request, it can be noisy.
    // Components can toast success if needed for specific GETs.
    return await response.json();
};

// --- Shipment Endpoints ---
export const getShipments = async () => {
    const response = await fetch(`${API_BASE_URL}/shipments/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    return await response.json();
};

export const createShipment = async (shipmentData) => {
    const response = await fetch(`${API_BASE_URL}/shipments/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(shipmentData),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to create shipment. Unknown error.' }));
        const errorMsg = errorBody.detail || `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    toast.success('Shipment created successfully!');
    return await response.json();
};

export const updateShipment = async (shipmentId, shipmentData) => {
    const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(shipmentData),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to update shipment. Unknown error.' }));
        const errorMsg = errorBody.detail || `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    toast.success('Shipment updated successfully!');
    return await response.json();
};

export const deleteShipment = async (shipmentId) => {
    const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (response.status === 204) {
        toast.success('Shipment deleted successfully!');
        return null;
    }
    toast.success('Shipment deleted successfully!'); // Or handle cases where it might return content
    return await response.json();
};

export const createPart = async (partData) => {
    const response = await fetch(`${API_BASE_URL}/parts/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(partData),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    toast.success('Part created successfully!');
    return await response.json();
};

export const updatePart = async (partId, partData) => {
    const response = await fetch(`${API_BASE_URL}/parts/${partId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(partData),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    toast.success('Part updated successfully!');
    return await response.json();
};

export const deletePart = async (partId) => {
    const response = await fetch(`${API_BASE_URL}/parts/${partId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (response.status === 204) {
        toast.success('Part deleted successfully!');
        return null;
    }
    toast.success('Part deleted successfully!');
    return await response.json();
};

// --- Stock KPI Endpoints ---
export const getStockKPIs = async () => {
    const response = await fetch(`${API_BASE_URL}/stock-kpis/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    return await response.json();
};

export const createStockKPI = async (kpiData) => {
    const response = await fetch(`${API_BASE_URL}/stock-kpis/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(kpiData),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to create Stock KPI. Unknown error.' }));
        const errorMsg = errorBody.detail || `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    toast.success('Stock KPI created successfully!');
    return await response.json();
};

export const getTotalStockValue = async () => {
    const response = await fetch(`${API_BASE_URL}/parts/total_stock_value/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    return await response.json();
};


// --- Order Endpoints ---
export const getOrders = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_BASE_URL}/orders/?${queryParams}` : `${API_BASE_URL}/orders/`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Please log in.');
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const getOrder = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Please log in.');
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const createOrder = async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Please log in.');
        // Attempt to parse error response from backend
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to create order. Unknown error.' }));
        const errorMsg = errorBody.detail || `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    toast.success('Order created successfully!');
    return await response.json();
};

export const updateOrder = async (orderId, orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to update order. Unknown error.' }));
        const errorMsg = errorBody.detail || `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    toast.success('Order updated successfully!');
    return await response.json();
};

export const deleteOrder = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        if (response.status === 401) {
            toast.error('Unauthorized: Please log in.');
            throw new Error('Unauthorized: Please log in.');
        }
        const errorMsg = `HTTP error! status: ${response.status}`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (response.status === 204) {
        toast.success('Order deleted successfully!');
        return null;
    }
    toast.success('Order deleted successfully!');
    return await response.json();
};
