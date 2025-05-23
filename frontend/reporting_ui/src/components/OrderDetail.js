import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import ShipmentForm from './ShipmentForm'; // Import ShipmentForm

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [shipment, setShipment] = useState(null); // State for associated shipment
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [partsDetails, setPartsDetails] = useState({});
    const [showShipmentForm, setShowShipmentForm] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const orderData = await api.getOrder(orderId);
            setOrder(orderData);

            // Fetch part details
            const partIds = orderData.items.map(item => item.Part).filter(id => id);
            if (partIds.length > 0) {
                const fetchedParts = await Promise.all(
                    partIds.map(id => api.getPart(id).catch(e => ({ id, PartName: 'Unknown Part' })))
                );
                setPartsDetails(fetchedParts.reduce((acc, part) => ({ ...acc, [part.id]: part.PartName }), {}));
            }

            // Fetch all shipments and find the one for this order
            // In a real app with many shipments, you'd ideally have an API endpoint
            // to get shipment by order ID: /api/shipments/?order_id=<orderId>
            const allShipments = await api.getShipments();
            const associatedShipment = allShipments.find(s => s.order === parseInt(orderId));
            setShipment(associatedShipment || null);

        } catch (err) {
            setError(err.message || 'Failed to fetch order or shipment details.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteOrder = async () => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            setIsLoading(true);
            try {
                await api.deleteOrder(orderId);
                navigate('/orders');
            } catch (err) {
                setError(err.message || 'Failed to delete order.');
                console.error(err);
                setIsLoading(false);
            }
        }
    };

    if (isLoading) {
        return <p>Loading order details...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    if (!order) {
        return <p>Order not found.</p>;
    }

    return (
        <div>
            <h2>Order Details - ID: {order.id}</h2>
            <p><strong>Order Date:</strong> {new Date(order.OrderDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {order.Status}</p>
            <p><strong>Supplier:</strong> {order.Supplier || 'N/A'}</p>
            <p><strong>Expected Delivery Date:</strong> {order.ExpectedDeliveryDate ? new Date(order.ExpectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Total Amount:</strong> ${parseFloat(order.TotalAmount).toFixed(2)}</p>

            <h3>Order Items</h3>
            {order.items && order.items.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Part Name</th>
                            <th>Quantity</th>
                            <th>Price At Order</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td>{partsDetails[item.Part] || item.Part}</td>
                                <td>{item.Quantity}</td>
                                <td>${parseFloat(item.PriceAtOrder).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No items in this order.</p>
            )}

            <Link to={`/orders/${orderId}/edit`}>
                <button>Edit Order</button>
            </Link>
            <button onClick={handleDeleteOrder} disabled={isLoading}>Delete Order</button>
            <Link to="/orders">
                <button style={{ marginLeft: '10px' }}>Back to Orders List</button>
            </Link>

            <hr style={{ margin: '20px 0' }}/>

            <h3>Shipment Details</h3>
            {isLoading && <p>Loading shipment info...</p>}
            {!isLoading && shipment ? (
                <div>
                    <p><strong>Status:</strong> {shipment.Status}</p>
                    <p><strong>Tracking Number:</strong> {shipment.TrackingNumber || 'N/A'}</p>
                    <p><strong>Carrier:</strong> {shipment.Carrier || 'N/A'}</p>
                    <p><strong>Shipment Date:</strong> {shipment.ShipmentDate ? new Date(shipment.ShipmentDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Est. Delivery:</strong> {shipment.EstimatedDeliveryDate ? new Date(shipment.EstimatedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Actual Delivery:</strong> {shipment.ActualDeliveryDate ? new Date(shipment.ActualDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Lead Time:</strong> {shipment.calculated_lead_time !== null ? `${shipment.calculated_lead_time} days` : 'N/A'}</p>
                    <button onClick={() => { setShowShipmentForm(true); }}>Edit Shipment</button>
                </div>
            ) : (
                !isLoading && <button onClick={() => { setShowShipmentForm(true); }}>Create Shipment for this Order</button>
            )}
            
            {showShipmentForm && (
                <ShipmentForm
                    onSubmit={handleShipmentFormSubmit}
                    initialData={shipment || { order: parseInt(orderId) }} // Pass existing shipment or pre-fill order ID
                    orders={[order]} // Pass current order as the only option
                    onCancel={() => setShowShipmentForm(false)}
                />
            )}
        </div>
    );

    async function handleShipmentFormSubmit(shipmentData) {
        setIsLoading(true); // Start loading
        setError(null);
        try {
            if (shipment && shipment.id) { // Editing existing shipment
                await api.updateShipment(shipment.id, shipmentData);
            } else { // Creating new shipment
                await api.createShipment({ ...shipmentData, order: parseInt(orderId) });
            }
            setShowShipmentForm(false); // Close form
            await fetchData(); // Re-fetch order and shipment data to show updates
        } catch (err) {
            setError(err.message || 'Failed to save shipment.');
            console.error(err);
        } finally {
            setIsLoading(false); // Stop loading
        }
    }
};

export default OrderDetail;
