import React, { useState, useCallback } from 'react';
import {
    Col,
    Button,
    notification,
    Input,
    message,
    Modal,
    Row,
    Table,
    DatePicker,
    Radio,
} from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import moment from 'moment';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
    useGetStudentQuery,
    useDeleteStudentMutation,
    useUpdateStudentMutation,
    useUpdateStudentsStateMutation,
} from '../../../context/studentsApi';
import {
    useGetAllRegistrationsQuery,
    useUpdateRegistrationMutation,
} from '../../../context/groupsApi';
import { PhoneNumberFormat } from '../../../hook/NumberFormat';
import './style.css';
import '../../../components/table-Css/css/main.min.css';
import '../../../components/table-Css/css/bulma.min.css';

const { Search } = Input;

const StudentList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    const { data: students = [] } = useGetStudentQuery();
    const { data: groups = {} } = useGetAllRegistrationsQuery();
    const [deleteStudent] = useDeleteStudentMutation();
    const [updateStudent] = useUpdateStudentMutation();
    const [updateRegistration] = useUpdateRegistrationMutation();
    const [updateStudentsState] = useUpdateStudentsStateMutation();

    const groupData = groups?.registrations?.find((group) => group._id === id);
    const filteredStudents = students
        ?.filter((student) => student.groupId === id)
        ?.filter((student) =>
            search
                ? [
                    student.firstName,
                    student.lastName,
                    student.studentPhoneNumber,
                    student.parentPhoneNumber,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(search.toLowerCase())
                : true
        ) || [];

    const handleBack = () => navigate(-1);

    const handleDelete = useCallback(
        async (record) => {
            const studentData = groups?.registrations?.find(
                (group) => group._id === record.groupId
            );
            Modal.confirm({
                title: 'Tasdiqlash',
                content: 'Siz haqiqatan ham ushbu talabani o\'chirmoqchimisiz?',
                okText: 'Ha',
                okType: 'danger',
                cancelText: 'Yo\'q',
                onOk: async () => {
                    try {
                        await deleteStudent(record._id).unwrap();
                        if (studentData) {
                            const updatedGroupData = {
                                ...studentData,
                                studentsLength: (studentData.studentsLength || 0) - 1,
                            };
                            await updateRegistration({
                                id: studentData._id,
                                body: updatedGroupData,
                            }).unwrap();
                        }
                        message.success('Talaba muvaffaqiyatli o\'chirildi');
                    } catch (error) {
                        message.error('Talabani o\'chirishda xatolik yuz berdi');
                        console.error(error);
                    }
                },
            });
        },
        [deleteStudent, updateRegistration, groups]
    );

    const handleUpdate = useCallback((record) => {
        setCurrentStudent(record);
        setIsModalVisible(true);
    }, []);

    const handleModalOk = useCallback(async () => {
        try {
            await updateStudent({ id: currentStudent._id, body: currentStudent }).unwrap();
            message.success('Talaba muvaffaqiyatli yangilandi');
            setIsModalVisible(false);
            setCurrentStudent(null);
        } catch (error) {
            message.error('Talabani yangilashda xatolik yuz berdi');
            console.error(error);
        }
    }, [currentStudent, updateStudent]);

    const handleModalCancel = useCallback(() => {
        setIsModalVisible(false);
        setCurrentStudent(null);
    }, []);

    const handleInputChange = useCallback((name, value) => {
        setCurrentStudent((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleActivateGroup = useCallback(async () => {
        try {
            // Update group state to active
            const registrationResponse = await updateRegistration({
                id: groupData?._id,
                body: { ...groupData, state: 'active' },
            }).unwrap();

            // Update students' state
            const studentsResponse = await updateStudentsState({
                groupId: groupData?._id,
            }).unwrap();

            // Display success message only if both requests succeed
            if (registrationResponse.success && studentsResponse.success) {
                notification.success({
                    message: 'Muvaffaqiyatli',
                    description: 'Guruh va talabalar holati muvaffaqiyatli yangilandi.',
                })
                navigate('/createCards');
            }
        } catch (error) {
            notification.error({
                message: 'Xatolik',
                description: 'Guruh yoki talabalarni yangilashda xatolik yuz berdi.',
            });
            console.error(error);
        }
    }, [groupData, updateRegistration, updateStudentsState, navigate]);
    const columns = [
        {
            title: 'ID',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Ism Familya',
            render: (record) => `${record.firstName} ${record.lastName}`,
        },
        {
            title: 'Yoshi',
            render: (record) => moment().diff(record.dateOfBirth, 'years'),
        },
        {
            title: 'Tel',
            render: (record) => PhoneNumberFormat(record.studentPhoneNumber),
        },
        {
            title: 'Ota-ona telefon raqami',
            render: (record) => PhoneNumberFormat(record.parentPhoneNumber),
        },
        {
            title: 'Harakatlar',
            render: (record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        onClick={() => handleUpdate(record)}
                        type="primary"
                        size="small"
                    >
                        Yangilash
                    </Button>
                    <Button
                        onClick={() => handleDelete(record)}
                        type="danger"
                        size="small"
                    >
                        O'chirish
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '16px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px',
                }}
            >
                <Button onClick={handleBack} type="primary">
                    <IoArrowBackOutline />
                </Button>
                <Search
                    placeholder="Qidirish..."
                    onSearch={setSearch}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '60%' }}
                />
                <Button onClick={handleActivateGroup} type="primary">
                    Darsni boshlash
                </Button>
                <Link to={`/register/${id}`}>
                    <Button type="primary">Qabul</Button>
                </Link>
            </div>

            <Table
                columns={columns}
                dataSource={filteredStudents}
                rowKey={(record) => record._id}
                pagination={false}
                bordered
            />

            <Modal
                title="Talaba ma'lumotlarini yangilash"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Saqlash"
                cancelText="Bekor qilish"
            >
                {currentStudent && (
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Input
                                name="firstName"
                                placeholder="Ism"
                                value={currentStudent.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                            />
                        </Col>
                        <Col span={12}>
                            <Input
                                name="lastName"
                                placeholder="Familiya"
                                value={currentStudent.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                            />
                        </Col>
                        <Col span={12}>
                            <Input
                                name="middleName"
                                placeholder="Otasining ismi"
                                value={currentStudent.middleName}
                                onChange={(e) => handleInputChange('middleName', e.target.value)}
                            />
                        </Col>
                        <Col span={12}>
                            <DatePicker
                                name="dateOfBirth"
                                placeholder="Tug'ilgan sana"
                                value={
                                    currentStudent.dateOfBirth
                                        ? moment(currentStudent.dateOfBirth)
                                        : null
                                }
                                onChange={(date) =>
                                    handleInputChange(
                                        'dateOfBirth',
                                        date ? date.format('YYYY-MM-DD') : ''
                                    )
                                }
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col span={12}>
                            <PhoneInput
                                defaultCountry="uz"
                                value={currentStudent.studentPhoneNumber}
                                onChange={(phone) =>
                                    handleInputChange('studentPhoneNumber', phone)
                                }
                                inputStyle={{ width: '100%' }}
                                placeholder="+998 xx xxx-xx-xx"
                            />
                        </Col>
                        <Col span={12}>
                            <PhoneInput
                                defaultCountry="uz"
                                value={currentStudent.parentPhoneNumber}
                                onChange={(phone) =>
                                    handleInputChange('parentPhoneNumber', phone)
                                }
                                inputStyle={{ width: '100%' }}
                                placeholder="+998 xx xxx-xx-xx"
                            />
                        </Col>
                        <Col span={12}>
                            <Input
                                name="address"
                                placeholder="Manzil"
                                value={currentStudent.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                            />
                        </Col>
                        <Col span={12}>
                            <Radio.Group
                                name="gender"
                                value={currentStudent.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                            >
                                <Radio value="male">Erkak</Radio>
                                <Radio value="female">Ayol</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                )}
            </Modal>
        </div>
    );
};

export default StudentList;