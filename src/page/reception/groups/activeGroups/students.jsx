import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, message, Modal } from 'antd';
import { useGetStudentQuery, useDeleteStudentMutation } from '../../../../context/studentsApi';
import { useUpdateRegistrationMutation, useGetAllRegistrationsQuery } from '../../../../context/groupsApi'
import {
    useGetAttendanceByGroupQuery,
    useUpdateAttendanceMutation,
} from '../../../../context/attendancesApi';
import { HiDotsVertical } from "react-icons/hi";
import { IoArrowBackOutline } from 'react-icons/io5';
import { useNavigate, useParams, Link } from 'react-router-dom';
import moment from 'moment';
import { initializeData } from './InitializeData';
import { debounce } from 'lodash';
import './style/StudentAttendanceJournal.css';

// Kunlar ro'yxatini generatsiya qilish
const generateDaysArray = (daysInMonth) => Array.from({ length: daysInMonth }, (_, i) => i + 1);

// Dars kunini tekshirish
const isLessonDay = (day, schedule) => {
    const date = moment(`${moment().year()}-${moment().month() + 1}-${day}`, 'YYYY-MM-DD');
    return schedule === 'evenDays' ? date.date() % 2 === 0 : date.date() % 2 !== 0;
};

// Dars vaqti tugaganligini tekshirish
const isLessonTimePassed = (lessonTime, currentTime = moment()) => {
    const [, endTime] = lessonTime.split('-');
    const lessonEnd = moment(endTime, 'HH:mm');
    return currentTime.isAfter(lessonEnd);
};

// Dam kunlarini aniqlash
const isWeekend = (day) => {
    const date = moment(`${moment().year()}-${moment().month() + 1}-${day}`, 'YYYY-MM-DD');
    return date.day() === 0 || date.day() === 6;
};




const StudentRow = React.memo(({ id, navigate, student, index, daysArray, mode, attendance, grades, handleInputChange, isWeekend, currentDay }) => (
    <div className="student-row">
        <div className="student-cell">
            <span className="student-index">{index + 1}.</span>
            <span>{`${student.firstName} ${student.lastName}`}</span>
        </div>
        <div className="attendance-row">
            {daysArray.map((day) => {
                const inputValue = mode === 'attendance' ? attendance[student._id]?.[day] || '' : grades[student._id]?.[day] || '';
                let borderColor = '';

                if (mode === 'attendance') {
                    borderColor = inputValue === 'A' ? 'green' : inputValue === 'X' ? 'red' : '';
                } else {
                    borderColor = {
                        '5': 'green',
                        '4': 'lightgreen',
                        '3': 'gold',
                        '2': 'red',
                    }[inputValue] || '';
                }

                return (
                    <div
                        key={`${student._id}-${day}`}
                        className={`attendance-cell ${currentDay === day ? 'current-day' : ''} ${isWeekend(day) ? 'weekend' : ''}`}
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => handleInputChange(student._id, day, e.target.value)}
                            placeholder="--"
                            maxLength={1}
                            style={{
                                width: 40,
                                textAlign: 'center',
                                fontSize: 14,
                                padding: 0,
                                borderColor,
                                borderWidth: borderColor ? 2 : 1,
                            }}
                        />
                    </div>
                );
            })}
        </div>

        <div className="attendance-rowBtn">
            <button onClick={() => navigate(`/student/single_page/${student._id}/${id}`)} className="attendance-btn" type="primary">
                <HiDotsVertical />
            </button>
        </div>
    </div>
));

