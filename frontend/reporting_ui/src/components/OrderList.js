import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        Status: '',
        OrderDate_after: '', // Changed from OrderDate__gte
        OrderDate_before: '', // Changed from OrderDate__lte
    });

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        // Construct a clean filters object to pass to the API
        const activeFilters = Object.entries(filters)
            .filter(([key, value]) => value !== '')
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        try {
            const data = await api.getOrders(activeFilters);
            setOrders(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch orders.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filters]); // Re-fetch when filters change

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleApplyFilters = () => {
        fetchOrders(); // Manually trigger fetch if needed, or rely on useEffect on filters change
    };

    if (isLoading) {
        return <p>Loading orders...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Order Management</h2>
            <Link to="/orders/new">
                <button style={{ marginBottom: '10px' }}>Add New Order</button>
            </Link>

            <div className="order-filters" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h4>Filter Orders</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <label htmlFor="Status" style={{ marginRight: '5px' }}>Status:</label>
                        <select name="Status" id="Status" value={filters.Status} onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="OrderDate_after" style={{ marginRight: '5px' }}>From Date:</label>
                        <input type="date" name="OrderDate_after" id="OrderDate_after" value={filters.OrderDate_after} onChange={handleFilterChange} />
                    </div>
                    <div>
                        <label htmlFor="OrderDate_before" style={{ marginRight: '5px' }}>To Date:</label>
                        <input type="date" name="OrderDate_before" id="OrderDate_before" value={filters.OrderDate_before} onChange={handleFilterChange} />
                    </div>
                    <button onClick={handleApplyFilters}>Apply Filters</button>
                </div>
            </div>

            <h3>Orders List</h3>
            {isLoading && <p>Loading orders...</p>}
            {!isLoading && error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {!isLoading && !error && orders.length === 0 ? (
                <p>No orders found matching your criteria.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Status</th>
                            <th>Supplier</th>
                            <th>Total Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                                <td>{order.Status}</td>
                                <td>{order.Supplier}</td>
                                <td>${parseFloat(order.TotalAmount).toFixed(2)}</td>
                                <td>
                                    <Link to={`/orders/${order.id}`}>
                                        <button>View Details</button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderList;
