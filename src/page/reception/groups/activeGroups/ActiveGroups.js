import React from 'react';
import { Link } from 'react-router-dom';
import image1 from '../../../../assets/eng.jpg';
import image2 from '../../../../assets/eng1.jpg';
import image3 from '../../../../assets/eng2.png';
import image4 from '../../../../assets/eng3.jpg';
import image5 from '../../../../assets/eng4.jpg';
import { FaUsers } from "react-icons/fa";
import { FaWeebly } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import { BsDoorOpen } from "react-icons/bs";
import { MdOutlineSchool } from "react-icons/md"; // Daraja uchun ikona
import { AiOutlineStepForward } from "react-icons/ai"; // Bosqich uchun ikona
import { FaChalkboardTeacher } from "react-icons/fa"; // O'qituvchi ikonasini import qilish
import './style/style.css';
import { Empty } from 'antd';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { capitalizeFirstLetter } from '../../../../hook/CapitalizeFirstLitter'; // Birinchi harfni katta qilish funksiyasi

const GroupInfoComponent = ({ filteredData, isLoading }) => {
    // Joriy vaqtni olish (O'zbekiston vaqti, UTC+5)
    const currentTime = new Date();

    // Rasmlar ro'yxati
    const images = [image1, image2, image3, image4, image5];

    // Ketma-ket rasm tanlash funksiyasi
    const getSequentialImage = (index) => {
        // Indeksni rasmlar soniga bo'lib, qoldiqni olish (tsikl hosil qilish)
        const sequentialIndex = index % images.length;
        return images[sequentialIndex];
    };

    // Jadvalni matn shaklida ko'rsatish funksiyasi
    const getScheduleText = (schedule) => {
        switch (schedule) {
            case 'oddDays':
                return 'D,CH,J'; // Toq kunlar
            case 'evenDays':
                return 'S,P,SH'; // Juft kunlar
            case 'allDays':
                return 'Har kuni'; // Har kuni
            default:
                return schedule;
        }
    };

    // Dars vaqtini solishtirish va rangni aniqlash funksiyasi
    const getLessonColor = (lessonTime) => {
        if (!lessonTime) return 'red'; // Agar vaqt bo'lmasa, qizil rang

        // lessonTime formatini bo'lib olish (masalan, "13:30-15:30")
        const [startTime, endTime] = lessonTime.split('-');
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Joriy soat va daqiqani olish
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        // Vaqtni daqiqaga aylantirish (solishtirish uchun)
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;
        const currentTotalMinutes = currentHour * 60 + currentMinute;

        // Dars vaqti hozirgi vaqt ichida bo'lsa, yashil rang, aks holda qizil
        return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes
            ? 'green'
            : 'red';
    };

    // Yuklanayotgan bo'lsa, spinner ko'rsatish
    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="site-card-border-less">
            {/* Agar ma'lumot bo'lmasa, bo'sh holatni ko'rsatish */}
            {filteredData?.length === 0 ? (
                <div style={{ width: "100%", height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Empty description="Ma'lumot yo'q" />
                </div>
            ) : (
                filteredData?.map((lesson, inx) => (
                    <div key={inx} className="boxGroups">
                        {/* Yuqori chiziq rangi dars vaqtiga qarab o'zgaradi */}
                        <div className="top-bar" style={{ backgroundColor: getLessonColor(lesson?.lessonTime) }}></div>
                        <div style={{ width: "15px", height: "15px" }}></div>
                        <div className="content">
                            {/* Ketma-ket rasm tanlash */}
                            <img src={getSequentialImage(inx)} alt="Dars rasmi" />
                            <strong>{lesson.subjects}</strong>
                            <div style={{ margin: "4px 0 8px 0" }} className="iconBox">
                                <FaChalkboardTeacher /> {lesson.teachers}
                            </div>
                            <div className="length_students">
                                <div className="iconBox">
                                    <FaWeebly /> {getScheduleText(lesson?.schedule)}
                                </div>
                                <div className="lineColumn">|</div>
                                <div className="iconBox">
                                    <IoTimeOutline /> {lesson?.lessonTime}
                                </div>
                            </div>
                            <div className="length_students">
                                <div className="iconBox">
                                    <FaUsers /> {lesson?.students}
                                </div>
                                <div className="lineColumn">|</div>
                                <div className="iconBox">
                                    <BsDoorOpen /> {lesson?.roomNumber}
                                </div>
                                <div className="lineColumn">|</div>
                                <div className="iconBox">
                                    <MdOutlineSchool /> {capitalizeFirstLetter(lesson?.level || 'beginner')}
                                </div>
                            </div>
                            <div className="length_students">
                                <div className="iconBox">
                                    <AiOutlineStepForward /> Bosqich {lesson?.step || 1}
                                </div>
                                <div className="lineColumn">|</div>
                                <Link to={`/Students/${lesson._id}`}>
                                    Kirish
                                </Link>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default GroupInfoComponent;