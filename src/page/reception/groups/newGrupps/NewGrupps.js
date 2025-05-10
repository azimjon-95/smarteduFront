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
import { IoMdPersonAdd } from "react-icons/io";
import './style.css';
import { Empty } from 'antd';
import LoadingSpinner from '../../../../components/LoadingSpinner'; // Importing the LoadingSpinner component


const NewGrupps = ({ filteredData, isLoading }) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8333', '#33FFF1', '#8333FF', '#33FF83', '#FF3333', '#33FFA5'];
    const images = [image1, image2, image3, image4, image5];

    const getRandomColor = () => {
        const randomIndex = Math.floor(Math.random() * colors?.length);
        return colors[randomIndex];
    };

    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * images?.length);
        return images[randomIndex];
    };

    const getScheduleText = (schedule) => {
        switch (schedule) {
            case 'oddDays':
                return 'D,CH,J';
            case 'evenDays':
                return 'S,P,SH';
            case 'allDays':
                return 'Har kuni';
            default:
                return schedule;
        }
    };


    if (isLoading) {
        return <LoadingSpinner />;
    }


    return (
        <div className="site-card-border-less">
            {filteredData?.length === 0 ? (
                <div style={{ width: "100%", height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Empty description="Ma'lumot yo'q" />
                </div>
            ) : (
                filteredData?.map((lesson, inx) => (
                    <div key={inx} className="boxGroups">
                        <div className="top-bar" style={{ backgroundColor: getRandomColor() }}></div>
                        <div className="top">
                            <Link to={`/register/${lesson._id}`}>
                                <IoMdPersonAdd className="fa-check-circle" />
                            </Link>
                        </div>
                        <div className="content">
                            <img src={getRandomImage()} alt="Lesson Image" />
                            <strong>{lesson.subjects}</strong>
                            <p>{lesson.teachers}</p>
                            <div className="length_students">
                                <div className="iconBox">
                                    <FaWeebly /> {getScheduleText(lesson?.schedule)}
                                </div>
                                <p>|</p>
                                <div className="iconBox">
                                    <IoTimeOutline />  {lesson?.lessonTime}
                                </div>
                            </div>
                            <div className="length_students">
                                <div className="iconBox">
                                    <FaUsers /> {lesson?.students}
                                </div>
                                <p>|</p>
                                <div className="iconBox">
                                    <BsDoorOpen />  {lesson?.roomNumber}
                                </div>
                                <p>|</p>
                                <Link to={`/studentList/${lesson._id}`}>
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

export default NewGrupps;
