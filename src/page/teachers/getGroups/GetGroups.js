import React, { useState, useMemo } from 'react';
import { Button, Empty, Input } from 'antd';
import { FaUsers, FaWeebly } from 'react-icons/fa';
import { IoTimeOutline } from 'react-icons/io5';
import { BsDoorOpen } from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa'; // O'qituvchilar uchun ikona
import { MdOutlineSchool } from 'react-icons/md'; // Daraja uchun ikona
import { AiOutlineStepForward } from 'react-icons/ai'; // Bosqich uchun ikona
import { Link } from 'react-router-dom';
import { useGetGroupsByTeacherQuery } from '../../../context/groupsApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import image1 from '../../../assets/eng.jpg';
import image2 from '../../../assets/eng1.jpg';
import image3 from '../../../assets/eng2.png';
import image4 from '../../../assets/eng3.jpg';
import image5 from '../../../assets/eng4.jpg';
import './style.css';
import '../../reception/groups/activeGroups/style/style.css';
import { capitalizeFirstLetter } from '../../../hook/CapitalizeFirstLitter'; // Birinchi harfni katta qilish funksiyasi

const { Search } = Input;

const GetGroups = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const teacherId = localStorage.getItem('teacherId');
    const { data: registrations = [], isLoading, error, refetch } = useGetGroupsByTeacherQuery(teacherId);

    // Joriy vaqtni olish (O'zbekiston vaqti, UTC+5)
    const currentTime = new Date();

    // Rasmlar ro'yxati
    const images = [image1, image2, image3, image4, image5];

    // Ketma-ket rasm tanlash funksiyasi
    const getSequentialImage = (index) => {
        const sequentialIndex = index % images.length; // Tsiklik tanlash
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
                return schedule || 'N/A';
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

    // Filtlangan ma'lumotlarni hisoblash
    const filteredData = useMemo(() => {
        if (!registrations.length) return [];

        return registrations.filter((group) => {
            const matchesSearch =
                group.roomNumber.toString().includes(searchTerm) ||
                group.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                group.lessonTime.includes(searchTerm) ||
                group.teachers.some((teacher) => teacher.toLowerCase().includes(searchTerm.toLowerCase())) ||
                group.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.level?.toLowerCase().includes(searchTerm.toLowerCase()); // Darajani qidiruvga qo'shish

            return matchesSearch;
        });
    }, [registrations, searchTerm]);

    // Yuklanayotgan bo'lsa, spinner ko'rsatish
    if (isLoading) return <LoadingSpinner />;

    // Xatolik bo'lsa, xato xabarini ko'rsatish
    if (error) {
        return (
            <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
                <Empty description="Ma'lumot olishda xatolik yuz berdi" />
                <Button onClick={refetch} type="primary" style={{ marginTop: '20px' }}>
                    Qayta urinish
                </Button>
            </div>
        );
    }

    return (
        <div className="table-groups">
            <div className="reach-students-box">
                <div className="reach-students" style={{ display: "flex", gap: "10px" }}>
                    <Search
                        placeholder="Qidirish..."
                        onSearch={setSearchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%" }}
                        size="large"
                    />
                </div>
            </div>

            <div className="site-card-border-less">
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
                                {/* O'qituvchilar ikona bilan */}
                                <div className="iconBox">
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
                                        <FaUsers /> {lesson?.studentsLength}
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
        </div>
    );
};

export default GetGroups;