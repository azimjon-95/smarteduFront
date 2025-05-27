import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { IoMdSettings } from "react-icons/io";
import { UsergroupAddOutlined, PauseCircleOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { FaCheckCircle, FaTimesCircle, FaHome, FaBirthdayCake, FaVenusMars, FaBook, FaChalkboardTeacher, FaClock, FaPhone, FaMoneyBillWave, FaExclamationTriangle, FaUserCheck, FaArrowLeft, FaMoneyCheckAlt } from 'react-icons/fa';
import { useGetStudentByIdQuery, useChangeGroupMutation } from '../../context/studentsApi';
import { useGetPaymentsByStudentIdQuery } from '../../context/payStudentsApi';
import { useGetAllRegistrationsQuery } from '../../context/groupsApi';
import { BsQrCodeScan } from "react-icons/bs";
import { useGetAttendanceByGroupAndStudentQuery } from '../../context/attendancesApi';
import { Popover, Modal, Button, message, Select } from 'antd';
import QRCode from 'qrcode';
import ManAvatar from '../../assets/manAvarat.png';
import WomenAvatar from '../../assets/womenAvaratt.png';
import './style.css';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

// InfoItem component
const InfoItem = ({ icon, label, value }) => (
    <div className="info-item">
        {icon}
        <strong>{label}:</strong> <span>{value || 'Ma\'lumot yo\'q'}</span>
    </div>
);

// PaymentModal component
const PaymentModal = ({ isOpen, onClose, paymentHistory }) => {
    if (!isOpen) return null;
    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <div className="modal-header">
                    <h2>To‘lovlar Tarixi</h2>
                    <button className="close-btn" onClick={onClose} title="Yopish">
                        <FaTimesCircle />
                    </button>
                </div>
                <table className="payment-table">
                    <thead>
                        <tr>
                            <th>Sana va Vaqt</th>
                            <th>Miqdor</th>
                            <th>Holati</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentHistory.length ? (
                            paymentHistory.map((payment, index) => (
                                <tr key={index}>
                                    <td>{payment.date}</td>
                                    <td>{payment.amount.toLocaleString()} so‘m</td>
                                    <td>{payment.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3">To‘lov ma\'lumotlari yo\'q</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// GroupChangeModal component
const GroupChangeModal = ({ isOpen, onClose, groups, studentId, changeGroup }) => {
    const [newGroupId, setNewGroupId] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState('Hammasi');

    const handleGroupSelect = useCallback((groupId) => {
        setNewGroupId(groupId);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!newGroupId) {
            message.error('Iltimos, guruh tanlang!');
            return;
        }
        const newStudent = { studentId, newGroupId };
        try {
            await changeGroup(newStudent).unwrap();
            message.success('Guruh muvaffaqiyatli almashtirildi!');
            onClose();
        } catch (error) {
            message.error(`Xatolik: ${error?.data?.message || 'Guruhni almashtirishda xato yuz berdi'}`);
        }
    }, [newGroupId, studentId, changeGroup, onClose]);

    // Compute unique subjects
    const uniqueSubjects = useMemo(() => {
        const subjectsSet = new Set();
        groups?.registrations?.forEach((group) => {
            group.subjects.forEach((subject) => subjectsSet.add(subject));
        });
        return ['Hammasi', ...Array.from(subjectsSet).sort()];
    }, [groups]);

    // Filter groups based on selected subject
    const filteredGroups = useMemo(() => {
        if (selectedSubject === 'Hammasi') {
            return groups?.registrations || [];
        }
        return groups?.registrations?.filter((group) =>
            group.subjects.includes(selectedSubject)
        ) || [];
    }, [groups, selectedSubject]);

    return (
        <Modal
            title={
                <div className="modal-headermodal">
                    Guruh Almashtirish
                    <Select
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                        className="subject-select"
                        dropdownStyle={{ minWidth: 150 }}
                        size="small"
                    >
                        {uniqueSubjects.map((subject) => (
                            <Select.Option key={subject} value={subject}>
                                {subject}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Bekor qilish
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleConfirm}
                    disabled={!newGroupId}
                >
                    Tasdiqlash
                </Button>,
            ]}
            width={600}
        >
            <div className="scroll-container">
                {filteredGroups.length > 0 ? (
                    <div className="group-grid">
                        {filteredGroups?.map((group) => (
                            <div
                                key={group._id}
                                className={`group-card ${newGroupId === group._id ? 'group-card-selected' : ''}`}
                                onClick={() => handleGroupSelect(group._id)}
                            >
                                <div className="group-content">
                                    <div className="group-content-main">
                                        <p className="subject-title">
                                            📘 Fan: <span className="subject-name">{group.subjects.join(', ')}</span>
                                        </p>
                                        <p className="teacher-info">
                                            👨‍🏫 O‘qituvchi: <span className="teacher-name">{group.teachers.join(', ')}</span>
                                        </p>
                                        <p className="lesson-time">
                                            🕒 Dars vaqti: <span className="lesson-time-value">{group.lessonTime}</span> —
                                            <span className="schedule-type">
                                                {group.schedule === 'oddDays' ? ' Toq kunlar' : ' Juft kunlar'}
                                            </span>
                                        </p>
                                        <i style={{ color: group.state === "active" ? "green" : "red" }}>
                                            {group.state === "active" ? "Faol" : "Yangi"}
                                        </i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-groups">Mavjud guruhlar topilmadi</p>
                )}
            </div>
        </Modal>
    );
};

// Main StudentSinglePage component
const StudentSinglePage = () => {
    const { id, groupId } = useParams();
    const navigate = useNavigate();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);

    // API queries
    const { data: student, isLoading: isStudentLoading, error: studentError } = useGetStudentByIdQuery(id);
    const { data: payment, isLoading: isPaymentLoading, error: paymentError } = useGetPaymentsByStudentIdQuery(id);
    const { data: attendance, isLoading: isAttendanceLoading, error: attendanceError } = useGetAttendanceByGroupAndStudentQuery({ groupId, studentId: id });
    const { data: groups } = useGetAllRegistrationsQuery();
    const [changeGroup] = useChangeGroupMutation();
    // Data
    const attendanceData = attendance?.attendance || [];
    const gradesData = attendance?.grades || [];

    // Transform server payment data
    const paymentHistory = useMemo(() => {
        if (!payment?.length) return [];

        return payment.map((item) => {
            const dateTime = item.studentFeesDate && item.studentFeesTime
                ? `${new Date(item.studentFeesDate).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })} ${item.studentFeesTime}`
                : 'Noma\'lum';
            const amount = item.studentFees || 0;
            const status = item.studentFees > 0 ? 'To‘landi' : 'To‘lanmadi';
            return { date: dateTime, amount, status };
        });
    }, [payment]);

    // Chart segment colors
    const getSegmentColor = useMemo(() => {
        if (!gradesData.length) return [];
        const colors = [];
        for (let i = 1; i < gradesData.length; i++) {
            const prevGrade = parseInt(gradesData[i - 1].grade);
            const currentGrade = parseInt(gradesData[i].grade);
            colors.push(
                currentGrade > prevGrade ? '#22c55e' :
                    currentGrade < prevGrade ? '#ef4444' :
                        '#6b7280'
            );
        }
        return colors;
    }, [gradesData]);

    // Chart segment tension
    const getSegmentTension = useMemo(() => {
        if (!gradesData.length) return [];
        const tensions = [];
        for (let i = 1; i < gradesData.length; i++) {
            const prevGrade = parseInt(gradesData[i - 1].grade);
            const currentGrade = parseInt(gradesData[i].grade);
            const diff = Math.abs(currentGrade - prevGrade);
            tensions.push(diff > 1 ? 0.1 : 0.4);
        }
        return tensions;
    }, [gradesData]);

    // Chart data
    const chartData = useMemo(() => ({
        labels: gradesData.map((g) => g.date),
        datasets: [
            {
                label: 'Baholar',
                data: gradesData.map((g) => parseInt(g.grade)),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                fill: true,
                segment: {
                    borderColor: (ctx) => {
                        const index = ctx.p1DataIndex;
                        return index === 0 ? '#4f46e5' : getSegmentColor[index - 1] || '#4f46e5';
                    },
                    tension: (ctx) => {
                        const index = ctx.p1DataIndex;
                        return index === 0 ? 0.4 : getSegmentTension[index - 1] || 0.4;
                    },
                },
                pointBackgroundColor: gradesData.map((g) => {
                    const grade = parseInt(g.grade);
                    return grade >= 5 ? '#22c55e' : grade >= 4 ? '#86efac' : grade >= 3 ? '#facc15' : '#ef4444';
                }),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
            },
        ],
    }), [gradesData, getSegmentColor, getSegmentTension]);

    // Chart options
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { font: { size: 14 }, color: '#1f2937' } },
            tooltip: { callbacks: { label: (context) => `Baho: ${context.parsed.y}` } },
        },
        scales: {
            y: { beginAtZero: true, max: 5, title: { display: true, text: 'Baho', color: '#1f2937', font: { size: 14 } } },
            x: { title: { display: true, text: 'Sana', color: '#1f2937', font: { size: 14 } } },
        },
    }), []);

    // Student info items
    const infoItems = useMemo(() => [
        { icon: <FaHome className="info-icon" />, label: 'Manzil', value: student?.address },
        { icon: <FaBirthdayCake className="info-icon" />, label: 'Tug‘ilgan sana', value: student ? new Date(student.dateOfBirth).toLocaleDateString() : '' },
        { icon: <FaVenusMars className="info-icon" />, label: 'Jinsi', value: student?.gender === 'male' ? 'Erkak' : 'Ayol' },
        { icon: <FaBook className="info-icon" />, label: 'Fan', value: student?.subject },
        { icon: <FaChalkboardTeacher className="info-icon" />, label: 'O‘qituvchi', value: student?.teacherFullName?.join(', ') },
        { icon: <FaClock className="info-icon" />, label: 'Dars vaqti', value: student ? `${student.lessonTime} (${student.lessonDate === 'evenDays' ? 'Juft kunlar' : 'Toq kunlar'})` : '' },
        { icon: <FaPhone className="info-icon" />, label: 'Ota-ona telefoni', value: student?.parentPhoneNumber },
        { icon: <FaPhone className="info-icon" />, label: 'Talaba telefoni', value: student?.studentPhoneNumber },
        { icon: <FaMoneyBillWave className="info-icon" />, label: 'Dars haqqi', value: student ? `${student.payForLesson.toLocaleString()} so‘m` : '' },
        { icon: <FaExclamationTriangle className="info-icon" />, label: 'Qarz', value: student ? `${student.indebtedness.debtorPay.toLocaleString()} so‘m (Muddat: ${student.indebtedness.debtorDate})` : '' },
        { icon: <FaUserCheck className="info-icon" />, label: 'Holati', value: student?.state === 'active' ? 'Faol' : 'Nofaol' },
    ], [student]);

    // Button handlers
    const handleBack = useCallback(() => navigate(-1), [navigate]);
    const togglePaymentModal = useCallback(() => setIsPaymentModalOpen((prev) => !prev), []);
    const toggleGroupModal = useCallback(() => setIsGroupModalOpen((prev) => !prev), []);
    const handleSettingsPopoverVisibleChange = useCallback((visible) => {
        setIsSettingsPopoverOpen(visible);
    }, []);

    // Settings popover actions
    const handleSettingsAction = useCallback((action) => {
        setIsSettingsPopoverOpen(false);
        switch (action) {
            case 'changeGroup':
                toggleGroupModal();
                break;
            case 'freezeStudies':
                break;
            case 'expel':
                break;
            default:
                break;
        }
    }, [toggleGroupModal]);


    // Handler for QR code generation
    const handleGenerateQr = useCallback(async (id, student) => {
        try {
            setIsSettingsPopoverOpen(false);

            const qrText = `${id}`;
            const fullName = `${student.firstName} ${student.lastName} ${student.middleName}`;
            const size = 300;

            // Yangi canvas yaratamiz
            const canvas = document.createElement('canvas');
            const textHeight = 40;
            canvas.width = size;
            canvas.height = size + textHeight;

            const ctx = canvas.getContext('2d');

            // QR code ni yaratib canvasga chizamiz
            await QRCode.toCanvas(canvas, qrText, {
                width: size,
                margin: 1,
                errorCorrectionLevel: 'H',
            });

            // Text uchun orqa fon yaratamiz
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, size, size, textHeight);

            // Ism-familyani yozamiz
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(fullName, size / 2, size + 25);

            // Yuklab olish uchun data URL va link yaratamiz
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `qr_${fullName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success('QR kod va ism muvaffaqiyatli yuklab olindi!');
        } catch (error) {
            console.error('QR kodni yaratishda xato:', error);
            message.error(`QR kodni olishda xato: ${error?.message || 'Nomaʼlum xato'}`);
        }
    }, []);

    // Popover content
    const settingsContent = (
        <div className="settings-menu">
            <button className="settings-menu-item" onClick={() => handleSettingsAction('changeGroup')}>
                <UsergroupAddOutlined style={{ marginRight: 8 }} /> Guruh almashtirish
            </button>
            <button disabled className="settings-menu-item" onClick={() => handleSettingsAction('freezeStudies')}>
                <PauseCircleOutlined style={{ marginRight: 8 }} /> O'qishni muzlatish
            </button>
            <button disabled className="settings-menu-item" onClick={() => handleSettingsAction('expel')}>
                <UserDeleteOutlined style={{ marginRight: 8 }} /> Chiqarib yuborish
            </button>

            <button className="settings-menu-item" onClick={() => handleGenerateQr(id, student)}>
                <BsQrCodeScan style={{ marginRight: 8 }} /> QR olish
            </button>
        </div>
    );

    // Loading and error states
    if (isStudentLoading || isAttendanceLoading || isPaymentLoading) return <div className="loading">Yuklanmoqda...</div>;
    if (studentError || attendanceError || paymentError) return (
        <div className="error">
            Xatolik yuz berdi: {(studentError || attendanceError || paymentError)?.data?.message || 'Noma\'lum xato'}
        </div>
    );
    if (!student) return <div className="no-data">Talaba ma\'lumotlari topilmadi</div>;

    return (
        <div className="student-profile-container">
            <div className="student-card">
                <div className="avatar-header">
                    <button className="header-btn back-btn" onClick={handleBack} title="Orqaga">
                        <FaArrowLeft />
                    </button>
                    <div className="header-btnBox">
                        <button className="header-btn payment-btn" onClick={togglePaymentModal} title="To‘lovlar tarixi">
                            <FaMoneyCheckAlt />
                        </button>
                        <Popover
                            content={settingsContent}
                            title={null}
                            trigger="click"
                            visible={isSettingsPopoverOpen}
                            onVisibleChange={handleSettingsPopoverVisibleChange}
                            placement="bottomRight"
                        >
                            <button className="header-btn payment-btn" title="Sozlamalar">
                                <IoMdSettings />
                            </button>
                        </Popover>
                    </div>
                </div>
                <div className="avatar-info">
                    <img src={student.gender === 'male' ? ManAvatar : WomenAvatar} alt="Talaba Avatar" />
                </div>
                <h1>{`${student.firstName} ${student.lastName} ${student.middleName}`}</h1>
                <div className="info-grid">
                    {infoItems.map((item, index) => (
                        <InfoItem key={index} {...item} />
                    ))}
                </div>
            </div>

            <div className="section-infoBox">
                <div className="section-info">
                    <h2>Davomat</h2>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>Sana</th>
                                <th>Holati</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.length ? (
                                attendanceData.map((record, index) => (
                                    <tr key={index} className={record.attendance === 'A' ? 'present' : 'absent'}>
                                        <td>{record.date}</td>
                                        <td>
                                            {record.attendance === 'A' ? (
                                                <span><FaCheckCircle color="green" /> Keldi</span>
                                            ) : (
                                                <span><FaTimesCircle color="red" /> Kelmadi</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="2">Davomat ma'lumotlari yo'q</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="section-info">
                    <h2>Baholar</h2>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>Sana</th>
                                <th>Baho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradesData.length ? (
                                gradesData.map((record, index) => {
                                    const grade = parseInt(record.grade);
                                    const gradeColor = grade >= 5 ? 'green' : grade >= 4 ? 'lightgreen' : grade >= 3 ? 'gold' : 'red';
                                    const gradeIcon = grade >= 5 ? '🥇' : grade >= 4 ? '🥈' : grade >= 3 ? '🥉' : '😔';
                                    return (
                                        <tr key={index}>
                                            <td>{record.date}</td>
                                            <td style={{ color: gradeColor }}>
                                                {gradeIcon} {grade}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="2">Baholar ma'lumotlari yo'q</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="chart-container">
                {gradesData.length ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <div className="no-data">Grafik uchun ma'lumotlar yo'q</div>
                )}
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={togglePaymentModal}
                paymentHistory={paymentHistory}
            />

            <GroupChangeModal
                isOpen={isGroupModalOpen}
                onClose={toggleGroupModal}
                groups={groups}
                studentId={id}
                changeGroup={changeGroup}
            />
        </div>
    );
};

export default StudentSinglePage;