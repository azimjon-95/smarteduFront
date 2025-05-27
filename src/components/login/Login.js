import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import "./style.css";
import images from './images/1.png';
import axios from "../../api";

function Login({ setIsLoggedIn }) {
    const { register, handleSubmit, reset, setError, clearErrors, setValue, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false); // Checkbox state

    useEffect(() => {
        const admin = localStorage.getItem("admin");
        const savedUsername = localStorage.getItem("savedUsername");

        if (admin) {
            const routes = {
                owner: "/reports",
                teacher: "/groups"
            };
            navigate(routes[admin]);
        }

        if (savedUsername) {
            setValue("username", savedUsername); // Pre-fill username
            setRememberMe(true); // Check the checkbox
        }
    }, [navigate, setValue]);

    const onSubmit = async (data) => {
        if (!data.username || !data.password) {
            if (!data.username) {
                setError("username", { type: "manual", message: "Iltimos foydalanuvchi nomini kiriting" });
            }
            if (!data.password) {
                setError("password", { type: "manual", message: "Iltimos parolni kiriting" });
            }
            setTimeout(() => {
                clearErrors();
            }, 2000);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/teacher/signin", data);
            if (res?.data?.token) {
                localStorage.setItem("token", res?.data?.token);
                localStorage.setItem("teacherType", res?.data?.teacher.teacherType);
                localStorage.setItem("teacherId", res?.data?.teacher._id);

                // Save username if "Meni eslab qol" is checked
                if (rememberMe) {
                    localStorage.setItem("savedUsername", data.username);
                } else {
                    localStorage.removeItem("savedUsername");
                }

                setIsLoggedIn(true);
                message.success("Tizimga kirish muvaffaqiyatli yakunlandi!");
                navigate(res?.data?.teacher.teacherType === "teacher" ? "/groups" : "/reports");
            } else {
                message.error("Kirishda xatolik yuz berdi");
            }
        } catch (error) {
            message.error("Kirishda xatolik yuz berdi");
            console.error(error);
        } finally {
            setLoading(false);
        }

        reset();
    };

    return (
        <div className="containerMobile">
            <div className="row border bg-white shadow box-area">
                <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box"
                    style={{ background: '#103cbe' }}>
                    <div className="featured-image mb-3">
                        <img src={images} className="img-fluid" style={{ width: '250px' }} alt="Featured" />
                    </div>
                    <p className="text-white fs-2" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 600 }}>SmartEdu</p>
                    <small id="text-mobile" className="text-white text-wrap text-center" style={{ width: '17rem', fontFamily: 'Courier New, Courier, monospace' }}>
                        Ta'limni raqamlashtirishda yangi davrga qadam qo'ying!
                    </small>
                </div>

                <div className="col-md-6 right-box">
                    <form onSubmit={handleSubmit(onSubmit)} className="row align-items-center">
                        <div className="header-text mb-4">
                            <h2>SmartEdu</h2>
                            <p>Tizimga kirish</p>
                        </div>
                        <div className="input-group mb-3">
                            <input
                                id={`${errors.username ? 'error' : ''}`}
                                type="text"
                                className="form-control form-control-lg bg-light fs-6"
                                placeholder={errors.username ? errors.username.message : "Foydalanuvchi nomi"}
                                {...register("username")}
                            />
                        </div>
                        <div className="input-group mb-1">
                            <input
                                id={`${errors.password ? 'error' : ''}`}
                                type="password"
                                className="form-control form-control-lg bg-light fs-6"
                                placeholder={errors.password ? errors.password.message : "Parol"}
                                {...register("password")}
                            />
                        </div>
                        <div className="input-group mb-5 d-flex justify-content-between">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="formCheck"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="formCheck" className="form-check-label text-secondary">
                                    <small>Meni eslab qol</small>
                                </label>
                            </div>
                            <div className="forgot">
                                <small>
                                    <a href="/forgot-password">Parolni unutdingizmi?</a>
                                </small>
                            </div>
                        </div>
                        <div className="input-group mb-3">
                            <button className="btn btn-lg btn-primary w-100 fs-6" disabled={loading}>
                                {loading ? "Yuklanmoqda..." : "Kirish"}
                            </button>
                        </div>
                        <div className="input-group mb-3">
                            <button className="btn btn-lg btn-light w-100 fs-6">
                                <small></small>
                            </button>
                        </div>
                        <div className="row"></div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;