import React, { useState, useMemo } from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useGetPaymentsQuery } from '../../../context/payStudentsApi.js';
import './style.css';
import { Select, Radio } from 'antd';

const PortfolioPerformance = () => {
    const { data: tolovlar = [] } = useGetPaymentsQuery();
    const [activeButton, setActiveButton] = useState(null); // null: Hammasi, true: Kirim, false: Chiqim
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Yagona kategoriyalar
    const uniqueCategories = useMemo(() => {
        return [...new Set(
            tolovlar
                .map((tolov) => tolov.category)
                .filter((category) => category != null && category !== '')
        )].map((category) => ({ value: category, label: category }));
    }, [tolovlar]);

    // Sanasi bo‘yicha saralash
    const saralanganTolovlar = useMemo(() => {
        return [...tolovlar].sort(
            (a, b) => new Date(b.studentFeesDate) - new Date(a.studentFeesDate)
        );
    }, [tolovlar]);

    // Filterlangan to‘lovlar
    const filteredTolovlar = useMemo(() => {
        return saralanganTolovlar.filter((tolov) => {
            const byState = activeButton === null || tolov.state === activeButton;
            const byCategory = !selectedCategory || tolov.category === selectedCategory;
            return byState && byCategory;
        });
    }, [saralanganTolovlar, activeButton, selectedCategory]);

    // Sana formatlash
    const sanaFormatlash = (sanaString) => {
        const sana = new Date(sanaString);
        const yil = sana.getFullYear();
        const oylar = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
        ];
        const oy = oylar[sana.getMonth()];
        const kun = sana.getDate().toString().padStart(2, '0');

        return ` ${kun}-${oy} ${yil} /`;
    };

    return (
        <div className="table-example">
            <div className="flexjustify-between">
                <h3 className="text-semibold">To‘lovlar Jadvali</h3>
                <div className="flex-gap-2">
                    <Select
                        placeholder="Kategoriyani tanlang"
                        allowClear
                        style={{ width: 200 }}
                        onChange={setSelectedCategory}
                        options={uniqueCategories}
                    />
                    <Radio.Group
                        value={activeButton}
                        onChange={(e) => setActiveButton(e.target.value)}
                        buttonStyle="solid"
                    >
                        {/* <Radio.Button value={null}>Hammasi</Radio.Button> */}
                        <Radio.Button value={"true"}>Kirim</Radio.Button>
                        <Radio.Button value={"false"}>Chiqim</Radio.Button>
                    </Radio.Group>
                </div>
            </div>

            <div className="table-container">
                {filteredTolovlar.length > 0 ? (
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>Turi</th>
                                <th>Kategoriya</th>
                                <th>Izoh</th>
                                <th>Miqdor (so‘m)</th>
                                <th>Sana/Vaqt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTolovlar.map((tolov) => (
                                <tr key={tolov._id}>
                                    <td style={{ color: tolov.state === "true" ? 'green' : 'red' }}>
                                        {tolov.state === "true" ? (
                                            <ArrowDownOutlined style={{ marginRight: 4 }} />
                                        ) : (
                                            <ArrowUpOutlined style={{ marginRight: 4 }} />

                                        )}
                                    </td>
                                    <td>{tolov.category || '-'}</td>
                                    <td>{tolov.description || '-'}</td>
                                    <td>{tolov.studentFees.toLocaleString()}</td>
                                    <td>
                                        {sanaFormatlash(tolov.studentFeesDate)} {tolov.studentFeesTime}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Hech qanday to‘lov topilmadi.</p>
                )}
            </div>
        </div>
    );
};

export default PortfolioPerformance;
