import React, { useState, useEffect } from 'react';
import './style.css';
import PortfolioPerformance from './Performance';
import TechnicalSupport from './Support';
import TimelineExample from './TimelineExample';
import { useGetGenerateChartDataQuery } from '../../../context/payStudentsApi';
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
import moment from 'moment';

// Set moment locale to Russian for month names
moment.locale('ru');

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

function Balans() {
    const { data: chartData, isLoading, error } = useGetGenerateChartDataQuery();
    // Chart data configuration
    const data = chartData?.data
        ? {
            labels: chartData.data.labels,
            datasets: [
                {
                    label: 'Daromad',
                    data: chartData.data.income,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.4,
                },
                {
                    label: 'Xarajatlar',
                    data: chartData.data.expenses,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.4,
                },
            ],
        }
        : {};

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: chartData?.data?.month
                    ? `Daromad va Xarajatlar - ${chartData.data.month}`
                    : isLoading
                        ? 'Yuklanmoqda...'
                        : 'Ma\'lumotlar topilmadi',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Miqdor',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Oyning kuni',
                },
            },
        },
    };

    return (
        <div className="dashboard">
            <PortfolioPerformance />
            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                {isLoading ? (
                    <p className="text-center">Yuklanmoqda...</p>
                ) : error ? (
                    <p className="text-center text-danger">
                        Xatolik yuz berdi: {error?.data?.message || error.message || 'Ma\'lumotlarni yuklab bo\'lmadi'}
                    </p>
                ) : chartData?.data ? (
                    <Line data={data} options={{ ...options, maintainAspectRatio: false }} />
                ) : (
                    <p className="text-center">Ma\'lumotlar mavjud emas</p>
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