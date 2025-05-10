import React, { useState, useMemo } from 'react';
import { Button, Input, message, Spin, Alert, Modal, Form, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { useGetStudentQuery } from '../../../context/studentsApi';
import { useGetAllTeachersQuery, useUpdateTeacherMutation, useDeleteTeacherMutation } from '../../../context/teacherApi';
import './teachersTable.css';
import '../../../components/table-Css/css/main.min.css';
import '../../../components/table-Css/css/bulma.min.css';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { FaInfoCircle } from 'react-icons/fa';
import { capitalizeFirstLetter } from '../../../hook/CapitalizeFirstLitter';
import { useGetAllRegistrationsQuery } from '../../../context/groupsApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { PhoneNumberFormat } from '../../../hook/NumberFormat';

const TeachersTable = () => {
    const { data: students } = useGetStudentQuery();
    const { data: registrations } = useGetAllRegistrationsQuery();
    const { data: teacherData, error, isLoading, refetch } = useGetAllTeachersQuery();
    const [updateTeacher] = useUpdateTeacherMutation();
    const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingTeacher] = useState(null);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const teachers = teacherData?.filter((i) => i.teacherType === "teacher");

    const studentCounts = useMemo(() => {
        const counts = new Map();
        students?.forEach(student => {
            const teacherIds = JSON.parse(student.teacherId);
            teacherIds.forEach(id => {
                counts.set(id, (counts.get(id) || 0) + 1);
            });
        });
        return counts;
    }, [students]);

    const groupsCounts = useMemo(() => {
        const counts = new Map();
        registrations?.registrations?.forEach(student => {
            const teacherIds = JSON.parse(student.teacherId);
            teacherIds.forEach(id => {
                counts.set(id, (counts.get(id) || 0) + 1);
            });
        });
        return counts;
    }, [registrations]);

    const handleEditSubmit = async (values) => {
        try {
            await updateTeacher({ id: editingTeacher._id, ...values });
            message.success('O‘qituvchi muvaffaqiyatli yangilandi');
            setIsEditModalVisible(false);
            refetch();
        } catch (error) {
            message.error('O‘qituvchini yangilashda xato yuz berdi');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTeacher(teacherToDelete?._id).unwrap();
            message.success('O‘qituvchi muvaffaqiyatli o‘chirildi');
            setDeleteModalVisible(false);
            setTeacherToDelete(null);
            refetch(); // Refetch to update the table
        } catch (error) {
            message.error('O‘qituvchini o‘chirishda xato yuz berdi');
            console.error('Delete error:', error);
        }
    };

    const showDeleteConfirm = (teacher) => {
        setTeacherToDelete(teacher);
        setDeleteModalVisible(true);
    };

    const onSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = teachers?.filter(s =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.middleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div className='teacher_headre'>
                <Input
                    placeholder="Qidirish..."
                    onChange={onSearch}
                    style={{ width: "60%", margin: "auto" }}
                />
                <Link to="/createTeacher">
                    <Button><UserAddOutlined /></Button>
                </Link>
            </div>

            <div className="b-table">
                <div className="table-wrapper has-mobile-cards">
                    <table className="table is-fullwidth is-striped is-hoverable is-fullwidth">
                        <thead>
                            <tr>
                                <th>FIO</th>
                                <th>Telefon</th>
                                <th>Fani</th>
                                <th>Gruhlar soni</th>
                                <th>O'quvchilar soni</th>
                                <th>Batafsil</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData?.map((item, index) => (
                                <tr key={index}>
                                    <td data-label="FIO">{capitalizeFirstLetter(item.firstName)} {item.lastName}</td>
                                    <td data-label="Telefon">{PhoneNumberFormat(item.phone)}</td>
                                    <td data-label="Fani">{capitalizeFirstLetter(item.subject)}</td>
                                    <td data-label="Gruhlar soni">{groupsCounts.get(item._id) || 0}</td>
                                    <td data-label="O'quvchilar soni">{studentCounts.get(item._id) || 0}</td>
                                    <td data-label="Batafsil">
                                        <Link to={`/single_page/${item._id}`} className="icon-link">
                                            <FaInfoCircle />
                                        </Link>
                                        <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => showDeleteConfirm(item)}
                                            loading={isDeleting && teacherToDelete?._id === item._id}
                                            style={{ marginLeft: 8 }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                title="O‘qituvchini tahrirlash"
                visible={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                onOk={() => {
                    form
                        .validateFields()
                        .then(values => {
                            handleEditSubmit(values);
                        })
                        .catch(info => {
                            console.log('Tasdiqlashda xato:', info);
                        });
                }}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="Ism"
                                rules={[{ required: true, message: 'Iltimos, ismingizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="middleName"
                                label="Otasining ismi"
                                rules={[{ required: true, message: 'Iltimos, otangizning ismini kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Familiya"
                                rules={[{ required: true, message: 'Iltimos, familiyangizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dateOfBirth"
                                label="Tug‘ilgan sana"
                                rules={[{ required: true, message: 'Iltimos, tug‘ilgan sanangizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="gender"
                                label="Jinsi"
                                rules={[{ required: true, message: 'Iltimos, jinsingizni tanlang' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="nationality"
                                label="Millati"
                                rules={[{ required: true, message: 'Iltimos, millatingizni tanlang' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="maritalStatus"
                                label="Oilaviy holati"
                                rules={[{ required: true, message: 'Iltimos, oilaviy holatingizni tanlang' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Manzili"
                                rules={[{ required: true, message: 'Iltimos, manzilingizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Telefon"
                                rules={[{ required: true, message: 'Iltimos, telefon raqamingizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Elektron pochta"
                                rules={[{ required: true, message: 'Iltimos, elektron pochtangizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="subject"
                                label="Fani"
                                rules={[{ required: true, message: 'Iltimos, faningizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="salary"
                                label="Maoshi (Foizda)"
                                rules={[{ required: true, message: 'Iltimos, maoshingizni kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Login"
                                rules={[{ required: true, message: 'Iltimos, login kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Parol"
                                rules={[{ required: true, message: 'Iltimos, parol kiriting' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title="O‘qituvchini o‘chirish"
                visible={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setTeacherToDelete(null);
                }}
                okText="O‘chirish"
                cancelText="Bekor qilish"
                okButtonProps={{ danger: true }}
                confirmLoading={isDeleting}
            >
                <p>Haqiqatan ham ushbu o‘qituvchini o‘chirmoqchimisiz?</p>
            </Modal>
        </>
    );
};

export default TeachersTable;