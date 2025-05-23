const API_BASE_URL = 'http://localhost:8000/api';

// --- Part Endpoints ---
export const getParts = async () => {
    const response = await fetch(`${API_BASE_URL}/parts/`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

// --- Shipment Endpoints ---
export const getShipments = async () => {
    const response = await fetch(`${API_BASE_URL}/shipments/`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const createShipment = async (shipmentData) => {
    const response = await fetch(`${API_BASE_URL}/shipments/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to create shipment. Unknown error.' }));
        throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const updateShipment = async (shipmentId, shipmentData) => {
    const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to update shipment. Unknown error.' }));
        throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const deleteShipment = async (shipmentId) => {
    const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return await response.json();
};

export const createPart = async (partData) => {
    const response = await fetch(`${API_BASE_URL}/parts/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(partData),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const updatePart = async (partId, partData) => {
    const response = await fetch(`${API_BASE_URL}/parts/${partId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(partData),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const deletePart = async (partId) => {
    const response = await fetch(`${API_BASE_URL}/parts/${partId}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return await response.json();
};

// --- Stock KPI Endpoints ---
export const getStockKPIs = async () => {
    const response = await fetch(`${API_BASE_URL}/stock-kpis/`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const createStockKPI = async (kpiData) => {
    const response = await fetch(`${API_BASE_URL}/stock-kpis/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(kpiData),
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to create Stock KPI. Unknown error.' }));
        throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const getTotalStockValue = async () => {
    const response = await fetch(`${API_BASE_URL}/parts/total_stock_value/`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};


// --- Order Endpoints ---
export const getOrders = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_BASE_URL}/orders/?${queryParams}` : `${API_BASE_URL}/orders/`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const getOrder = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const createOrder = async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        // Attempt to parse error response from backend
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to create order. Unknown error.' }));
        throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const updateOrder = async (orderId, orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ detail: 'Failed to update order. Unknown error.' }));
        throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const deleteOrder = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return await response.json();
};
