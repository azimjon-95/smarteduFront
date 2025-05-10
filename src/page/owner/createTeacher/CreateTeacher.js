import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Row, Col, notification } from 'antd';
import { useCreateTeacherMutation } from '../../../context/teacherApi';
import { subjects } from '../../../utils/subjects';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css'; // Import styles for PhoneInput
import moment from 'moment'; // For date handling

const { Option, OptGroup } = Select;

const nationalityOptions = [
    'O‘zbekiston', 'Rossiya', 'AQSH', 'Birlashgan Qirollik',
    'Germaniya', 'Fransiya', 'Xitoy', 'Yaponiya', 'Boshqa'
];
const genderOptions = ['Erkak', 'Ayol'];
const maritalStatusOptions = [
    { value: 'Single', label: 'Yolg‘iz' },
    { value: 'Married', label: 'Turmush qurgan' },
    { value: 'Divorced', label: 'Ajrashgan' },
    { value: 'Widowed', label: 'Beva' }
];

const RegisterPage = () => {
    const navigate = useNavigate();
    const [createTeacher, { isLoading }] = useCreateTeacherMutation();
    const [form] = Form.useForm();
    const [phone, setPhone] = useState('');

    const onFinish = async (values) => {
        try {
            const formattedValues = {
                ...values,
                teacherType: 'owner',
                phone,
                dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'), // Format date
            };

            await createTeacher(formattedValues).unwrap();
            notification.success({
                message: 'Muvaffaqiyat',
                description: 'O‘qituvchi muvaffaqiyatli ro‘yxatdan o‘tdi',
            });

            form.resetFields();
            setPhone('');
            navigate('/getTeacher');
        } catch (error) {
            notification.error({
                message: 'Xatolik',
                description: 'Ro‘yxatdan o‘tishda xatolik yuz berdi',
            });
            console.error('Registration error:', error);
        }
    };

    const handleBack = () => navigate(-1);

    // Phone number validation
    const validatePhone = (_, value) => {
        if (!phone || phone.length < 12) {
            return Promise.reject('Iltimos, to‘g‘ri telefon raqamini kiriting');
        }
        return Promise.resolve();
    };

    return (
        <div style={{ padding: '24px', margin: '0 auto' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                scrollToFirstError
                disabled={isLoading}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="firstName"
                            label="Ism"
                            rules={[{ required: true, message: 'Ismingizni kiriting' }]}
                        >
                            <Input size="large" placeholder="Ism" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="middleName"
                            label="Otasining ismi"
                            rules={[{ required: true, message: 'Otangizning ismini kiriting' }]}
                        >
                            <Input size="large" placeholder="Otasining ismi" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="lastName"
                            label="Familiya"
                            rules={[{ required: true, message: 'Familiyangizni kiriting' }]}
                        >
                            <Input size="large" placeholder="Familiya" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="dateOfBirth"
                            label="Tug‘ilgan sana"
                            rules={[{ required: true, message: 'Tug‘ilgan sanani kiriting' }]}
                        >
                            <DatePicker size="large"
                                style={{ width: '100%' }}
                                disabledDate={(current) => current && current > moment().endOf('day')}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="gender"
                            label="Jinsi"
                            rules={[{ required: true, message: 'Jinsingizni tanlang' }]}
                        >
                            <Select size="large" placeholder="Jinsni tanlang">
                                {genderOptions.map(gender => (
                                    <Option key={gender} value={gender}>{gender}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="teachersId"
                            label="ID raqami"
                            rules={[
                                { required: true, message: 'ID raqamini kiriting' },
                                // Removed email validation as it seems incorrect for ID
                                { pattern: /^[A-Za-z0-9]+$/, message: 'Faqat harflar va raqamlar' }
                            ]}
                        >
                            <Input size="large" placeholder="ID raqami" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="phone"
                            label="Telefon raqami"
                            rules={[{ validator: validatePhone }]}
                        >
                            <PhoneInput
                                defaultCountry="uz"
                                value={phone}
                                onChange={setPhone}
                                style={{ width: '100%' }}
                                placeholder="+998 xx xxx-xx-xx"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="maritalStatus"
                            label="Oilaviy holat"
                            rules={[{ required: true, message: 'Oilaviy holatni tanlang' }]}
                        >
                            <Select size="large" placeholder="Oilaviy holatni tanlang">
                                {maritalStatusOptions.map(status => (
                                    <Option key={status.value} value={status.value}>
                                        {status.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="address"
                            label="Manzil"
                            rules={[{ required: true, message: 'Manzilni kiriting' }]}
                        >
                            <Input size="large" placeholder="Manzil" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="subject"
                            label="Fanni tanlang"
                            rules={[{ required: true, message: 'Fanni tanlang' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Fanni tanlang"
                                optionFilterProp="children"
                                size="large"
                                filterOption={(input, option) =>
                                    option.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {subjects.map((group) => (
                                    <OptGroup size="large" key={group.group} label={group.group}>
                                        {group.subjects.map((subject) => (
                                            typeof subject === 'string' ? (
                                                <Option size="large" key={subject} value={subject.toLowerCase().replace(/ /g, '-')}>
                                                    {subject}
                                                </Option>
                                            ) : (
                                                <OptGroup size="large" key={subject.group} label={subject.group}>
                                                    {subject.subjects.map((sub) => (
                                                        <Option size="large" key={sub} value={sub.toLowerCase().replace(/ /g, '-')}>
                                                            {sub}
                                                        </Option>
                                                    ))}
                                                </OptGroup>
                                            )
                                        ))}
                                    </OptGroup>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="nationality"
                            label="Millat"
                            rules={[{ required: true, message: 'Millatni tanlang' }]}
                        >
                            <Select size="large" placeholder="Millatni tanlang">
                                {nationalityOptions.map(nationality => (
                                    <Option size="large" key={nationality} value={nationality}>{nationality}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="username"
                            label="Foydalanuvchi nomi"
                            rules={[
                                { required: true, message: 'Foydalanuvchi nomini kiriting' },
                                { min: 3, message: 'Kamida 3 belgi bo‘lishi kerak' }
                            ]}
                        >
                            <Input size="large" placeholder="Foydalanuvchi nomi" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="salary"
                            label="Maosh (Foizda)"
                            rules={[
                                { required: true, message: 'Maoshni kiriting' },
                                {
                                    validator: (_, value) =>
                                        value && Number(value) >= 0 && Number(value) <= 100
                                            ? Promise.resolve()
                                            : Promise.reject('0 dan 100 gacha bo‘lgan foiz kiriting')
                                }
                            ]}
                        >
                            <Input size="large" type="number" placeholder="Maosh foizi (%)" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="password"
                            label="Parol"
                            rules={[
                                { required: true, message: 'Parolni kiriting' },
                                { min: 8, message: 'Parol kamida 8 belgi bo‘lishi kerak' }
                            ]}
                            hasFeedback
                        >
                            <Input.Password size="large" placeholder="Parol" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={16} md={8}>
                        <Form.Item
                            name="confirm"
                            label="Parolni tasdiqlang"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Parolni tasdiqlang' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        return !value || getFieldValue('password') === value
                                            ? Promise.resolve()
                                            : Promise.reject('Parollar mos kelmaydi');
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" placeholder="Parolni tasdiqlang" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[8, 8]} justify="end">
                    <Col>
                        <Button
                            type="primary"
                            danger
                            onClick={handleBack}
                            icon={<ArrowLeftOutlined />}
                        >
                            Orqaga
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            style={{ minWidth: '150px' }}
                        >
                            Ro‘yxatdan o‘tish
                        </Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default RegisterPage;