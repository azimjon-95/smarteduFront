import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Space, Layout, Menu, Button, Popover, message } from 'antd'; // Import message from antd
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GiTakeMyMoney } from "react-icons/gi";
import {
    DollarOutlined,
    MenuFoldOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons';
import { LiaAddressCardSolid } from "react-icons/lia";
import { useGetBalansQuery } from '../../context/balansApi.js';
import { useMarkAttendanceMutation } from '../../context/qrApi.js';
import logo from '../../assets/logo.png';
import collapsedLogo from '../../assets/collapsedLogo.jpg';
import './style.css';
import Snowfall from '../snowFall/Snowfall';
import { NumberFormat } from '../../hook/NumberFormat.js';

const { Sider } = Layout;

const CustomLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState(localStorage.getItem('selectedMenuKey') || '1');
    const [collapsed, setCollapsed] = useState(false);
    const { data: balans, isLoading, error } = useGetBalansQuery();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeItem, setActiveItem] = useState(null);

    //=============================================
    const [markAttendance, { isLoading: loadingQr }] = useMarkAttendanceMutation();
    const inputRef = useRef(null);

    // Input maydoniga fokus qo‘yish
    // Ensure input is always focused
    useEffect(() => {
        const maintainFocus = () => {
            if (inputRef.current && document.activeElement !== inputRef.current) {
                inputRef.current.focus();
            }
        };

        // Initial focus
        maintainFocus();



        // Optional: Re-focus on click anywhere in the AppQr container
        const handleContainerClick = (e) => {
            if (inputRef.current && !loadingQr) {
                inputRef.current.focus();
            }
        };

        const qrContainer = document.querySelector('.AppQr');
        if (qrContainer) {
            qrContainer.addEventListener('click', handleContainerClick);
        }

        return () => {
            if (qrContainer) {
                qrContainer.removeEventListener('click', handleContainerClick);
            }
        };
    }, [loadingQr]);

    // QR skanerdan kelgan ma’lumotni qayta ishlash
    const handleInputChange = async (e) => {
        const studentId = e.target.value.trim();
        if (studentId) {
            try {
                const response = await markAttendance({ studentId }).unwrap();
                message.success(response.message); // Use Ant Design message for success
                e.target.value = ''; // Inputni tozalash
                inputRef.current.focus();
            } catch (err) {
                message.error(err.data?.message || 'Xatolik yuz berdi'); // Use Ant Design message for error
                e.target.value = '';
                inputRef.current.focus();
            }
        }
    };
    //=============================================

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const menuRef = useRef(null);

    useEffect(() => {
        const menu = menuRef.current;

        let isDown = false;
        let startX;
        let scrollLeft;

        const mouseDownHandler = (e) => {
            isDown = true;
            menu.classList.add('active');
            startX = e.pageX - menu.offsetLeft;
            scrollLeft = menu.scrollLeft;
        };

        const mouseLeaveHandler = () => {
            isDown = false;
            menu.classList.remove('active');
        };

        const mouseUpHandler = () => {
            isDown = false;
            menu.classList.remove('active');
        };

        const mouseMoveHandler = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - menu.offsetLeft;
            const walk = (x - startX) * 3; // Scroll-fast
            menu.scrollLeft = scrollLeft - walk;
        };

        const touchStartHandler = (e) => {
            isDown = true;
            menu.classList.add('active');
            startX = e.touches[0].pageX - menu.offsetLeft;
            scrollLeft = menu.scrollLeft;
        };

        const touchEndHandler = () => {
            isDown = false;
            menu.classList.remove('active');
        };

        const touchMoveHandler = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - menu.offsetLeft;
            const walk = (x - startX) * 3; // Scroll-fast
            menu.scrollLeft = scrollLeft - walk;
        };

        if (menu) {
            menu.addEventListener('mousedown', mouseDownHandler);
            menu.addEventListener('mouseleave', mouseLeaveHandler);
            menu.addEventListener('mouseup', mouseUpHandler);
            menu.addEventListener('mousemove', mouseMoveHandler);
            menu.addEventListener('touchstart', touchStartHandler);
            menu.addEventListener('touchend', touchEndHandler);
            menu.addEventListener('touchmove', touchMoveHandler);
        }

        return () => {
            if (menu) {
                menu.removeEventListener('mousedown', mouseDownHandler);
                menu.removeEventListener('mouseleave', mouseLeaveHandler);
                menu.removeEventListener('mouseup', mouseUpHandler);
                menu.removeEventListener('mousemove', mouseMoveHandler);
                menu.removeEventListener('touchstart', touchStartHandler);
                menu.removeEventListener('touchend', touchEndHandler);
                menu.removeEventListener('touchmove', touchMoveHandler);
            }
        };
    }, []);

    useEffect(() => {
        const pathnameToKeyMap = {
            '/reports': '1',
            '/createCards': '2',
            '/getTeacher': '3',
            '/payController': '4',
            '/certificate': '5',
            '/expenses': '6',
        };
        setSelectedKey(pathnameToKeyMap[location.pathname] || '1');
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        localStorage.removeItem("doctorMongoId");
        navigate("/login", { replace: true }); // Use replace to avoid adding to history
        window.location.href = "/login"; // Fallback
    };

    const content = (
        <div style={{ display: "flex", alignItems: "start", flexDirection: "column" }}>
            <Button style={{ color: "red", borderTop: ".5px solid #cfcfcf", borderRadius: '0px' }} type="link" icon={<LogoutOutlined />} onClick={handleLogout}>
                Chiqish
            </Button>
        </div>
    );

    const menuItems = [
        { key: '1', icon: <FileTextOutlined style={isMobile ? { fontSize: '22px' } : {}} />, label: <Link style={{ textDecoration: "none", color: "#b8b8b8" }} to="/reports">{isMobile ? "Qabul" : "Qabul Bo'limi"}</Link> },
        { key: '2', icon: <LiaAddressCardSolid style={isMobile ? { fontSize: '22px' } : {}} />, label: <Link style={{ textDecoration: "none", color: "#b8b8b8" }} to="/createCards">{isMobile ? "Guruhlar" : "Guruhlar"}</Link> },
        { key: '3', icon: <UserOutlined style={isMobile ? { fontSize: '22px' } : {}} />, label: <Link style={{ textDecoration: "none", color: "#b8b8b8" }} to="/getTeacher">{isMobile ? "Ustozlar" : "Ustozlar"}</Link> },
        { key: '4', icon: <DollarOutlined style={isMobile ? { fontSize: '22px' } : {}} />, label: <Link style={{ textDecoration: "none", color: "#b8b8b8" }} to="/payController">{isMobile ? "To'lov" : "To'lovlar"}</Link> },
    ];

    const handleClick = (item) => {
        setActiveItem(item);
    };

    const renderMobileMenuItems = (items) => {
        return items.map((item) => (
            <div
                key={item.key}
                onClick={() => handleClick(item)}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50px',
                    padding: "0 4px",
                    borderRadius: " 7px",
                    zIndex: 10,
                    backgroundColor: activeItem?.key === item.key ? 'dodgerblue' : '',
                    cursor: 'pointer',
                    color: activeItem?.key === item.key ? "#e9e9e9" : "",
                }}
                className="mobileBottom_menu"
            >
                <span>{item.icon}</span>
                <span style={{ fontSize: '13px', textDecoration: 'none' }}>{item.label}</span>
            </div >
        ));
    };

    const handleMenuClick = ({ key }) => {
        setSelectedKey(key);
        localStorage.setItem('selectedMenuKey', key);
    };

    useEffect(() => {
        const savedKey = localStorage.getItem('selectedMenuKey');
        if (savedKey) {
            setSelectedKey(savedKey);
        }
    }, []);

    return (
        <Layout style={{ minHeight: '100vh', overflow: "hidden", background: "#048e38" }}>
            <Sider trigger={null} collapsible collapsed={collapsed} className={`custom-sider ${collapsed ? 'ant-layout-sider-collapsed' : ''}`}>
                <div className="demo-logo-vertical" />
                <div style={{ overflow: "hidden" }} className={collapsed ? "mainLogoNone" : "mainLogo"}>
                    <Snowfall />
                    <img width={collapsed ? 45 : 190} src={collapsed ? collapsedLogo : logo} alt="Logo" />
                </div>
                <Menu
                    theme="dark"
                    selectedKeys={[selectedKey]}
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                />

                <div className="AppQr">
                    <input
                        type="text"
                        ref={inputRef}
                        placeholder="QR kodni skanerlang..."
                        onChange={handleInputChange}
                        disabled={loadingQr}
                    />
                </div>
            </Sider>

            <Layout className="site-layout">
                <div className="MainNavbar">
                    {!isMobile && (
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined style={{ fontSize: '22px' }} /> : <MenuFoldOutlined style={{ fontSize: '22px' }} />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '22px',
                                width: 64,
                                height: 64,
                                zIndex: 10
                            }}
                        />
                    )}
                    <Snowfall />
                    <Space className="Space_mobile" style={{ zIndex: 3 }} wrap size={16}>
                        <Link style={{ textDecoration: "none", color: "#333", zIndex: 3 }} to="/balans">
                            <div className="allBalans">
                                <div style={{ display: "flex", alignItems: "center", gap: "3px", justifyContent: "center", fontSize: '12px', lineHeight: "10px", textAlign: "center" }}><GiTakeMyMoney /> Balans</div>
                                {isLoading && <div>Yuklanmoqda...</div>}
                                {error && <div>Xatolik yuz berdi: {error.message}</div>}
                                {!isLoading && !error && (
                                    <>
                                        {balans?.map((item) => NumberFormat(item.balans))} so'm
                                    </>
                                )}
                            </div>
                        </Link>
                        <Popover content={content} trigger="click">
                            <Avatar size="large" icon={<UserOutlined />} />
                        </Popover>
                    </Space>
                </div>
                <div className='maincartIn'>
                    <Outlet />
                </div>
            </Layout>

            {isMobile && (
                <div
                    ref={menuRef}
                    className='MenuMobile menu-horizontal'>
                    {renderMobileMenuItems(menuItems)}
                </div>
            )}
        </Layout>
    );
};

export default CustomLayout;
