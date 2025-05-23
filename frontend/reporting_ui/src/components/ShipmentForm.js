import React, { useState, useEffect } from 'react';

const ShipmentForm = ({ onSubmit, initialData, orders, onCancel }) => {
    const [shipmentData, setShipmentData] = useState({
        order: '', // Will store Order ID
        ShipmentDate: '',
        EstimatedDeliveryDate: '',
        ActualDeliveryDate: '',
        TrackingNumber: '',
        Carrier: '',
        Status: 'Preparing', // Default status
    });

    useEffect(() => {
        if (initialData) {
            setShipmentData({
                order: initialData.order || '', // Assuming initialData.order is the ID
                ShipmentDate: initialData.ShipmentDate || '',
                EstimatedDeliveryDate: initialData.EstimatedDeliveryDate || '',
                ActualDeliveryDate: initialData.ActualDeliveryDate || '',
                TrackingNumber: initialData.TrackingNumber || '',
                Carrier: initialData.Carrier || '',
                Status: initialData.Status || 'Preparing',
            });
        } else {
            // Reset for new shipment, potentially pre-select order if provided
             setShipmentData(prev => ({
                ...prev, // Keep pre-selected order if any
                ShipmentDate: '',
                EstimatedDeliveryDate: '',
                ActualDeliveryDate: '',
                TrackingNumber: '',
                Carrier: '',
                Status: 'Preparing',
            }));
        }
    }, [initialData]);
    
    // Effect to handle pre-selecting order if initialData provides an order ID for a new form
    useEffect(() => {
        if (!initialData?.id && initialData?.order) { // New form with pre-selected order
            setShipmentData(prev => ({ ...prev, order: initialData.order }));
        }
    }, [initialData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setShipmentData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!shipmentData.order) {
            alert('Please select an order.'); // Basic validation
            return;
        }
        onSubmit(shipmentData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Order:</label>
                <select
                    name="order"
                    value={shipmentData.order}
                    onChange={handleChange}
                    required
                    disabled={initialData && initialData.id} // Disable if editing existing shipment
                >
                    <option value="">Select an Order</option>
                    {orders && orders.map(order => (
                        <option key={order.id} value={order.id}>
                            Order ID: {order.id} (Date: {new Date(order.OrderDate).toLocaleDateString()}, Supplier: {order.Supplier || 'N/A'})
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Shipment Date:</label>
                <input type="date" name="ShipmentDate" value={shipmentData.ShipmentDate} onChange={handleChange} />
            </div>
            <div>
                <label>Estimated Delivery Date:</label>
                <input type="date" name="EstimatedDeliveryDate" value={shipmentData.EstimatedDeliveryDate} onChange={handleChange} />
            </div>
            <div>
                <label>Actual Delivery Date:</label>
                <input type="date" name="ActualDeliveryDate" value={shipmentData.ActualDeliveryDate} onChange={handleChange} />
            </div>
            <div>
                <label>Tracking Number:</label>
                <input type="text" name="TrackingNumber" value={shipmentData.TrackingNumber} onChange={handleChange} />
            </div>
            <div>
                <label>Carrier:</label>
                <input type="text" name="Carrier" value={shipmentData.Carrier} onChange={handleChange} />
            </div>
            <div>
                <label>Status:</label>
                <select name="Status" value={shipmentData.Status} onChange={handleChange}>
                    <option value="Preparing">Preparing</option>
                    <option value="InTransit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Delayed">Delayed</option>
                </select>
            </div>
            <button type="submit">{initialData && initialData.id ? 'Update Shipment' : 'Create Shipment'}</button>
            {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        </form>
    );
};

export default ShipmentForm;
