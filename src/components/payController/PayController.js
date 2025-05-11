import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Input, Button, Select, message } from "antd";
import {
  useGetStudentQuery,
  useUpdateStudentMutation,
} from "../../context/studentsApi";
import {
  useCreatePaymentMutation,
  useProcessPaymentsMutation,
  useGetPaymentsByStudentIdQuery,
} from "../../context/payStudentsApi";
import { MdHistory } from "react-icons/md";
import { SearchOutlined, DollarOutlined, UsergroupDeleteOutlined } from "@ant-design/icons";
import { FaTimesCircle } from "react-icons/fa";
import { NumberFormat, PhoneNumberFormat } from "../../hook/NumberFormat";
import { capitalizeFirstLetter } from "../../hook/CapitalizeFirstLitter";
import PropTypes from "prop-types";
import "./style.css";

const { Option } = Select;

// Utility function to get month name in Uzbek
const getMonthName = (date) => {
  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
  ];
  return monthNames[new Date(date).getMonth()];
};

// PaymentModal Component
const PaymentModal = ({ studentId, isOpen, onClose, payForLesson }) => {
  const { data: paymentHistory, isLoading } = useGetPaymentsByStudentIdQuery(studentId, {
    skip: !isOpen || !studentId,
  });

  // Memoize grouped payments to avoid recomputation
  const monthlyPayments = useMemo(() => {
    if (!paymentHistory?.length) return [];

    const grouped = paymentHistory.reduce((acc, payment) => {
      const date = new Date(payment.studentFeesDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = getMonthName(payment.studentFeesDate);

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          totalFees: 0,
        };
      }

      acc[monthKey].totalFees += Number(payment.studentFees);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) =>
      `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`)
    );
  }, [paymentHistory]);

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" aria-modal="true" role="dialog">
      <div className="payment-modal">
        <div className="modal-header">
          <h2>To‘lovlar Tarixi</h2>
          <button
            className="close-btn"
            onClick={onClose}
            title="Yopish"
            aria-label="Close modal"
          >
            <FaTimesCircle />
          </button>
        </div>
        <table className="payment-table">
          <thead>
            <tr>
              <th>Oy va Yil</th>
              <th>To'langan</th>
              <th>To'lash kerak</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3">Yuklanmoqda...</td>
              </tr>
            ) : monthlyPayments.length ? (
              monthlyPayments.map((monthData, index) => {
                const isPaid = monthData.totalFees >= payForLesson;
                const remaining = isPaid ? 0 : payForLesson - monthData.totalFees;
                return (
                  <tr key={index}>
                    <td>{`${monthData.month} ${monthData.year}`}</td>
                    <td>{NumberFormat(monthData.totalFees)} so‘m</td>
                    <td>
                      {isPaid
                        ? "Oylik to‘lov bajarildi"
                        : `Qoldiq: ${NumberFormat(remaining)} so‘m`}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3">To‘lov ma'lumotlari yo'q</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

PaymentModal.propTypes = {
  studentId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  payForLesson: PropTypes.number,

};

// StudentRow Component
const StudentRow = ({ student, isCreating, selectedStudent, paymentAmount, onPayment, onInputChange, onToggleModal }) => {
  return (
    <tr>
      <td data-label="Ism Familya">
        {capitalizeFirstLetter(student.firstName)} {student.lastName}
      </td>
      <td data-label="Telefon raqami">{PhoneNumberFormat(student.studentPhoneNumber)}</td>
      <td data-label="Ota-onaning telefon raqami">{PhoneNumberFormat(student.parentPhoneNumber)}</td>
      <td data-label="Ustozi">{student.teacherFullName}</td>
      <td data-label="Fani">{student.subject}</td>
      <td data-label="Qarzdorlik">
        {student.indebtedness.debtorPay === 0
          ? "0"
          : `${NumberFormat(student.indebtedness.debtorPay)} so'm`}
      </td>
      <td data-label="To'lov" className="is-actions-cell">
        <div className="payment-container">
          <Input
            style={{ width: "100px" }}
            type="number"
            placeholder="To'lov miqdori"
            value={selectedStudent === student._id ? paymentAmount : ""}
            onChange={(e) => onInputChange(e, student)}
            aria-label="To'lov miqdori"
          />
          <Button
            type="primary"
            onClick={() => onPayment(student._id)}
            disabled={!paymentAmount || selectedStudent !== student._id}
            loading={isCreating} // Use the loading prop
          >
            To'lash
          </Button>
        </div>
      </td>
      <td data-label="Tarix">
        <button
          className="total-textBtn"
          onClick={() => onToggleModal(student._id)}
          title="To'lov tarixi"
          aria-label="View payment history"
        >
          <MdHistory />
        </button>
      </td>
    </tr>
  );
};

StudentRow.propTypes = {
  student: PropTypes.object.isRequired,
  selectedStudent: PropTypes.string,
  paymentAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onPayment: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onToggleModal: PropTypes.func.isRequired,
};

// Main PayController Component
const PayController = () => {
  const { data: students, isLoading: isStudentsLoading } = useGetStudentQuery();
  const [updateStudent] = useUpdateStudentMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [processPayments, { isLoading: isProcessing, data: processData, error: processError }] =
    useProcessPaymentsMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [paymentState, setPaymentState] = useState({
    amount: 0,
    studentId: null,
    inputValue: "",
  });
  const [modalState, setModalState] = useState({ isOpen: false, studentId: null });

  // Memoized data
  const mainData = useMemo(() => students?.filter((s) => s.state === "active") || [], [students]);
  const [loadingPayments, setLoadingPayments] = useState({}); // Track loading per student
  const teacherNames = useMemo(
    () => Array.from(new Set(mainData.map((student) => student.teacherFullName))),
    [mainData]
  );

  const filteredStudents = useMemo(() => {
    return mainData.filter((student) => {
      const matchesTeacher = selectedTeacher
        ? student.teacherFullName === selectedTeacher
        : true;
      const matchesSearchTerm =
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentPhoneNumber.includes(searchTerm) ||
        student.studentPhoneNumber.includes(searchTerm);
      return matchesTeacher && matchesSearchTerm;
    });
  }, [mainData, selectedTeacher, searchTerm]);

  const totalIndebtedness = useMemo(
    () => filteredStudents.reduce((acc, student) => acc + student.indebtedness.debtorPay, 0),
    [filteredStudents]
  );

  // Handlers
  const handleTeacherChange = useCallback((value) => {
    setSelectedTeacher(value);
  }, []);

  const handleInputChange = useCallback((e, student) => {
    const value = e.target.value;
    setPaymentState({
      amount: Number(value) || 0,
      studentId: student._id,
      inputValue: value,
    });
  }, []);

  const handlePayment = useCallback(
    async (studentId) => {
      if (paymentState.amount <= 0) {
        message.error("To'lov miqdori 0 dan katta bo'lishi kerak");
        return;
      }
      setLoadingPayments((prev) => ({ ...prev, [studentId]: true })); // Set loading for this student

      try {
        const student = mainData.find((s) => s._id === studentId);
        if (!student) throw new Error("O'quvchi topilmadi");


        const paymentData = {
          fullName: `${student.firstName} ${student.lastName}`,
          studentId: student._id,
          studentFees: paymentState.amount,
          subject: student.subject,
          category: "O'quv kurlar tulovi",
          state: true,
          description: student.subject.join('')
        };
        await createPayment(paymentData).unwrap();

        const updatedStudent = {
          ...student,
          indebtedness: {
            ...student.indebtedness,
            debtorPay: Math.max(0, student.indebtedness.debtorPay - paymentState.amount),
          },
        };
        await updateStudent({ id: student._id, body: updatedStudent }).unwrap();

        message.success("To'lov muvaffaqiyatli amalga oshirildi");
        setPaymentState({ amount: 0, studentId: null, inputValue: "" });
      } catch (error) {
        message.error(`Xato: ${error.data?.message || "To'lov amalga oshmadi"}`);
      } finally {
        setLoadingPayments((prev) => ({ ...prev, [studentId]: false })); // Reset loading
      }
    },
    [createPayment, updateStudent, mainData, paymentState]
  );

  const handleProcessPayments = useCallback(async () => {
    try {
      await processPayments().unwrap();
    } catch (err) {
      // Handled in useEffect
    }
  }, [processPayments]);

  const togglePaymentModal = useCallback((studentId) => {
    setModalState((prev) => ({
      isOpen: !prev.isOpen,
      studentId: prev.isOpen ? null : studentId,
    }));
  }, []);

  // Effect for processing payments feedback
  useEffect(() => {
    if (isProcessing) {
      message.loading({ content: "Jarayonda...", key: "paymentMessage", duration: 0 });
    } else if (processError) {
      message.error({
        content: `Xato: ${processError.data?.message || "Jarayon muvaffaqiyatsiz yakunlandi"}`,
        key: "paymentMessage",
        duration: 5,
      });
    } else if (processData) {
      message.success({
        content: processData.message,
        key: "paymentMessage",
        duration: 5,
      });
    }
  }, [isProcessing, processData, processError]);

  // Get payForLesson for the selected student
  const selectedStudent = useMemo(
    () => mainData.find((s) => s._id === modalState.studentId),
    [mainData, modalState.studentId]
  );

  return (
    <div className="pay-controller">
      <h2 className="pay-controller-title">To'lov bo'limi</h2>
      <div className="total-card">
        <div className="search_bar">
          <Input
            placeholder="O'quvchilarni qidirish"
            style={{ width: "100%" }}
            value={searchTerm}
            size="large"
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            aria-label="O'quvchilarni qidirish"
          />
          <Select
            size="large"
            style={{ width: 200 }}
            placeholder="O'qituvchini tanlang"
            onChange={handleTeacherChange}
            value={selectedTeacher}
            aria-label="O'qituvchini tanlang"
          >
            <Option value={null}>Barchasi</Option>
            {teacherNames?.map((name) => (
              <Option key={name} value={name}>
                {name}
              </Option>
            ))}
          </Select>
        </div>
        <p className="total-text">
          <DollarOutlined style={{ marginRight: 5 }} />
          Jami qarzdorlik:{" "}
          {totalIndebtedness === 0
            ? "0 so'm"
            : `${NumberFormat(totalIndebtedness)} so'm`}
        </p>
        <p className="total-text">
          <UsergroupDeleteOutlined style={{ marginRight: 5 }} />
          Jami qarzdorlar: {filteredStudents?.length}
        </p>
        <div className="inner-container">
          <button
            onClick={handleProcessPayments}
            disabled={isProcessing}
            className="total-text"
            aria-label="Oylik to'lovlarni amalga oshirish"
          >
            {isProcessing ? "Jarayonda..." : "Oylik To'lovlarni Amalga Oshirish"}
          </button>
        </div>
      </div>

      <div className="b-table">
        <div className="table-wrapper has-mobile-cards">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Ism Familya</th>
                <th>Telefon raqami</th>
                <th>Ota-ona telefon raqami</th>
                <th>Ustozi</th>
                <th>Fani</th>
                <th>Qarzdorlik</th>
                <th>To'lov</th>
                <th>Tarix</th>
              </tr>
            </thead>
            <tbody>
              {isStudentsLoading ? (
                <tr>
                  <td colSpan="8">Yuklanmoqda...</td>
                </tr>
              ) : filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <StudentRow
                    key={student._id}
                    student={student}
                    selectedStudent={paymentState.studentId}
                    paymentAmount={paymentState.inputValue}
                    onPayment={handlePayment}
                    onInputChange={handleInputChange}
                    onToggleModal={togglePaymentModal}
                    isCreating={loadingPayments[student._id] || false}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8">O'quvchilar topilmadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        studentId={modalState.studentId}
        isOpen={modalState.isOpen}
        onClose={() => togglePaymentModal(null)}
        payForLesson={selectedStudent?.payForLesson || 0}
      />
    </div>
  );
};

export default PayController;


