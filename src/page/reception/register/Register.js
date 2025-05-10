import React, { useState } from 'react';
import { Form, Input, DatePicker, Button, Radio, Row, Col, notification } from 'antd';
import moment from 'moment';
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateStudentMutation } from '../../../context/studentsApi';
import { useGetAllRegistrationsQuery, useUpdateRegistrationMutation } from '../../../context/groupsApi';
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const { Item: FormItem } = Form;

const Register = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [phoneStudent, setPhoneStudent] = useState('');
    const [phoneParents, setPhoneParents] = useState('');

    const { data: groups = {} } = useGetAllRegistrationsQuery();
    const [createStudent, { isLoading }] = useCreateStudentMutation();
    const [updateRegistration] = useUpdateRegistrationMutation();

    const groupData = groups.registrations?.find((group) => group._id === id);

    const handleBack = () => navigate(-1);

    const handlePhoneChange = (phone, setPhone) => {
        if (phone.length === 13) setPhone(phone);
    };

    const onFinish = async (values) => {
        if (!groupData) {
            notification.error({
                message: 'Xatolik',
                description: 'Guruh maʼlumotlari topilmadi.',
            });
            return;
        }

        try {
            const studentData = {
                ...values,
                groupId: groupData._id,
                teacherId: groupData.teacherId,
                subject: groupData.subjects,
                payForLesson: groupData.mothlyPay,
                lessonTime: groupData.lessonTime,
                lessonDate: groupData.schedule,
                teacherFullName: groupData.teachers,
                studentPhoneNumber: phoneStudent,
                parentPhoneNumber: phoneParents,
            };

            await createStudent(studentData).unwrap();

            const updatedGroup = {
                ...groupData,
                studentsLength: groupData.studentsLength + 1,
            };

            await updateRegistration({ id: groupData._id, body: updatedGroup }).unwrap();

            notification.success({
                message: 'Muvaffaqiyatli',
                description: 'O‘quvchi muvaffaqiyatli ro‘yxatdan o‘tkazildi!',
            });

            form.resetFields();
            handleBack();
        } catch (error) {
            notification.error({
                message: 'Xatolik',
                description: 'O‘quvchini ro‘yxatdan o‘tkazishda xatolik yuz berdi.',
            });
        }
    };

    return (
        <div style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 16 }}>
                <Button onClick={handleBack} type="primary">
                    <IoArrowBackOutline />
                </Button>
                <h2>O'quvchilarni Qabul Qilish</h2>
            </div>

            <Form form={form} onFinish={onFinish} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <FormItem
                            name="firstName"
                            label="Ism"
                            rules={[{ required: true, message: 'Iltimos, ismingizni kiriting!' }]}
                        >
                            <Input placeholder="Ismingizni kiriting" />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="lastName"
                            label="Familiya"
                            rules={[{ required: true, message: 'Iltimos, familiyangizni kiriting!' }]}
                        >
                            <Input placeholder="Familiyangizni kiriting" />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="middleName"
                            label="Otasining ismi"
                            rules={[{ required: true, message: 'Iltimos, otangizning ismini kiriting!' }]}
                        >
                            <Input placeholder="Otasining ismini kiriting" />
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <FormItem
                            name="dateOfBirth"
                            label="Tug'ilgan sana"
                            rules={[{ required: true, message: "Iltimos, tug'ilgan sanani kiriting!" }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Tug'ilgan sanani tanlang"
                                disabledDate={(current) => current && current > moment().endOf('day')}
                            />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="address"
                            label="Manzil"
                            rules={[{ required: true, message: 'Iltimos, manzilingizni kiriting!' }]}
                        >
                            <Input placeholder="Manzilingizni kiriting" />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="studentPhoneNumber"
                            label="O'quvchining telefon raqami"
                            rules={[{ required: true, message: 'Iltimos, telefon raqamini kiriting!' }]}
                        >
                            <PhoneInput
                                defaultCountry="uz"
                                value={phoneStudent}
                                onChange={(phone) => handlePhoneChange(phone, setPhoneStudent)}
                                inputStyle={{ width: '100%' }}
                                placeholder="+998 xx xxx-xx-xx"
                            />
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <FormItem
                            name="parentPhoneNumber"
                            label="Ota-onasining telefon raqami"
                            rules={[{ required: true, message: 'Iltimos, telefon raqamini kiriting!' }]}
                        >
                            <PhoneInput
                                defaultCountry="uz"
                                value={phoneParents}
                                onChange={(phone) => handlePhoneChange(phone, setPhoneParents)}
                                inputStyle={{ width: '100%' }}
                                placeholder="+998 xx xxx-xx-xx"
                            />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            name="gender"
                            label="Jinsi"
                            rules={[{ required: true, message: 'Iltimos, jinsingizni tanlang!' }]}
                        >
                            <Radio.Group>
                                <Radio value="male">Erkak</Radio>
                                <Radio value="female">Ayol</Radio>
                            </Radio.Group>
                        </FormItem>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            style={{ width: '100%' }}
                        >
                            Yuborish
                        </Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default Register;