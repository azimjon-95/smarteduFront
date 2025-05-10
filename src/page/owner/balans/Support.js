import React, { useState } from "react";
import { useCreatePaymentMutation } from "../../../context/payStudentsApi";
import { Select, Input, Radio, Button, Card, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import "moment/locale/uz-latn";
import "./style.css";

moment.locale("uz-latn");
// TextArea
const { TextArea } = Input;

// Separate categories for income and expenses (15 each, education center specific)
const incomeCategories = [
    "O'quv kurslari to'lovi",
    "Yangi o'quvchi ro'yxatdan o'tishi",
    "Sertifikatlar sotuvi",
    "O'quv materiallari sotuvi",
    "Onlayn kurslar to'lovi",
    "Grant mablag'lari",
    "Homiy yordami",
    "Davlat subsidiyalari",
    "Treninglar uchun to'lov",
    "Konsultatsiya xizmatlari",
    "O'quv jihozlari ijarasi",
    "Imtihon to'lovlari",
    "Seminar ishtirok to'lovlari",
    "Franshiza to'lovlari",
    "Boshqa kirimlar"
];

const expenseCategories = [
    "O'qituvchilar maoshi",
    "Xodimlar maoshi",
    "Ofis ijarasi",
    "Kommunal to'lovlar",
    "O'quv materiallari xarajati",
    "Reklama xarajatlari",
    "Internet xizmatlari",
    "Telefon xarajatlari",
    "Transport xarajatlari",
    "Ofis jihozlari",
    "Ta'mirlash xarajatlari",
    "Soliq to'lovlari",
    "Bank xizmatlari",
    "Trening xarajatlari",
    "Boshqa xarajatlar"
];

const TechnicalSupport = () => {
    const [createPayment] = useCreatePaymentMutation();

    const [formData, setFormData] = useState({
        amount: "",
        category: incomeCategories[0],
        description: "",
        status: true, // Default to Kirim (income)
        month: moment().format("MMMM"),
    });

    // Format number with commas
    const formatNumber = (value) => {
        if (!value) return "";
        return Number(value).toLocaleString("uz-UZ");
    };

    // Parse formatted number back to raw value
    const parseNumber = (value) => {
        return value.replace(/\D/g, "");
    };

    const handleChange = (field, value) => {
        if (field === "status") {
            // Reset category when switching between Kirim/Chiqim
            setFormData((prev) => ({
                ...prev,
                status: value,
                category: value ? incomeCategories[0] : expenseCategories[0],
            }));
        } else if (field === "amount") {
            setFormData((prev) => ({ ...prev, [field]: parseNumber(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.category || !formData.amount) {
            message.error("Iltimos, kategoriya va summatni kiriting!");
            return;
        }

        try {
            const paymentData = {
                studentFees: formData.amount,
                category: formData.category,
                state: formData.status
            };
            await createPayment(paymentData).unwrap();

            message.success("Kirim/Chiqim muvaffaqiyatli qo'shildi!");
            setFormData({
                amount: "",
                category: formData.status ? incomeCategories[0] : expenseCategories[0],
                description: "",
                status: true,
                month: moment().format("MMMM"),
            });
        } catch (error) {
            message.error("Xatolik yuz berdi, iltimos qayta urinib ko'ring!");
        }
    };

    return (
        <div className="max-w-3xlmx-auto">
            <div className="flexjustify-between">
                <h3 className="textsemibold">Yangi Kirim/Chiqim Qo'shish</h3>
                {/* <Button
                    type="default"
                    onClick={toggleView}
                    icon={showTable ? <VscGitPullRequestGoToChanges /> : <GiArchiveRegister />}
                >
                    {showTable ? "Form" : "Jadval"}
                </Button> */}
            </div>

            <Card bordered={false} className="shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="gridGrid-cols-1">
                        <Select
                            placeholder="Kategoriya tanlang"
                            value={formData.category}
                            onChange={(val) => handleChange("category", val)}
                            className="custom-select"
                        >
                            {(formData.status ? incomeCategories : expenseCategories).map((cat) => (
                                <Select.Option key={cat} value={cat}>
                                    {cat}
                                </Select.Option>
                            ))}
                        </Select>

                        <Radio.Group
                            onChange={(e) => handleChange("status", e.target.value)}
                            value={formData.status}
                            className="custom-radio"
                        >
                            <Radio.Button value={true}>Kirim</Radio.Button>
                            <Radio.Button value={false}>Chiqim</Radio.Button>
                        </Radio.Group>
                    </div>

                    <Input
                        placeholder="Summa"
                        value={formatNumber(formData.amount)}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        className="custom-input"
                        suffix="UZS"
                    />

                    <TextArea
                        rows={3}
                        placeholder="Izoh"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className="customರows={3} cols={1} md={2} custom-textarea"
                    />
                </div>

                <div className="mt-4 text-right">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleSubmit}
                        className="submit-btn"
                    >
                        Qo'shish
                    </Button>
                </div>
            </Card>

        </div>
    );
};

export default TechnicalSupport;