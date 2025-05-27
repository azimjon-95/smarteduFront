import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button, Input, message, Popover, Menu } from 'antd';
import { useGetStudentQuery } from '../../../../context/studentsApi';
import {
    useGetAttendanceByGroupQuery,
    useUpdateAttendanceMutation,
} from '../../../../context/attendancesApi';
import { HiDotsVertical, HiUser, HiChatAlt } from 'react-icons/hi';
import { IoArrowBackOutline } from 'react-icons/io5';
import { FaAnglesRight } from "react-icons/fa6";
import { useNavigate, useParams, Link } from 'react-router-dom';
import moment from 'moment';
import { initializeData } from './InitializeData';
import { debounce } from 'lodash';
import MessageModal from './message/Message';
import {
    useGetAllGroupsQuery,
    useAddGroupaIdMutation,
} from '../../../../context/lessonsApi';
import LessonSchedule from './LessonSchedule';
import './style/StudentAttendanceJournal.css';

const generateDaysArray = (daysInMonth) => Array.from({ length: daysInMonth }, (_, i) => i + 1);

const isWeekend = (day) => {
    const date = moment(`${moment().year()}-${moment().month() + 1}-${day}`, 'YYYY-MM-DD');
    return date.day() === 0 || date.day() === 6;
};

const StudentRow = React.memo(
    ({ id, navigate, student, index, daysArray, mode, attendance, grades, handleInputChange, isWeekend, currentDay }) => {
        const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

        const handleOpenMessageModal = () => setIsMessageModalOpen(true);
        const handleCloseMessageModal = () => setIsMessageModalOpen(false);

        const menu = (
            <Menu className="student-action-menu">
                <button
                    key="view"
                    onClick={() => navigate(`/student/single_page/${student._id}/${id}`)}
                    className="student-action-menu__item"
                >
                    <HiUser className="student-action-menu__icon" />
                    Profilni ko'rish
                </button>
                <button
                    key="message"
                    onClick={handleOpenMessageModal}
                    className="student-action-menu__item"
                >
                    <HiChatAlt className="student-action-menu__icon" />
                    Xabar yuborish
                </button>
            </Menu>
        );

        return (
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
                    <Popover content={menu} trigger="click" placement="bottomRight">
                        <button className="attendance-btn" type="primary">
                            <HiDotsVertical />
                        </button>
                    </Popover>
                    <MessageModal
                        visible={isMessageModalOpen}
                        onCancel={handleCloseMessageModal}
                        student={student}
                    />
                </div>
            </div>
        );
    }
);

