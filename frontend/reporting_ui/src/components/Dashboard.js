import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [totalStockValue, setTotalStockValue] = useState(null);
    const [stockKPIsList, setStockKPIsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [valueData, kpisData] = await Promise.all([
                api.getTotalStockValue(),
                api.getStockKPIs()
            ]);
            setTotalStockValue(valueData.total_stock_value);
            setStockKPIsList(kpisData);
        } catch (err) {
            setError(err.message || 'Failed to fetch dashboard data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Prepare data for a sample chart (e.g., Stock Turnover KPIs)
    const stockTurnoverKPIs = stockKPIsList.filter(kpi => kpi.Name === 'StockTurnover');
    const chartData = {
        labels: stockTurnoverKPIs.map(kpi => kpi.PartName || `KPI ID ${kpi.id}`), // Use PartName or ID if PartName is null
        datasets: [
            {
                label: 'Stock Turnover Rate',
                data: stockTurnoverKPIs.map(kpi => kpi.Value),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Stock Turnover KPIs',
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };


    if (isLoading) {
        return <p>Loading dashboard data...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>

            <div className="kpi-card total-stock-value">
                <h3>Total Current Stock Value</h3>
                {totalStockValue !== null ? (
                    <p>${parseFloat(totalStockValue).toFixed(2)}</p>
                ) : (
                    <p>Loading value...</p>
                )}
            </div>

            <div className="kpi-section">
                <h3>Stored KPI Snapshots</h3>
                {stockKPIsList.length > 0 ? (
                    <ul className="kpi-list">
                        {stockKPIsList.map(kpi => (
                            <li key={kpi.id} className="kpi-item">
                                <strong>{kpi.Name}</strong>: {parseFloat(kpi.Value).toFixed(2)}
                                <em> (Recorded: {new Date(kpi.DateRecorded).toLocaleDateString()})</em>
                                {kpi.PartName && <span> - Part: {kpi.PartName}</span>}
                                {kpi.Notes && <p className="kpi-notes">Notes: {kpi.Notes}</p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No KPI snapshots available.</p>
                )}
            </div>
            
            {stockTurnoverKPIs.length > 0 && (
                 <div className="kpi-chart-container">
                    <h3>KPI Chart: Stock Turnover</h3>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
