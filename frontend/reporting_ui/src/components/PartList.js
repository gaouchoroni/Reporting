import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import PartForm from './PartForm';

const PartList = () => {
    const [parts, setParts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPart, setEditingPart] = useState(null);

    const fetchParts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getParts();
            setParts(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch parts.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParts();
    }, [fetchParts]);

    const handleAddPartClick = () => {
        setEditingPart(null);
        setShowForm(true);
    };

    const handleEditPartClick = (part) => {
        setEditingPart(part);
        setShowForm(true);
    };

    const handleDeletePart = async (partId) => {
        setIsLoading(true); // Optional: show loading state for delete
        try {
            await api.deletePart(partId);
            await fetchParts(); // Re-fetch parts after deletion
        } catch (err) {
            setError(err.message || 'Failed to delete part.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (partData) => {
        setIsLoading(true);
        try {
            if (editingPart) {
                await api.updatePart(editingPart.id, partData);
            } else {
                await api.createPart(partData);
            }
            setShowForm(false);
            setEditingPart(null);
            await fetchParts(); // Re-fetch parts after add/update
        } catch (err) {
            setError(err.message || 'Failed to save part.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingPart(null);
    };

    if (isLoading && !parts.length) { // Show initial loading prominently
        return <p>Loading parts...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Spare Parts Management</h2>
            <button onClick={handleAddPartClick} disabled={showForm}>Add New Part</button>

            {showForm && (
                <PartForm
                    onSubmit={handleFormSubmit}
                    initialData={editingPart}
                    onCancel={handleCancelForm}
                />
            )}

            {isLoading && <p>Updating...</p>} 

            <h3>Parts List</h3>
            {parts.length === 0 && !isLoading ? (
                <p>No parts available. Add one!</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Stock Level</th>
                            <th>Reorder Point</th>
                            <th>Supplier</th>
                            <th>Unit Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts.map(part => (
                            <tr key={part.id}>
                                <td>{part.PartName}</td>
                                <td>{part.Description}</td>
                                <td>{part.StockLevel}</td>
                                <td>{part.ReorderPoint}</td>
                                <td>{part.Supplier}</td>
                                <td>${parseFloat(part.UnitPrice).toFixed(2)}</td>
                                <td>
                                    <button onClick={() => handleEditPartClick(part)} disabled={showForm}>Edit</button>
                                    <button onClick={() => handleDeletePart(part.id)} disabled={showForm}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PartList;
