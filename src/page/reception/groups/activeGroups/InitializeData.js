const isValidDate = (dateStr) => /^\d{2}\.\d{2}\.\d{4}$/.test(dateStr);

export const initializeData = (daysArray, studentList, attendanceData) => {
    const attendance = {};
    const grades = {};

    // Talabalar uchun boshlang'ich holatni yaratish
    studentList.forEach((student) => {
        attendance[student._id] = {};
        grades[student._id] = {};
        daysArray.forEach((day) => {
            attendance[student._id][day] = '';
            grades[student._id][day] = '';
        });
    });

    // Serverdan kelgan davomat ma'lumotlarini qayta ishlash
    attendanceData?.forEach((record) => {
        const studentId = record.studentId;
        if (!attendance[studentId]) return;

        record.attendance?.forEach(({ attendance: att, date }) => {
            if (date && isValidDate(date)) {
                const day = parseInt(date.split('.')[0], 10);
                if (!isNaN(day)) {
                    attendance[studentId][day] = att || '';
                }
            }
        });

        record.grades?.forEach(({ grade, date }) => {
            if (date && isValidDate(date)) {
                const day = parseInt(date.split('.')[0], 10);
                if (!isNaN(day)) {
                    grades[studentId][day] = grade || '';
                }
            }
        });
    });

    return { attendance, grades };
};