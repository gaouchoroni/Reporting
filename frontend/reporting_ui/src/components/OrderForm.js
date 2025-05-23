import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../services/api';

const OrderForm = () => {
    const navigate = useNavigate();
    const { orderId } = useParams(); // For editing
    const isEditing = Boolean(orderId);

    const [orderData, setOrderData] = useState({
        Supplier: '',
        ExpectedDeliveryDate: '',
        Status: 'Pending', // Default status
    });
    const [items, setItems] = useState([{ Part: '', Quantity: 1, PriceAtOrder: 0 }]);
    const [availableParts, setAvailableParts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch available parts
    useEffect(() => {
        const fetchParts = async () => {
            try {
                const parts = await api.getParts();
                setAvailableParts(parts);
            } catch (err) {
                setError('Failed to fetch parts. Please try again.');
                console.error(err);
            }
        };
        fetchParts();
    }, []);

    // Fetch order data if editing
    useEffect(() => {
        if (isEditing && availableParts.length > 0) { // Ensure parts are loaded before trying to map items
            setIsLoading(true);
            api.getOrder(orderId)
                .then(data => {
                    setOrderData({
                        Supplier: data.Supplier || '',
                        ExpectedDeliveryDate: data.ExpectedDeliveryDate || '',
                        Status: data.Status || 'Pending',
                    });
                    // Ensure items have valid Part IDs and are correctly structured
                    const fetchedItems = data.items.map(item => {
                        const part = availableParts.find(p => p.id === item.Part);
                        return {
                            Part: item.Part, // Keep Part ID
                            Quantity: item.Quantity,
                            PriceAtOrder: item.PriceAtOrder || (part ? part.UnitPrice : 0),
                        };
                    });
                    setItems(fetchedItems);
                })
                .catch(err => {
                    setError('Failed to fetch order details for editing.');
                    console.error(err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [orderId, isEditing, availableParts]);

    const handleOrderDataChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [name]: value };

        if (name === 'Part') {
            const selectedPart = availableParts.find(p => p.id === parseInt(value));
            updatedItems[index].PriceAtOrder = selectedPart ? selectedPart.UnitPrice : 0;
        }
        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([...items, { Part: '', Quantity: 1, PriceAtOrder: 0 }]);
    };

    const removeItem = (index) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };

    const calculateTotalAmount = useCallback(() => {
        return items.reduce((total, item) => total + (item.Quantity * item.PriceAtOrder), 0);
    }, [items]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const orderPayload = {
            ...orderData,
            items: items.map(item => ({
                Part: parseInt(item.Part), // Ensure Part is an ID
                Quantity: parseInt(item.Quantity),
                PriceAtOrder: parseFloat(item.PriceAtOrder),
            })),
            TotalAmount: calculateTotalAmount(),
        };

        try {
            if (isEditing) {
                await api.updateOrder(orderId, orderPayload);
            } else {
                await api.createOrder(orderPayload);
            }
            navigate('/orders');
        } catch (err) {
            setError(err.message || 'Failed to save order.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading && isEditing && !orderData.Supplier) { // Specific loading for fetching data for edit
        return <p>Loading order data for editing...</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>{isEditing ? 'Edit Order' : 'Create New Order'}</h2>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <div>
                <label>Supplier:</label>
                <input type="text" name="Supplier" value={orderData.Supplier} onChange={handleOrderDataChange} />
            </div>
            <div>
                <label>Expected Delivery Date:</label>
                <input type="date" name="ExpectedDeliveryDate" value={orderData.ExpectedDeliveryDate} onChange={handleOrderDataChange} />
            </div>
            <div>
                <label>Status:</label>
                <select name="Status" value={orderData.Status} onChange={handleOrderDataChange}>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <h3>Order Items</h3>
            {items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                    <div>
                        <label>Part:</label>
                        <select name="Part" value={item.Part} onChange={(e) => handleItemChange(index, e)} required>
                            <option value="">Select Part</option>
                            {availableParts.map(part => (
                                <option key={part.id} value={part.id}>{part.PartName} (Stock: {part.StockLevel})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Quantity:</label>
                        <input type="number" name="Quantity" value={item.Quantity} onChange={(e) => handleItemChange(index, e)} min="1" required />
                    </div>
                    <div>
                        <label>Price At Order:</label>
                        <input type="number" step="0.01" name="PriceAtOrder" value={item.PriceAtOrder} readOnly />
                    </div>
                    <button type="button" onClick={() => removeItem(index)}>Remove Item</button>
                </div>
            ))}
            <button type="button" onClick={addItem}>Add Item</button>

            <h4>Total Order Amount: ${calculateTotalAmount().toFixed(2)}</h4>

            <button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Order' : 'Create Order')}
            </button>
            <button type="button" onClick={() => navigate(isEditing ? `/orders/${orderId}` : '/orders')} disabled={isLoading}>
                Cancel
            </button>
        </form>
    );
};

export default OrderForm;
