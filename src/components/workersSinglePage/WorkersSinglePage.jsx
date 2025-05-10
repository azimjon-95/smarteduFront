import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Checkbox,
  Table,
  Image,
  Row,
} from "antd";
import moment from "moment";
import Selectt from "react-select";
import { useParams } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "./style.css";
import { IdCapitalize } from "../../hook/IDCapitalize";
import img1 from "./img/female.png";
import img2 from "./img/teacher.png";
import { useGetAllTeachersQuery } from '../../context/teacherApi';


const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 14,
    },
  },
};

const WorkersSinglePage = () => {
  const { data: teacherData } = useGetAllTeachersQuery();
  const [componentDisabled, setComponentDisabled] = useState(true);
  const { id } = useParams();
  const teache = teacherData?.find((i) => i._id === id);
  // Mock data
  const dataTeacher = {
    _id: teache?._id,
    idNumber: teache?.teachersId,
    firstName: teache?.firstName,
    lastName: teache?.lastName,
    middleName: teache?.middleName,
    dateOfBirth: moment(teache?.dateOfBirth).format("DD.MM.YYYY"),
    address: teache?.address,
    specialization: teache?.subject,
    experience: 4,
    createdAt: teache?.createdAt,
    updatedAt: teache?.updatedAt,
    gender: teache?.gender,
    username: teache?.username,
  };
  const [random, setRandom] = useState();
  const [form] = Form.useForm();
  const [phone, setPhone] = useState("");
  const [regions, setRegions] = useState([]);
  const [Teacher, setTeacher] = useState([]);
  const [quarters, setQuarters] = useState([]);

  const [extraClass, setExtraClass] = useState(false);
  const [extraClass2, setExtraClass2] = useState(false);
  const [extraClass3, setExtraClass3] = useState(false);

  useEffect(() => {
    // Simulate API call to get regions
    const mockRegions = [
      { value: "Region1", label: "Region 1", regionID: "1" },
      { value: "Region2", label: "Region 2", regionID: "2" },
    ];
    setRegions(mockRegions);
  }, []);

  const getTeacher = (regionID) => {
    // Simulate API call to get Teacher based on regionID
    const mockTeacher = [
      { value: "District1", label: "District 1", districtID: "1" },
      { value: "District2", label: "District 2", districtID: "2" },
    ];
    setTeacher(mockTeacher);
  };

  const getQuarters = (districtID) => {
    // Simulate API call to get quarters based on districtID
    const mockQuarters = [
      { value: "Quarter1", label: "Quarter 1", quarterID: "1" },
      { value: "Quarter2", label: "Quarter 2", quarterID: "2" },
    ];
    setQuarters(mockQuarters);
  };


  const columns = [
    {
      title: "Xodim",
      dataIndex: "name",
    },
    {
      title: "",
      dataIndex: "info",
    },
  ];

  const createdDate = new Date(dataTeacher?.createdAt).toLocaleString();
  const updatedDate = new Date(dataTeacher?.updatedAt).toLocaleString();
  const data = [
    {
      key: "1",
      name: "Rasm",
      info: (
        <div className="ObjIng">
          <img
            src={`${dataTeacher?.gender === "Erkak" ? img2 : img1}`}
            alt="error"
          />
        </div>
      ),
    },
    {
      key: "2",
      name: "IDraqami",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>
          {IdCapitalize(dataTeacher?.idNumber)}
        </div>
      ),
    },
    {
      key: "3",
      name: "Ismi",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>
          {dataTeacher?.firstName?.toUpperCase()}
        </div>
      ),
    },
    {
      key: "4",
      name: "Familiya",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>
          {dataTeacher?.lastName?.toUpperCase()}
        </div>
      ),
    },
    {
      key: "5",
      name: "Tug'ilgan sana",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>
          {dataTeacher?.dateOfBirth}
        </div>
      ),
    },
    {
      key: "6",
      name: "Manzil",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>
          {dataTeacher?.address}
        </div>
      ),
    },
    {
      key: "7",
      name: "Mutaxassislik",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>
          {dataTeacher?.specialization}
        </div>
      ),
    },
    {
      key: "8",
      name: "Ilmiy daraja",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>
          {dataTeacher?.experience === undefined
            ? "Darajasiz"
            : dataTeacher?.experience + " yil"}
        </div>
      ),
    },
    {
      key: "8",
      name: "Ilmiy unvon",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>{"Unvonsiz"}</div>
      ),
    },
    {
      key: "9",
      name: "Yaratilgan",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>{createdDate}</div>
      ),
    },
    {
      key: "10",
      name: "O'zgartirigan",
      info: (
        <div style={{ fontSize: "13px", color: "#9e9e9e" }}>{updatedDate}</div>
      ),
    },
  ];


  return (
    <div className="userSingle-info">
      <div className="userSingle-info-box">
        <Form
          form={form}
          initialValues={dataTeacher}
          {...formItemLayout}
          variant="filled"
          layout="vertical"
          autoComplete="off"
          style={{
            width: "330px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <Form.Item
              label="Ismi"
              name="firstName"
              className="Form-Item"
              rules={[
                {
                  required: true,
                  message: "Ismi kiriting",
                },
              ]}
            >
              <Input
                disabled={true}
                style={{
                  width: "150px",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Familiya"
              name="lastName"
              className="Form-Item"
              rules={[
                {
                  required: true,
                  message: "Familiya kiriting",
                },
              ]}
            >
              <Input
                disabled={true}
                style={{
                  width: "150px",
                }}
              />
            </Form.Item>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <Form.Item
              label="Otasining ismi"
              className="Form-Item"
              name="middleName"
              labelAlign="left"
              style={{
                width: "150px",
              }}
              labelCol={{
                span: 20, // Label kengligini oshiramiz
              }}
              wrapperCol={{
                span: 20, // Input maydoni kengligini moslashtiramiz
              }}
              rules={[
                {
                  required: true,
                  message: "Middle Name kiriting",
                },
              ]}
            >
              <Input
                disabled={true}
                style={{
                  width: "150px",
                }}
              />
            </Form.Item>

            <Form.Item
              label="ID raqami"
              className="Form-Item"
              name="idNumber"
              labelAlign="left"
              style={{
                width: "150px",
              }}
              labelCol={{
                span: 15, // Label kengligini oshiramiz
              }}
              wrapperCol={{
                span: 18, // Input maydoni kengligini moslashtiramiz
              }}
              rules={[
                {
                  required: true,
                  message: "ID raqami kiriting",
                },
              ]}
            >
              <Input
                disabled={true}
                style={{
                  width: "150px",
                }}
              />
            </Form.Item>
          </div>


          <Form.Item
            label="Login"
            className="Form-Item"
            name="username"
            rules={[
              {
                required: true,
                message: "Login kiriting!",
              },
            ]}
          >
            <Input
              disabled={true}
              style={{
                width: "310px",
              }}
            />
          </Form.Item>
          <Form.Item
            label="Telefon"
            name="phone"
            className="Form-Item"
            rules={[
              {
                required: true,
                message: "Telefon raqamingizni kiriting!",
              },
            ]}
          >
            <PhoneInput
              defaultCountry="uz"
              value={phone}
              placeholder="+998 xx xxx xx xx"
              style={{ width: "310px" }}
              inputStyle={{ width: "100%" }}
              onChange={(e) =>
                e.length === 13 && setPhone(e.replace("+998", ""))
              }
            />
          </Form.Item>

          <Form.Item
            label="Doyimiy yashash joyi"
            name="address"
            className="Form-Item"
            labelAlign="left"
            style={{
              width: "100%", // Input kengligini optimal qilish
            }}
            labelCol={{
              span: 25, // Label kengligini oshiramiz
            }}
            wrapperCol={{
              span: 16, // Input maydoni kengligini moslashtiramiz
            }}
            rules={[
              {
                required: true,
                message: "Doyimiy yashash joyingizni kiriting!",
              },
            ]}
          >

            <Row
              style={{
                gap: "5px",
                display: "flex",
                flexWrap: "nowrap",
              }}
            >
              <Selectt
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: extraClass ? 150 : 100,
                  }),
                }}
                onMenuOpen={() => setExtraClass(true)}
                onMenuClose={() => setExtraClass(false)}
                onChange={(e) => {
                  getTeacher(e.regionID);

                }}
                options={regions}
              />
              <Selectt
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: extraClass2 ? 150 : 100,
                  }),
                }}
                onMenuOpen={() => setExtraClass2(true)}
                onMenuClose={() => setExtraClass2(false)}
                onChange={(e) => {
                  getQuarters(e.districtID);

                }}
                options={Teacher}
              />
              <Selectt
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: extraClass3 ? 150 : 100,
                  }),
                }}
                onMenuOpen={() => setExtraClass3(true)}
                onMenuClose={() => setExtraClass3(false)}
                options={quarters}

              />
              {/* </Form.Item> */}
            </Row>
          </Form.Item>

          {/* </Col> */}
          {/* </div> */}
          {/* </Col> */}
          {/* </div> */}
          <Checkbox
            style={{ marginTop: "10px" }}
            checked={componentDisabled}
            onChange={(e) => setComponentDisabled(e.target.checked)}
          >
            Parolni o'zgartirish
          </Checkbox>
          <Form.Item
            className="Form-Item"
            name="password"
            rules={[
              {
                required: true,
                message: "Parol kiriting",
              },
            ]}
          >
            <Input
              disabled={componentDisabled}
              style={{
                width: "310px",
              }}
            />
          </Form.Item>
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <Form.Item
              label="Tasdiqlash"
              className="Form-Item"
              name="password"
              style={{
                width: "100%",
              }}
              rules={[
                {
                  required: true,
                  message: "Tasdiqlang!",
                },
              ]}
            >
              <Input
                placeholder="Parol tasdiqlang"
                disabled={componentDisabled}
                style={{
                  width: "310px",
                }}
              />
            </Form.Item>

            <Button
              style={{ width: "94%", marginTop: "34px" }}
              type="primary"
              htmlType="submit"
            >
              O'zgartirish
            </Button>
          </div>
        </Form>
        <div>
          <div
            style={{
              fontSize: "14px",
              marginTop: "10px",
            }}
            onClick={() => {
              setRandom(Date.now());
            }}
          >
            Rasim
          </div>
          <Image
            width={100}
            height={100}
            style={{
              border: "2px dotted gray",
              padding: "3px 3px 0px 3px",
              borderRadius: "5px",
            }}
            src={`${dataTeacher?.gender === "Erkak" ? img2 : img1
              }?${random}`}
            placeholder={
              <Image
                preview={false}
                src={`${dataTeacher?.gender === "Erkak" ? img2 : img1
                  }?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200`}
                width={100}
              />
            }
          />
        </div>
      </div >
      <Table
        style={{
          borderTop: "3px solid #d2d2d2",
          width: "50%",
          borderRadius: "5px",
        }}
        bordered={true}
        pagination={false}
        columns={columns}
        dataSource={data}
        size="small"
      />
    </div >

  );
};

export default WorkersSinglePage;


