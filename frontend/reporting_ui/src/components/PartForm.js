import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // For validation feedback

const PartForm = ({ onSubmit, initialData, onCancel }) => {
    const [partData, setPartData] = useState({
        PartName: '',
        Description: '',
        StockLevel: 0,
        ReorderPoint: 0,
        Supplier: '',
        UnitPrice: '', // Initialize as string to allow empty input initially
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setPartData({
                ...initialData,
                UnitPrice: initialData.UnitPrice !== undefined ? String(initialData.UnitPrice) : '',
                StockLevel: initialData.StockLevel !== undefined ? String(initialData.StockLevel) : '0',
                ReorderPoint: initialData.ReorderPoint !== undefined ? String(initialData.ReorderPoint) : '0',
            });
        } else {
            // Reset form if no initial data (e.g., for new part)
            setPartData({ // Reset form for new part
                PartName: '',
                Description: '',
                StockLevel: '0',
                ReorderPoint: '0',
                Supplier: '',
                UnitPrice: '',
            });
        }
        setErrors({}); // Clear errors when initialData changes or form is reset
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPartData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        // Clear error for the field being changed
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!partData.PartName.trim()) newErrors.PartName = "Part Name is required.";
        
        const unitPrice = parseFloat(partData.UnitPrice);
        if (partData.UnitPrice === '' || isNaN(unitPrice) || unitPrice <= 0) {
            newErrors.UnitPrice = "Unit Price must be a positive number.";
        }

        const stockLevel = parseInt(partData.StockLevel, 10);
        if (partData.StockLevel === '' || isNaN(stockLevel) || stockLevel < 0) {
            newErrors.StockLevel = "Stock Level cannot be negative and must be a number.";
        }

        const reorderPoint = parseInt(partData.ReorderPoint, 10);
        if (partData.ReorderPoint !== '' && (isNaN(reorderPoint) || reorderPoint < 0)) {
            newErrors.ReorderPoint = "Reorder Point must be a non-negative number if specified.";
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please correct the form errors.");
            return;
        }
        // Convert numeric fields back to numbers before submitting if necessary
        const dataToSubmit = {
            ...partData,
            UnitPrice: parseFloat(partData.UnitPrice),
            StockLevel: parseInt(partData.StockLevel, 10),
            ReorderPoint: partData.ReorderPoint === '' ? null : parseInt(partData.ReorderPoint, 10), // Handle optional ReorderPoint
        };
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit} className="part-form">
            <div>
                <label htmlFor="PartName">Part Name:</label>
                <input type="text" id="PartName" name="PartName" value={partData.PartName} onChange={handleChange} />
                {errors.PartName && <p className="form-error">{errors.PartName}</p>}
            </div>
            <div>
                <label htmlFor="Description">Description:</label>
                <textarea id="Description" name="Description" value={partData.Description} onChange={handleChange}></textarea>
            </div>
            <div>
                <label htmlFor="StockLevel">Stock Level:</label>
                <input type="number" id="StockLevel" name="StockLevel" value={partData.StockLevel} onChange={handleChange} />
                {errors.StockLevel && <p className="form-error">{errors.StockLevel}</p>}
            </div>
            <div>
                <label htmlFor="ReorderPoint">Reorder Point:</label>
                <input type="number" id="ReorderPoint" name="ReorderPoint" value={partData.ReorderPoint} onChange={handleChange} />
                {errors.ReorderPoint && <p className="form-error">{errors.ReorderPoint}</p>}
            </div>
            <div>
                <label htmlFor="Supplier">Supplier:</label>
                <input type="text" id="Supplier" name="Supplier" value={partData.Supplier} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="UnitPrice">Unit Price:</label>
                <input type="number" id="UnitPrice" step="0.01" name="UnitPrice" value={partData.UnitPrice} onChange={handleChange} />
                {errors.UnitPrice && <p className="form-error">{errors.UnitPrice}</p>}
            </div>
            <div className="form-actions">
                <button type="submit">{initialData ? 'Update Part' : 'Add Part'}</button>
                {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
            </div>
        </form>
    );
};

export default PartForm;
