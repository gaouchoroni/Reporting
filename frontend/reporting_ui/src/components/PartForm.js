import React, { useState, useEffect } from 'react';

const PartForm = ({ onSubmit, initialData, onCancel }) => {
    const [partData, setPartData] = useState({
        PartName: '',
        Description: '',
        StockLevel: 0,
        ReorderPoint: 0,
        Supplier: '',
        UnitPrice: 0.0,
    });

    useEffect(() => {
        if (initialData) {
            setPartData(initialData);
        } else {
            // Reset form if no initial data (e.g., for new part)
            setPartData({
                PartName: '',
                Description: '',
                StockLevel: 0,
                ReorderPoint: 0,
                Supplier: '',
                UnitPrice: 0.0,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPartData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(partData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Part Name:</label>
                <input type="text" name="PartName" value={partData.PartName} onChange={handleChange} required />
            </div>
            <div>
                <label>Description:</label>
                <textarea name="Description" value={partData.Description} onChange={handleChange}></textarea>
            </div>
            <div>
                <label>Stock Level:</label>
                <input type="number" name="StockLevel" value={partData.StockLevel} onChange={handleChange} required />
            </div>
            <div>
                <label>Reorder Point:</label>
                <input type="number" name="ReorderPoint" value={partData.ReorderPoint} onChange={handleChange} />
            </div>
            <div>
                <label>Supplier:</label>
                <input type="text" name="Supplier" value={partData.Supplier} onChange={handleChange} />
            </div>
            <div>
                <label>Unit Price:</label>
                <input type="number" step="0.01" name="UnitPrice" value={partData.UnitPrice} onChange={handleChange} required />
            </div>
            <button type="submit">{initialData ? 'Update Part' : 'Add Part'}</button>
            {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        </form>
    );
};

export default PartForm;
