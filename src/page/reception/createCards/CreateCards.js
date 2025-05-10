import React, { useState, useMemo } from 'react';
import { Tabs, Button, Radio, Table, Form, Input, Select, message, Popconfirm, Modal } from 'antd';
import { MdOutlineClear } from 'react-icons/md';
import { FaSyncAlt } from 'react-icons/fa';
import { EditOutlined } from '@ant-design/icons';
import {
    useUpdateTeachersMutation,
    useCreateRegistrationMutation,
    useGetAllRegistrationsQuery,
    useDeleteRegistrationMutation,
} from '../../../context/groupsApi';
import { useGetAllTeachersQuery } from '../../../context/teacherApi';
import { subjects } from '../../../utils/subjects';
import { capitalizeFirstLetter } from '../../../hook/CapitalizeFirstLitter';
import LoadingSpinner from '../../../components/LoadingSpinner';
import GroupInfoComponent from '../groups/activeGroups/ActiveGroups';
import './style.css';

const { Option, OptGroup } = Select;
const { Search } = Input;

// Constants
const LESSON_TIMES = ['08:00-10:00', '10:00-12:00', '13:30-15:30', '15:30-17:30'];
const SCHEDULES = [
    { value: 'oddDays', label: 'Toq kunlari' },
    { value: 'evenDays', label: 'Juft kunlari' },
    { value: 'allDays', label: 'Har kunlari' },
];
const STATUS_MAP = {
    new: "O'quvchilar yig'ilmoqda",
    active: 'Aktiv',
    close: 'Gruppa yopilgan',
};