const StudentAttendanceJournal = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // RTK Query so'rovlari
    const { data: students, isLoading: isStudentsLoading } = useGetStudentQuery();
    const { data: getGroups, isLoading: isGroupsLoading } = useGetAllRegistrationsQuery();
    const [deleteStudent] = useDeleteStudentMutation();
    const { data: attendanceData, isLoading: isAttendanceLoading, error: attendanceError } = useGetAttendanceByGroupQuery(id);
    const [updateAttendance] = useUpdateAttendanceMutation();
    const [updateRegistration] = useUpdateRegistrationMutation();
    // Ma'lumotlarni keshlash
    const studentList = useMemo(() => students?.filter((student) => student.groupId === id) || [], [students, id]);
    const group = useMemo(() => getGroups?.registrations?.find((i) => i._id === id), [getGroups, id]);
    const daysInMonth = moment().daysInMonth();
    const daysArray = useMemo(() => generateDaysArray(daysInMonth), [daysInMonth]);

    // Joriy oy va kunlar
    const currentMonth = moment().format('MMMM YYYY');
    const currentDay = moment().date();

    // Holatlar
    const [attendance, setAttendance] = useState({});
    const [grades, setGrades] = useState({});
    const [mode, setMode] = useState('attendance');

    // Ma'lumotlarni boshlash
    const initialData = useMemo(
        () => (studentList.length && attendanceData ? initializeData(daysArray, studentList, attendanceData) : null),
        [daysArray, studentList, attendanceData]
    );

    useEffect(() => {
        if (initialData) {
            setAttendance(initialData.attendance);
            setGrades(initialData.grades);
        }
    }, [initialData]);

    // Xatolarni boshqarish
    useEffect(() => {
        if (attendanceError) {
            message.error(`Davomat ma'lumotlarini yuklashda xatolik: ${attendanceError?.data?.message || 'Noma\'lum xato'}`);
            console.error('Attendance Error:', attendanceError);
        }
    }, [attendanceError]);


    // Serverga bitta o'zgartirishni yuborish
    const sendToServer = useCallback(
        debounce(async (studentId, day, value, type) => {
            try {
                const payload = [{
                    studentId,
                    subjects: group?.subjects || 'Unknown',
                    teacherId: group?.teacherId || 'Unknown',
                    [type]: [{
                        date: `${day.toString().padStart(2, '0')}.${(moment().month() + 1).toString().padStart(2, '0')}.${moment().year()}`,
                        [type === 'attendance' ? 'attendance' : 'grade']: value,
                    }],
                }];
                await updateAttendance({ groupId: id, data: payload }).unwrap();
                message.success(`${type === 'attendance' ? 'Davomat' : 'Baho'} saqlandi!`);
            } catch (error) {
                message.error(`${type === 'attendance' ? 'Davomat' : 'Baho'} saqlashda xatolik!`);
                console.error('Save error:', error);
            }
        }, 500),
        [id, updateAttendance, group]
    );

    // Input o'zgarishini boshqarish
    const handleInputChange = useCallback(
        (studentId, day, value) => {
            const updateState = mode === 'attendance' ? setAttendance : setGrades;
            const validValues = mode === 'attendance' ? ['A', 'X', ''] : ['2', '3', '4', '5', ''];
            const validValue = validValues.includes(value.toUpperCase()) ? value.toUpperCase() : '';

            updateState((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId] || {},
                    [day]: validValue,
                },
            }));

            if (validValue) {
                sendToServer(studentId, day, validValue, mode === 'attendance' ? 'attendance' : 'grades');
            }
        },
        [mode, sendToServer]
    );

    // Avtomatik X qo'yish
    const autoMarkAbsent = useCallback(() => {
        if (!group || !group.lessonTime || !group.schedule || !attendanceData) return;

        const { lessonTime, schedule, subjects, teacherId } = group;
        const today = moment();
        const payload = [];

        daysArray.forEach((day) => {
            if (!isLessonDay(day, schedule) || !isLessonTimePassed(lessonTime, today) || day > currentDay) return;

            studentList.forEach((student) => {
                const serverAttendance = attendanceData.find((r) => r.studentId === student._id)?.attendance || [];
                const serverGrades = attendanceData.find((r) => r.studentId === student._id)?.grades || [];

                const serverAttendanceRecord = serverAttendance.find(
                    (record) => record.date === `${day.toString().padStart(2, '0')}.${(moment().month() + 1).toString().padStart(2, '0')}.${moment().year()}`
                );
                const serverGradeRecord = serverGrades.find(
                    (record) => record.date === `${day.toString().padStart(2, '0')}.${(moment().month() + 1).toString().padStart(2, '0')}.${moment().year()}`
                );

                const hasServerAttendance = serverAttendanceRecord && ['A', 'X'].includes(serverAttendanceRecord.attendance);
                const hasServerGrade = serverGradeRecord && ['2', '3', '4', '5'].includes(serverGradeRecord.grade);

                const currentAttendance = attendance[student._id]?.[day] || '';
                const currentGrade = grades[student._id]?.[day] || '';

                if (mode === 'attendance' && !hasServerAttendance && !currentAttendance) {
                    setAttendance((prev) => ({
                        ...prev,
                        [student._id]: { ...prev[student._id] || {}, [day]: 'X' },
                    }));
                    payload.push({
                        studentId: student._id,
                        subjects,
                        teacherId,
                        attendance: [{
                            date: `${day.toString().padStart(2, '0')}.${(moment().month() + 1).toString().padStart(2, '0')}.${moment().year()}`,
                            attendance: 'X',
                        }],
                    });
                }

                if (mode === 'grades' && !hasServerGrade && !currentGrade) {
                    setGrades((prev) => ({
                        ...prev,
                        [student._id]: { ...prev[student._id] || {}, [day]: 'X' },
                    }));
                    payload.push({
                        studentId: student._id,
                        subjects,
                        teacherId,
                        grades: [{
                            date: `${day.toString().padStart(2, '0')}.${(moment().month() + 1).toString().padStart(2, '0')}.${moment().year()}`,
                            grade: 'X',
                        }],
                    });
                }
            });
        });

        if (payload.length > 0) {
            updateAttendance({ groupId: id, data: payload })
                .unwrap()
                .then(() => message.success('Avtomatik davomat saqlandi!'))
                .catch((error) => {
                    message.error('Avtomatik davomat saqlashda xatolik!');
                    console.error('Auto save error:', error);
                });
        }
    }, [group, daysArray, studentList, attendance, grades, mode, currentDay, id, updateAttendance, attendanceData]);

    // Har 1 soatda avtomatik X qo'yish
    useEffect(() => {
        const interval = setInterval(autoMarkAbsent, 60 * 60 * 1000); // Har 1 soatda
        return () => clearInterval(interval);
    }, [autoMarkAbsent]);

    // Rejimni almashish va orqaga qaytish
    const handleModeChange = () => setMode((prev) => (prev === 'attendance' ? 'grades' : 'attendance'));
    const handleBack = () => navigate(-1);



    const handleDelete = async (record) => {
        const studentData = getGroups?.registrations?.find((i) => i._id === record.groupId);

        Modal.confirm({
            title: 'Tasdiqlash',
            content: 'Siz haqiqatan ham ushbu talabani o\'chirmoqchimisiz?',
            okText: 'Ok',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    // Talabani o'chirish
                    await deleteStudent(record._id);

                    // Guruhdagi talabalar sonini yangilash
                    const updatedGroupData = {
                        ...studentData,
                        studentsLength: studentData?.studentsLength - 1,
                    };

                    await updateRegistration({ id: studentData?._id, body: updatedGroupData });
                    message.success('Talaba muvaffaqiyatli o\'chirildi');
                } catch (error) {
                    message.error('Talabani o\'chirishda xatolik yuz berdi');
                    console.error(error);
                }
            },
        });
    };


    // Yuklanish holati
    if (isStudentsLoading || isGroupsLoading || isAttendanceLoading) {
        return <div>Yuklanmoqda...</div>;
    }

    return (
        <div className="main-container">
            <div className="content-container">
                <div className="header-section">
                    <Button onClick={handleBack} className="back-button">
                        <IoArrowBackOutline /> Orqaga
                    </Button>
                    <Link to={`/register/${id}`}>
                        <Button type="primary">Qabul</Button>
                    </Link>
                    <Button onClick={handleModeChange} className="change-button">
                        {mode === 'attendance' ? 'Baholarga o\'tish' : 'Davomatga o\'tish'}
                    </Button>
                </div>

                <div className="title-attend">
                    <h1 className="title-head">{currentMonth}</h1>
                    <div className="card-attend">
                        <div className="table-attend">
                            <div className="table-header-row">
                                <div className="table-headerBox">
                                    <div className="table-header">Talabalar</div>
                                </div>

                                <div className="days-row">
                                    {daysArray.map((day) => (
                                        <div
                                            key={day}
                                            className={`day-cell ${currentDay === day ? 'current-day' : ''} ${isWeekend(day) ? 'weekend' : ''}`}
                                        >
                                            <p>{day}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="table-single">Saxifa</div>
                            </div>

                            {studentList.map((student, index) => (
                                <StudentRow
                                    id={id}
                                    navigate={navigate}
                                    key={student._id}
                                    student={student}
                                    index={index}
                                    daysArray={daysArray}
                                    mode={mode}
                                    attendance={attendance}
                                    grades={grades}
                                    handleInputChange={handleInputChange}
                                    isWeekend={isWeekend}
                                    currentDay={currentDay}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceJournal;
