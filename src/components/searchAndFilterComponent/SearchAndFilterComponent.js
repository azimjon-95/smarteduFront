import React from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const SearchAndFilterComponent = ({
    searchTerm,
    setSearchTerm,
    selectedTeacher,
    handleTeacherChange,
    selectedSubjects,
    handleSubjectsChange,
    teacherNames,
    subjectsNames,
}) => {
    return (
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
            >
                <Option value={null}>Ustozlar</Option>
                {teacherNames.map(name => (
                    <Option key={name} value={name}>
                        {name}
                    </Option>
                ))}
            </Select>
            <Select
                style={{ width: 200 }}
                placeholder="Fanlarni tanlang"
                onChange={handleSubjectsChange}
                value={selectedSubjects}
            >
                <Option value={null}>Fanlar</Option>
                {subjectsNames.map(name => (
                    <Option key={name} value={name}>
                        {name}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default SearchAndFilterComponent;