const CreateCards = () => {
    const [form] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isActiveView, setIsActiveView] = useState(false);
    const [rotateKey, setRotateKey] = useState(0);
    const [selectedTeacher, setSelectedTeacher] = useState('Barcha ustozlar');
    const [formData, setFormData] = useState({
        roomNumber: '',
        lessonTime: '',
        subject: '',
        teachers: [],
        mothlyPay: '',
        schedule: '',
    });

    // API Queries and Mutations
    const { data: teachers = [] } = useGetAllTeachersQuery();
    const { data: registrations, isLoading, error, refetch } = useGetAllRegistrationsQuery();
    const [createRegistration] = useCreateRegistrationMutation();
    const [deleteRegistration] = useDeleteRegistrationMutation();
    const [updateTeachers] = useUpdateTeachersMutation();

    // Memoized Data
    const teacherOptions = useMemo(
        () =>
            teachers.map((teacher) => ({
                value: teacher._id,
                label: `${capitalizeFirstLetter(teacher.subject)} (${capitalizeFirstLetter(teacher.firstName)} ${capitalizeFirstLetter(teacher.lastName)})`,
            })),
        [teachers]
    );

    const teacherNames = useMemo(
        () => Array.from(new Set(registrations?.registrations?.flatMap((s) => s.teachers)) || []),
        [registrations]
    );

    const filteredData = useMemo(() => {
        if (!registrations?.registrations) return [];
        return registrations.registrations.filter(
            (student) =>
                student.roomNumber.toString().includes(searchTerm) ||
                student.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                student.lessonTime.includes(searchTerm) ||
                student.teachers.some((teacher) => teacher.toLowerCase().includes(searchTerm.toLowerCase())) ||
                student.state.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [registrations, searchTerm]);

    const dataNew = useMemo(() => filteredData.filter((i) => i.state === 'new'), [filteredData]);
    const dataActive = useMemo(
        () =>
            selectedTeacher === 'Barcha ustozlar'
                ? filteredData.filter((i) => i.state === 'active')
                : filteredData.filter((i) => i.state === 'active' && i.teachers.includes(selectedTeacher)),
        [filteredData, selectedTeacher]
    );

    // Table Columns
    const columns = [
        { title: 'Xona raqami', dataIndex: 'roomNumber', key: 'roomNumber' },
        { title: 'Fan nomi', dataIndex: 'subjects', key: 'subjects' },
        { title: 'Oquvchilar soni', dataIndex: 'studentsLength', key: 'studentsLength' },
        { title: 'Dars vaqti', dataIndex: 'lessonTime', key: 'lessonTime' },
        {
            title: 'Ustoz',
            dataIndex: 'teachers',
            key: 'teachers',
            render: (teachers, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {teachers.join(', ')}
                    <Button size="small" onClick={() => handleUpdateTeachers(record)}>
                        <EditOutlined />
                    </Button>
                </div>
            ),
        },
        {
            title: 'Jadval',
            dataIndex: 'schedule',
            key: 'schedule',
            render: (schedule) => SCHEDULES.find((s) => s.value === schedule)?.label || schedule,
        },
        {
            title: 'Gruppa xolati',
            dataIndex: 'state',
            key: 'state',
            render: (state) => STATUS_MAP[state] || state,
        },
        {
            title: "O'chirish",
            key: 'delete',
            render: (_, record) => (
                <Popconfirm
                    title="Bu gruppani o'chirishni istaysizmi?"
                    onConfirm={() => handleDelete(record._id)}
                    okText="Ha"
                    cancelText="Yo'q"
                >
                    <Button type="primary" danger size="small">
                        O'chirish
                    </Button>
                </Popconfirm>
            ),
        },
        {
            title: 'Setting',
            key: 'setting',
            render: (_, record) => (
                <Popconfirm
                    title="Bu gruppani sozlashni istaysizmi?"
                    okText="Ha"
                    cancelText="Yo'q"
                >
                    <Button type="primary" size="small">
                        Setting
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    // Handlers
    const handleFormChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleFormSubmit = async () => {
        try {
            await form.validateFields();
            const chosenTeachersNames = teachers
                .filter((teacher) => formData.teachers.includes(teacher._id))
                .map((teacher) => `${capitalizeFirstLetter(teacher.firstName)} ${capitalizeFirstLetter(teacher.lastName)}`);

            await createRegistration({
                roomNumber: formData.roomNumber,
                lessonTime: formData.lessonTime,
                subjects: [formData.subject],
                teachers: chosenTeachersNames,
                teacherId: JSON.stringify(formData.teachers),
                state: 'new',
                schedule: formData.schedule,
                mothlyPay: Number(formData.mothlyPay),
            }).unwrap();

            message.success('Yangi gruppa ochildi');
            resetForm();
            refetch();
        } catch {
            message.error('Gruppa ochishda xatolik');
        }
    };

    const handleUpdateSubmit = async () => {
        try {
            const updatedTeachersNames = teachers
                .filter((teacher) => formData.teachers.includes(teacher._id))
                .map((teacher) => `${capitalizeFirstLetter(teacher.firstName)} ${capitalizeFirstLetter(teacher.lastName)}`);
            const updatedSubjects = teachers
                .filter((teacher) => formData.teachers.includes(teacher._id))
                .map((teacher) => capitalizeFirstLetter(teacher.subject));

            await updateTeachers({
                id: selectedGroup._id,
                body: {
                    ...selectedGroup,
                    subjects: updatedSubjects,
                    teachers: updatedTeachersNames,
                    teacherId: JSON.stringify(formData.teachers),
                },
            }).unwrap();

            message.success('Ustozlar yangilandi');
            setIsUpdateModalOpen(false);
            refetch();
        } catch {
            message.error('Ustozlarni yangilashda xatolik');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteRegistration(id).unwrap();
            message.success('Gruppa o‘chirildi');
            refetch();
        } catch {
            message.error('Gruppa o‘chirishda xatolik');
        }
    };

    const handleUpdateTeachers = (group) => {
        setSelectedGroup(group);
        setFormData((prev) => ({
            ...prev,
            teachers: group.teacherId ? JSON.parse(group.teacherId) : [],
        }));
        setIsUpdateModalOpen(true);
    };

    const resetForm = () => {
        setIsModalOpen(false);
        setFormData({
            roomNumber: '',
            lessonTime: '',
            subject: '',
            teachers: [],
            mothlyPay: '',
            schedule: '',
        });
        form.resetFields();
    };

    const handleToggleView = () => {
        setIsActiveView((prev) => !prev);
        setRotateKey((prev) => prev + 1);
    };

    // Render
    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="TableGrups">
            {/* Create Group Modal */}
            <div className={`OpenReg ${isModalOpen ? 'OpenRegAll' : ''}`}>
                <h2 style={{ textAlign: 'center' }}>Yangi gruppa ochish</h2>
                <Form form={form} onFinish={handleFormSubmit} layout="vertical" style={{ padding: 10 }}>
                    <Form.Item
                        name="roomNumber"
                        label="Xona raqami"
                        rules={[{ required: true, message: 'Xona raqamini kiriting!' }]}
                    >
                        <Input
                            placeholder="Xona raqami"
                            value={formData.roomNumber}
                            onChange={(e) => handleFormChange('roomNumber', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="lessonTime"
                        label="Dars vaqti"
                        rules={[{ required: true, message: 'Dars vaqtini tanlang!' }]}
                    >
                        <Select
                            placeholder="Dars vaqtini tanlang"
                            value={formData.lessonTime}
                            onChange={(value) => handleFormChange('lessonTime', value)}
                        >
                            {LESSON_TIMES.map((time) => (
                                <Option key={time} value={time}>
                                    {time}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="subject"
                        label="Fan"
                        rules={[{ required: true, message: 'Fanni tanlang!' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Fanni tanlang"
                            value={formData.subject}
                            onChange={(value) => handleFormChange('subject', value)}
                            filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
                        >
                            {subjects.map((group) => (
                                <OptGroup key={group.group} label={group.group}>
                                    {group.subjects.map((subject) =>
                                        typeof subject === 'string' ? (
                                            <Option key={subject} value={subject}>
                                                {subject}
                                            </Option>
                                        ) : (
                                            <OptGroup key={subject.group} label={subject.group}>
                                                {subject.subjects.map((sub) => (
                                                    <Option key={sub} value={sub}>
                                                        {sub}
                                                    </Option>
                                                ))}
                                            </OptGroup>
                                        )
                                    )}
                                </OptGroup>
                            ))}
                        </Select>
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Form.Item
                            style={{ flex: 1 }}
                            name="teachers"
                            label="Ustozlar"
                            rules={[{ required: true, message: 'Ustozlarni tanlang!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Ustozlarni tanlang"
                                value={formData.teachers}
                                onChange={(value) => handleFormChange('teachers', value)}
                                options={teacherOptions}
                            />
                        </Form.Item>

                        <Form.Item
                            style={{ flex: 1 }}
                            name="mothlyPay"
                            label="Oylik to‘lov"
                            rules={[{ required: true, message: 'To‘lovni kiriting!' }]}
                        >
                            <Input
                                placeholder="Kurs narxi"
                                type="number"
                                value={formData.mothlyPay}
                                onChange={(e) => handleFormChange('mothlyPay', e.target.value)}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="schedule"
                        label="Jadval"
                        rules={[{ required: true, message: 'Jadvalni tanlang!' }]}
                    >
                        <Radio.Group
                            options={SCHEDULES}
                            value={formData.schedule}
                            onChange={(e) => handleFormChange('schedule', e.target.value)}
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button type="primary" htmlType="submit" block>
                            Ro‘yxatga yozish
                        </Button>
                        <Button type="primary" danger onClick={resetForm}>
                            <MdOutlineClear style={{ fontSize: 18 }} />
                        </Button>
                    </div>
                </Form>
            </div>

            {/* Main Content */}
            <div className="reachStudents_box">
                <div className="reachStudents">
                    <div className="reachStudentsBox">
                        <Search
                            placeholder="Qidirish..."
                            onSearch={setSearchTerm}
                            style={{ width: '60%' }}
                            size="large"
                        />
                        <Select
                            style={{ width: 200 }}
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            size="large"
                            showSearch
                            filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
                        >
                            <Option value="Barcha ustozlar">Barcha ustozlar</Option>
                            {teacherNames.map((name) => (
                                <Option key={name} value={name}>
                                    {name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <Button
                        className={`btn-change ${isActiveView ? 'active' : ''}`}
                        onClick={handleToggleView}
                        icon={<FaSyncAlt className={`icon-change ${rotateKey > 0 ? 'rotate' : ''}`} />}
                    />
                </div>

                {isActiveView ? (
                    <Tabs tabBarExtraContent={<Button onClick={() => setIsModalOpen(true)}>Gruppa ochish</Button>}>
                        <Tabs.TabPane tab="Yangi gruppalar" key="new">
                            <Table
                                dataSource={dataNew}
                                columns={columns}
                                pagination={false}
                                size="small"
                                loading={isLoading}
                                bordered
                            />
                            {error && <div>Error fetching data</div>}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Aktiv gruppalar" key="active">
                            <Table
                                dataSource={dataActive}
                                columns={columns}
                                pagination={false}
                                size="small"
                                loading={isLoading}
                                bordered
                            />
                            {error && <div>Error fetching data</div>}
                        </Tabs.TabPane>
                    </Tabs>
                ) : (
                    <GroupInfoComponent isLoading={isLoading} filteredData={dataActive} />
                )}
            </div>

            {/* Update Teachers Modal */}
            <Modal
                title="Ustozlarni yangilash"
                open={isUpdateModalOpen}
                onCancel={() => setIsUpdateModalOpen(false)}
                footer={null}
            >
                <Form form={updateForm} onFinish={handleUpdateSubmit} layout="vertical">
                    <Form.Item name="teachers" label="Ustozlar" initialValue={formData.teachers}>
                        <Select
                            mode="multiple"
                            placeholder="Ustozlarni tanlang"
                            value={formData.teachers}
                            onChange={(value) => handleFormChange('teachers', value)}
                            options={teacherOptions}
                        />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button type="primary" htmlType="submit">
                            Yangilash
                        </Button>
                        <Button onClick={() => setIsUpdateModalOpen(false)}>Bekor qilish</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CreateCards;