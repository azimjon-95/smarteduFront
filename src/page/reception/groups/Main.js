import React, { useState } from 'react';
import { Input, Select, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import NewGrupps from './newGrupps/NewGrupps';
import { useGetAllRegistrationsQuery } from '../../../context/groupsApi';
import './style.css';
const { Option } = Select;


const Main = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const { data: gruups, isLoading } = useGetAllRegistrationsQuery();
    // O'qituvchi tanlanganda ma'lumotlarni olish
    const handleTeacherChange = value => {
        setSelectedTeacher(value);
    };

    const gData = gruups?.registrations || [];
    // Unikal o'qituvchilar nomlarini yig'ish
    const teacherNames = Array.from(
        new Set(gData?.flatMap(s => s.teachers))
    );

    const filteredData = gData?.filter((g) => {
        const matchesTeacher = selectedTeacher ? g?.teachers?.includes(selectedTeacher) : true;
        const searchTermLower = searchTerm?.toLowerCase();
        const matchesSearchTerm = g?.teachers?.some(teacher =>
            teacher?.toLowerCase()?.includes(searchTermLower)
        ) || g?.roomNumber?.toLowerCase()?.includes(searchTermLower) ||
            g?.subjects?.toLowerCase()?.includes(searchTermLower);
        return matchesTeacher && matchesSearchTerm;
    });
    const dataActive = filteredData?.filter((i) => i.state === "active") // active
    const dataNew = filteredData?.filter((i) => i.state === "new"); // active

    const items = [
        {
            key: '0',
            label: `Qabul Bo'limi: ${dataNew?.length}`,
            children: <NewGrupps isLoading={isLoading} filteredData={dataNew} />,
        },
    ];

    return (
        <div className='Main-grups'>
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "0 10px", marginTop: "8px" }}>
                <Input
                    placeholder="O'quvchilarni qidirish"
                    style={{ width: "100%" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
                <Select
                    style={{ width: 200 }}
                    placeholder="O'qituvchini tanlang"
                    onChange={handleTeacherChange}
                    value={selectedTeacher}
                    showSearch
                    filterOption={(input, option) =>
                        option.children?.toLowerCase().includes(input?.toLowerCase())
                    }
                >
                    <Option value=''>Ustozlar</Option>
                    {teacherNames.map(name => (
                        <Option key={name} value={name}>
                            {name}
                        </Option>
                    ))}
                </Select>

            </div>
            <Tabs items={items} />;
        </div>
    )
}


export default Main
