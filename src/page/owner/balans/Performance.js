import React, { useState, useMemo, useCallback } from 'react';
import './style.css';
import { FaMoneyBillWave, FaUserGraduate, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { GiTakeMyMoney } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';
import { useGetStudentQuery } from '../../../context/studentsApi';
import { useGetBalansQuery } from '../../../context/balansApi.js';
import { useGetPaymentsQuery } from '../../../context/payStudentsApi.js';
import { Tooltip } from 'antd';
import moment from 'moment';

function PortfolioPerformance() {
    const months = useMemo(
        () => [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
        ],
        []
    );

    const [selectedDate, setSelectedDate] = useState(moment());
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'

    const { data: payments = [] } = useGetPaymentsQuery();
    const { data: students = [] } = useGetStudentQuery();
    const { data: balans = [] } = useGetBalansQuery();


    // Memoized derived data for students and balance
    const activeStudents = useMemo(
        () => students.filter((s) => s.state === 'active'),
        [students]
    );
    const totalIndebtedness = useMemo(
        () => activeStudents.reduce((acc, student) => acc + (student.indebtedness?.debtorPay || 0), 0),
        [activeStudents]
    );
    const totalBalance = useMemo(
        () => balans.reduce((acc, item) => acc + (item.balans || 0), 0),
        [balans]
    );

    // Memoized payment calculations
    const paymentTotals = useMemo(() => {
        const dailyTotals = {};
        const monthlyTotals = {};

        payments.forEach((payment) => {
            const paymentDate = moment(payment.studentFeesDate);
            const dayKey = paymentDate.format('YYYY-MM-DD');
            const monthKey = paymentDate.format('YYYY-MM');

            dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + payment.studentFees;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + payment.studentFees;
        });

        return { dailyTotals, monthlyTotals };
    }, [payments]);

    // Current day and month totals
    const currentDayTotal = useMemo(() => {
        const dayKey = selectedDate.format('YYYY-MM-DD');
        return paymentTotals.dailyTotals[dayKey] || 0;
    }, [paymentTotals.dailyTotals, selectedDate]);

    const currentMonthTotal = useMemo(() => {
        const monthKey = selectedDate.format('YYYY-MM');
        return paymentTotals.monthlyTotals[monthKey] || 0;
    }, [paymentTotals.monthlyTotals, selectedDate]);

    // Format money function
    const formatMoney = (amount) => {
        return `${amount.toLocaleString('uz-UZ')} so\'m`;
    };

    // Navigation handlers
    const handleNextDay = useCallback(() => {
        setSelectedDate((prev) => moment(prev).add(1, 'day'));
    }, []);

    const handlePrevDay = useCallback(() => {
        setSelectedDate((prev) => moment(prev).subtract(1, 'day'));
    }, []);

    const handleNextMonth = useCallback(() => {
        setSelectedDate((prev) => moment(prev).add(1, 'month'));
    }, []);

    const handlePrevMonth = useCallback(() => {
        setSelectedDate((prev) => moment(prev).subtract(1, 'month'));
    }, []);

    // Disable navigation for future dates
    const isPrevDayDisabled = selectedDate.isSame(moment(), 'day');
    const isNextDayDisabled = selectedDate.isSame(moment(), 'day');
    const isPrevMonthDisabled = selectedDate.isSame(moment(), 'month');
    const isNextMonthDisabled = selectedDate.isSame(moment(), 'month');

    const currentMonthName = months[selectedDate.month()];

    // Toggle view mode
    const toggleViewMode = useCallback(() => {
        setViewMode((prev) => (prev === 'daily' ? 'monthly' : 'daily'));
    }, []);

    return (
        <div className="portfolio-performance-main">
            <p>O'quv markaz samaradorligi</p>
            <div className="portfolio-performance">
                <div className="portfolio-performance-item">
                    <div className="portfolio-performance-item-icon">
                        <FaMoneyBillWave />
                    </div>
                    <Tooltip title={`${(viewMode === 'daily' ? currentDayTotal : currentMonthTotal).toLocaleString('uz-UZ')} so'm`}>
                        <div className="performance-item">
                            <p>{viewMode === 'daily' ? 'Kunlik tushumlar' : 'Oylik tushumlar'}</p>
                            <h3>{formatMoney(viewMode === 'daily' ? currentDayTotal : currentMonthTotal)}</h3>
                            <div className="daromar-statistikasi">
                                <div className="daromad-btns">
                                    <button
                                        onClick={viewMode === 'daily' ? handlePrevDay : handlePrevMonth}
                                        disabled={viewMode === 'daily' ? isPrevDayDisabled : isPrevMonthDisabled}
                                    >
                                        <FaArrowDown />
                                    </button>
                                    <p>
                                        {viewMode === 'daily'
                                            ? selectedDate.format('DD MMMM YYYY')
                                            : currentMonthName}
                                    </p>
                                    <button
                                        onClick={viewMode === 'daily' ? handleNextDay : handleNextMonth}
                                        disabled={viewMode === 'daily' ? isNextDayDisabled : isNextMonthDisabled}
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button className="daromadB_btn" onClick={toggleViewMode}>
                                        {viewMode === 'daily' ? 'Oylik' : 'Kunlik'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Tooltip>
                </div>
                <div className="portfolio-performance-item">
                    <div className="portfolio-performance-item-icon icon-color1">
                        <GrMoney />
                    </div>
                    <Tooltip title={`${totalBalance.toLocaleString('uz-UZ')} so'm`}>
                        <div className="performance-item">
                            <p>Umumiy balans</p>
                            <h3>{formatMoney(totalBalance)}</h3>
                            {/* <p>O'sish tezligi: 14,1%</p> */}
                        </div>
                    </Tooltip>
                </div>
                <div className="portfolio-performance-item">
                    <div className="portfolio-performance-item-icon icon-color2">
                        <FaUserGraduate />
                    </div>
                    <div className="performance-item">
                        <p>Aktiv o'quvchilar</p>
                        <h3>{activeStudents.length}</h3>
                        {/* <p>6,55% o'sib ketdi</p> */}
                    </div>
                </div>
                <div className="portfolio-performance-item">
                    <div className="portfolio-performance-item-icon icon-color3">
                        <GiTakeMyMoney />
                    </div>
                    <Tooltip title={`${totalIndebtedness.toLocaleString('uz-UZ')} so'm`}>
                        <div className="performance-item">
                            <p>Jami qarzdorlik</p>
                            <h3>{formatMoney(totalIndebtedness)}</h3>
                            {/* <p>7,35% o'sib ketdi</p> */}
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default PortfolioPerformance;

