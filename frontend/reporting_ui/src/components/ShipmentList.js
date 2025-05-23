import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import ShipmentForm from './ShipmentForm';

const ShipmentList = () => {
    const [shipments, setShipments] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingShipment, setEditingShipment] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [shipmentsData, ordersData] = await Promise.all([
                api.getShipments(),
                api.getOrders()
            ]);
            setShipments(shipmentsData);
            setAllOrders(ordersData);
        } catch (err) {
            setError(err.message || 'Failed to fetch data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddShipmentClick = () => {
        setEditingShipment(null); // Clear any editing state
        setShowForm(true);
    };

    const handleEditShipmentClick = (shipment) => {
        setEditingShipment(shipment);
        setShowForm(true);
    };

    const handleDeleteShipment = async (shipmentId) => {
        if (window.confirm('Are you sure you want to delete this shipment?')) {
            setIsLoading(true);
            try {
                await api.deleteShipment(shipmentId);
                await fetchData(); // Re-fetch data
            } catch (err) {
                setError(err.message || 'Failed to delete shipment.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFormSubmit = async (shipmentData) => {
        setIsLoading(true);
        try {
            if (editingShipment && editingShipment.id) {
                await api.updateShipment(editingShipment.id, shipmentData);
            } else {
                await api.createShipment(shipmentData);
            }
            setShowForm(false);
            setEditingShipment(null);
            await fetchData(); // Re-fetch data
        } catch (err) {
            setError(err.message || 'Failed to save shipment.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingShipment(null);
    };
    
    const getOrderDetailsString = (orderId) => {
        const order = allOrders.find(o => o.id === orderId);
        return order ? `Order ID: ${order.id} (${new Date(order.OrderDate).toLocaleDateString()})` : `Order ID: ${orderId}`;
    };


    if (isLoading && !shipments.length && !allOrders.length) {
        return <p>Loading shipment and order data...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Shipment Management</h2>
            <button onClick={handleAddShipmentClick} disabled={showForm}>Add New Shipment</button>

            {showForm && (
                <ShipmentForm
                    onSubmit={handleFormSubmit}
                    initialData={editingShipment}
                    orders={allOrders}
                    onCancel={handleCancelForm}
                />
            )}

            {isLoading && <p>Updating...</p>}

            <h3>Shipments List</h3>
            {shipments.length === 0 && !isLoading ? (
                <p>No shipments available. Add one!</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Shipment ID</th>
                            <th>Order Info</th>
                            <th>Carrier</th>
                            <th>Tracking #</th>
                            <th>Shipment Date</th>
                            <th>Est. Delivery</th>
                            <th>Actual Delivery</th>
                            <th>Status</th>
                            <th>Lead Time (days)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map(shipment => (
                            <tr key={shipment.id}>
                                <td>{shipment.id}</td>
                                <td>
                                    <Link to={`/orders/${shipment.order}`}>
                                        {getOrderDetailsString(shipment.order)}
                                    </Link>
                                </td>
                                <td>{shipment.Carrier || 'N/A'}</td>
                                <td>{shipment.TrackingNumber || 'N/A'}</td>
                                <td>{shipment.ShipmentDate ? new Date(shipment.ShipmentDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{shipment.EstimatedDeliveryDate ? new Date(shipment.EstimatedDeliveryDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{shipment.ActualDeliveryDate ? new Date(shipment.ActualDeliveryDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{shipment.Status}</td>
                                <td>{shipment.calculated_lead_time !== null ? shipment.calculated_lead_time : 'N/A'}</td>
                                <td>
                                    <button onClick={() => handleEditShipmentClick(shipment)} disabled={showForm}>Edit</button>
                                    <button onClick={() => handleDeleteShipment(shipment.id)} disabled={showForm || isLoading}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ShipmentList;