const StudentAttendanceJournal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: students, isLoading: isStudentsLoading } = useGetStudentQuery();
    const { data: attendanceData, isLoading: isAttendanceLoading, error: attendanceError } = useGetAttendanceByGroupQuery(id);
    const [updateAttendance] = useUpdateAttendanceMutation();
    const studentList = useMemo(() => students?.filter((student) => student.groupId === id) || [], [students, id]);
    const daysInMonth = moment().daysInMonth();
    const daysArray = useMemo(() => generateDaysArray(daysInMonth), [daysInMonth]);
    const { data: lesson = [] } = useGetAllGroupsQuery();
    const [addGroupaId] = useAddGroupaIdMutation();
    const [selectLevelId, setSelectLevelId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentMonth = moment().format('MMMM YYYY');
    const currentDay = moment().date();

    const group = useMemo(() => {
        if (lesson?.data) {
            const matched = lesson.data.find((item) => item.groupaIds.includes(id));
            return matched || null;
        }
        return null;
    }, [lesson, id]);

    const selectedLesson = useMemo(() => {
        if (lesson?.data && selectLevelId) {
            return lesson.data.find((item) => item._id === selectLevelId);
        }
        return null;
    }, [lesson, selectLevelId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addGroupaId({ id: selectLevelId, groupaId: id }).unwrap();
            message.success('GroupaId muvaffaqiyatli qo\'shildi!');
        } catch (error) {
            console.error('Xato:', error);
            message.error(`Xato yuz berdi: ${error.data?.error || error.message}`);
        }
    };

    useEffect(() => {
        if (selectLevelId) {
            handleSubmit(new Event('submit'));
        }
    }, [selectLevelId]);

    const [attendance, setAttendance] = useState({});
    const [grades, setGrades] = useState({});
    const [mode, setMode] = useState('attendance');
    const [tableWidth, setTableWidth] = useState(() => {
        const saved = localStorage.getItem('tableWidth');
        return saved ? parseFloat(saved) : 70;
    });
    const [actionsWidth, setActionsWidth] = useState(() => {
        const saved = localStorage.getItem('actionsWidth');
        return saved ? parseFloat(saved) : 30;
    });

    const isDragging = useRef(false);
    const containerRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('tableWidth', tableWidth.toString());
        localStorage.setItem('actionsWidth', actionsWidth.toString());
    }, [tableWidth, actionsWidth]);

    const handleMouseMove = (e) => {
        if (!isDragging.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newX = e.clientX - containerRect.left;
        const newTableWidth = (newX / containerRect.width) * 100;

        if (newTableWidth >= 20 && newTableWidth <= 80) {
            setTableWidth(newTableWidth);
            setActionsWidth(100 - newTableWidth);
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleSlideLeft = useCallback(() => {
        const newTableWidth = Math.min(tableWidth + 10, 80);
        setTableWidth(newTableWidth);
        setActionsWidth(100 - newTableWidth);
    }, [tableWidth]);

    const handleSlideRight = useCallback(() => {
        const newTableWidth = Math.max(tableWidth - 10, 20);
        setTableWidth(newTableWidth);
        setActionsWidth(100 - newTableWidth);
    }, [tableWidth]);

    const handleLessonClick = (lesson) => {
        console.log('Selected lesson:', lesson);
    };

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

    useEffect(() => {
        if (attendanceError) {
            message.error(`Davomat ma'lumotlarini yuklashda xatolik: ${attendanceError?.data?.message || 'Noma\'lum xato'}`);
            console.error('Attendance Error:', attendanceError);
        }
    }, [attendanceError]);

    const sendToServer = useCallback(
        debounce(async (studentId, day, value, type) => {
            try {
                if (!studentId || !day || !type || !['attendance', 'grades'].includes(type)) {
                    throw new Error('Invalid input: studentId, day, and valid type are required');
                }

                let subjects = group?.subjects || 'Unknown';
                if (Array.isArray(subjects)) {
                    subjects = subjects[0] || 'Unknown';
                }

                let teacherId = group?.teacherId || 'Unknown';
                if (typeof teacherId === 'string' && teacherId.startsWith('[')) {
                    try {
                        teacherId = JSON.parse(teacherId)[0] || 'Unknown';
                    } catch (e) {
                        throw new Error('Invalid teacherId format');
                    }
                }

                const formattedDate = `${day.toString().padStart(2, '0')}.${(moment().month() + 1)
                    .toString()
                    .padStart(2, '0')}.${moment().year()}`;

                const payload = [
                    {
                        studentId,
                        subjects,
                        teacherId,
                        [type]: [
                            {
                                date: formattedDate,
                                [type === 'attendance' ? 'attendance' : 'grade']: value,
                            },
                        ],
                    },
                ];

                await updateAttendance({ groupId: id, data: payload }).unwrap();
                message.success(`${type === 'attendance' ? 'Davomat' : 'Baho'} saqlandi!`);
            } catch (error) {
                message.error(`${type === 'attendance' ? 'Davomat' : 'Baho'} saqlashda xatolik!`);
                console.error('Save error:', error);
            }
        }, 500),
        [id, updateAttendance, group]
    );

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

    const handleModeChange = () => setMode((prev) => (prev === 'attendance' ? 'grades' : 'attendance'));
    const handleBack = () => navigate(-1);

    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    const handleLessonSelect = (lessonId) => {
        setSelectLevelId(lessonId);
        setIsModalOpen(false);
    };

    if (isStudentsLoading || isAttendanceLoading) {
        return (
            <div className="complex-loading-container">
                <div className="complex-spinner">
                    <div className="spinner-ring spinner-ring--outer"></div>
                    <div className="spinner-ring spinner-ring--inner"></div>
                    <div className="spinner-pulse"></div>
                </div>
                <p className="loading-text">Yuklanmoqda...</p>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="content-container">
                <div className="header-section">
                    <Button onClick={handleBack} className="back-button">
                        <IoArrowBackOutline /> Orqaga
                    </Button>
                    <div className="header-sectionBox">
                        <Link to={`/register/${id}`}>
                            <Button style={{ background: "#001529" }} type="primary">Qabul</Button>
                        </Link>
                        <div className="lesson-select-container">
                            <button
                                onClick={toggleModal}
                                className="lesson-select-button"
                            >
                                {group
                                    ? `${group.subjects[0] || 'Unknown'} ${group.level}-Step ${group.step}`
                                    : 'Darsni tanlang'}
                            </button>
                            {isModalOpen && (
                                <div className="custom-modal">
                                    <div className="modal-content">
                                        <div className="modal-headers">
                                            <h3>Darsni tanlang</h3>
                                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                                &times;
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            {lesson?.data?.map((item) => (
                                                <div
                                                    key={item._id}
                                                    className={`modal-lesson-item ${selectLevelId === item._id ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        handleLessonSelect(item._id)
                                                        toggleModal()
                                                    }}
                                                >
                                                    {`${item.subjects[0] || 'Unknown'} - ${item.level} (Step ${item.step})`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button onClick={handleModeChange} className="change-button">
                            {mode === 'attendance' ? "Baholarga o'tish" : "Davomatga o'tish"}
                        </Button>
                    </div>
                </div>

                <div className="title-attendContiner" ref={containerRef}>
                    <div
                        className="title-attend"
                        style={{ width: `${tableWidth}%`, transition: 'width 0.3s ease-in-out' }}
                    >
                        <div className="resize-handle">
                            <h2>{currentMonth}</h2>
                            <button
                                onClick={handleSlideLeft}
                                className="btnChevronRight"
                                disabled={tableWidth >= 80}
                                aria-label="Expand table by 10%"
                            >
                                <FaAnglesRight />
                            </button>
                        </div>
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

                    <LessonSchedule
                        id={id}
                        daysInMonth={daysInMonth}
                        group={group}
                        actionsWidth={actionsWidth}
                        handleSlideRight={handleSlideRight}
                        handleLessonClick={handleLessonClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceJournal;