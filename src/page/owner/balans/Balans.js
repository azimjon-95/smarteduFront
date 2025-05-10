import React, { useState, useEffect } from 'react';
import './style.css';
import PortfolioPerformance from './Performance';
import TechnicalSupport from './Support';
import TimelineExample from './TimelineExample';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import axios from 'axios';
import moment from 'moment';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Function to generate dynamic mock data
const generateMockData = () => {
    const currentMonth = moment().format('MMMM');
    const daysInMonth = moment().daysInMonth();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generate random income (1000–5000, some days 0)
    const income = labels.map(() =>
        Math.random() > 0.3 ? Math.floor(Math.random() * 4000) + 1000 : 0
    );

    // Generate random expenses (500–3000, some days 0)
    const expenses = labels.map(() =>
        Math.random() > 0.4 ? Math.floor(Math.random() * 2500) + 500 : 0
    );

    return {
        labels,
        income,
        expenses,
        month: currentMonth,
    };
};

function Balans() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/balans/monthly_analysis', {
                    timeout: 5000, // 5-second timeout
                });
                setChartData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Fallback to mock data on error
                setChartData(generateMockData());
            }
        };
        fetchData();
    }, []);

    const data = chartData
        ? {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Daromad',
                    data: chartData.income,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.4,
                },
                {
                    label: 'Xarajatlar',
                    data: chartData.expenses,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.4,
                },
            ],
        }
        : {};

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: chartData
                    ? `Daromad va Xarajatlar - ${chartData.month} ${chartData.isMock ? '(Soxta Malumotlar) ' : ''}`
                    : 'Yuklanmoqda...',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amount',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Day of Month',
                },
            },
        },
    };

    return (
        <div className="dashboard">
            <PortfolioPerformance />
            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                {chartData ? (
                    <Line data={data} options={{ ...options, maintainAspectRatio: false }} />
                ) : (
                    <p className="text-center">Loading line chart...</p>
                )}
            </div>

            <div className="content_balans">
                <TechnicalSupport />
                <TimelineExample />
            </div>
        </div>
    );
}

export default Balans;