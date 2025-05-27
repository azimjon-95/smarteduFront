import React, { useMemo, useCallback, useRef } from 'react';
import { message } from 'antd';
import { FaAnglesLeft } from "react-icons/fa6";
import moment from 'moment';
import { useGetAllGroupsQuery, useUpdateGroupMutation } from '../../../../context/lessonsApi';
import './style/LessonSchedule.css';

// Dars kunini tekshirish
export const isLessonDay = (day, schedule) => {
    const date = moment(`${moment().year()}-${moment().month() + 1}-${day}`, 'YYYY-MM-DD');
    return schedule === 'evenDays' ? date.date() % 2 === 0 : date.date() % 2 !== 0;
};

const LessonSchedule = React.memo(({ id, group, actionsWidth, handleSlideRight, handleLessonClick }) => {
    const tableRef = useRef(null);

    // Fetch lessons from backend
    const { data: lessons = [], isLoading, error } = useGetAllGroupsQuery(group?.groupaId, {
        skip: !group?.groupaId,
        pollingInterval: 60000,
    });
    const [createLessonReview] = useUpdateGroupMutation();

    // Find selected lesson (state: true)
    const selectedLesson = useMemo(() => lessons.find(lesson => lesson.state) || null, [lessons]);

    // Handle errors
    if (error) {
        message.error('Darslarni yuklashda xatolik yuz berdi!');
        console.error('Lessons fetch error:', error);
    }



    // Handle lesson click
    const onLessonClick = useCallback(async (lesson, index) => {
        try {

            const data = {
                lessonName: lesson.lessonName,
                description: lesson.description,
                homework: lesson.homework,
                level: lesson.level,
                step: lesson.step,
                groupaId: id
            }
            await createLessonReview(data).unwrap();
            if (tableRef.current) {
                const row = tableRef.current.querySelector(`tr:nth-child(${index + 1})`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            handleLessonClick?.(lesson);
        } catch (error) {
            message.error('Dars tanlashda xatolik yuz berdi!');
            console.error('Update lesson state error:', error);
        }
    }, [handleLessonClick, createLessonReview, group]);

    return (
        <div
            className="attendance-actions"
            style={{ width: `${actionsWidth}%`, transition: 'width 0.3s ease-in-out' }}
        >
            <div style={{ padding: "0 30px" }} className="resize-handle">
                <h2 style={{ textAlign: "center" }} className="header-title">Darslar Rejasi (Daraja: {group?.level}, Bosqich: {group?.step})</h2>

                <button
                    onClick={handleSlideRight}
                    className="btnChevronLeft"
                    disabled={actionsWidth >= 80}
                    aria-label="Expand actions by 10%"
                >
                    <FaAnglesLeft />
                </button>

            </div>
            <div className="table-container" ref={tableRef}>
                {isLoading ? (
                    <div className="loading">Yuklanmoqda...</div>
                ) : (
                    <table className="schedule-table">
                        <thead>
                            <tr className="table-header">
                                <th style={{ width: "7%", textAlign: "center" }} className="table-cell">№</th>
                                <th className="table-cell">Dars Nomi</th>
                                <th className="table-cell">Mavzu</th>
                                <th className="table-cell">Uyga Vazifa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group?.lessons?.map((lesson, index) => (
                                <tr
                                    key={index}
                                    className={`schedule-row ${selectedLesson?._id === lesson._id ? 'selected-lesson' : ''}`}
                                    onClick={() => onLessonClick(lesson, index + 1)}
                                    aria-label={`Select lesson ${lesson.lessonNumber}`}
                                >
                                    <td style={{ textAlign: "center" }} className="table-cell">{index + 1}</td>
                                    <td className="table-cell">{lesson.lessonName}</td>
                                    <td className="table-cell">{lesson.description}</td>
                                    <td className="table-cell">{lesson.homework}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
});

export default LessonSchedule;







