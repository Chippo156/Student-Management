import * as XLSX from 'xlsx';

/**
 * Export student grade sheet to Excel with school format
 * @param {Object} studentData - Student data with semester grades
 */
export const exportStudentGradesExcel = (studentData) => {
  try {
    // Create new workbook
    const wb = XLSX.utils.book_new();

    // Prepare header info
    const schoolName = 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM';
    const studentName = studentData.studentName || '';
    const mssv = studentData.mssv || '';

    // Create worksheet data array
    const wsData = [];

    // Row 1: School name (left) and motto (right)
    const row1 = ['BỘ CÔNG THƯƠNG'];
    for (let i = 1; i < 5; i++) row1.push('');
    row1.push('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');
    wsData.push(row1);

    // Row 2: School full name and motto continuation
    const row2 = [schoolName];
    for (let i = 1; i < 5; i++) row2.push('');
    row2.push('Độc lập - Tự do - Hạnh phúc');
    wsData.push(row2);

    // Row 3: Separator line
    const row3 = ['_______________'];
    for (let i = 1; i < 5; i++) row3.push('');
    row3.push('_______________');
    wsData.push(row3);

    // Row 4: Empty
    wsData.push([]);

    // Row 5: Title
    wsData.push(['BẢNG ĐIỂM SINH VIÊN']);

    // Row 6: Empty
    wsData.push([]);

    // Row 7-8: Student info
    const row7 = [
      'Họ và tên',
      studentName,
      '',
      '',
      'MSSV',
      mssv,
      '',
      '',
    ];
    wsData.push(row7);

    // Get cumulative data from latest semester
    const latestSemester = studentData.semesterGrades?.[0];
    const row8 = [
      'GPA tích lũy (10)',
      latestSemester?.cumulativeGPA10?.toFixed(2) || '',
      '',
      '',
      'GPA tích lũy (4)',
      latestSemester?.cumulativeGPA4?.toFixed(2) || '',
      '',
      '',
      'Xếp loại',
      latestSemester?.cumulativeRank || '',
    ];
    wsData.push(row8);

    // Row 9: Empty
    wsData.push([]);

    // Process each semester
    studentData.semesterGrades?.forEach((semester, semesterIndex) => {
      // Semester header
      wsData.push([
        `${semester.semesterName} - ${semester.year}`,
        '',
        '',
        '',
        `GPA HK: ${semester.semesterGPA10.toFixed(2)}`,
        '',
        `GPA TL: ${semester.cumulativeGPA10.toFixed(2)}`,
        '',
        `Xếp loại: ${semester.semesterRank}`,
      ]);

      // Table header
      wsData.push([
        'STT',
        'Mã HP',
        'Tên học phần',
        'Tín chỉ',
        'Thường kỳ',
        'Thực hành',
        'Giữa kỳ',
        'Cuối kỳ',
        'Điểm TK',
        'Điểm chữ',
      ]);

      // Course rows
      semester.courseGrades?.forEach((course, index) => {
        // Calculate scores by type
        const regularScore =
          course.assessments?.find((a) => a.assessmentTypeId === 1)
            ?.regularPointsDetails?.reduce((sum, detail) => sum + detail.score, 0) /
            course.assessments?.find((a) => a.assessmentTypeId === 1)
              ?.regularPointsDetails?.length || 0;

        const practiceScores = course.assessments
          ?.filter((a) => a.assessmentTypeId === 2)
          .map((a) => a.score);
        const practiceScore =
          practiceScores?.length > 0
            ? practiceScores.reduce((sum, s) => sum + s, 0) / practiceScores.length
            : 0;

        const midtermScore =
          course.assessments?.find((a) => a.assessmentTypeId === 3)?.score || 0;
        const finalScore =
          course.assessments?.find((a) => a.assessmentTypeId === 4)?.score || 0;

        wsData.push([
          index + 1,
          course.courseCode,
          course.courseName,
          course.credits,
          regularScore > 0 ? regularScore.toFixed(1) : '',
          practiceScore > 0 ? practiceScore.toFixed(1) : '',
          midtermScore > 0 ? midtermScore.toFixed(1) : '',
          finalScore > 0 ? finalScore.toFixed(1) : '',
          course.finalScore.toFixed(2),
          course.gradeLetter,
        ]);
      });

      // Semester summary
      wsData.push([
        '',
        '',
        'TỔNG KẾT HỌC KỲ',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
      wsData.push([
        '',
        'Tín chỉ đăng ký',
        `${semester.totalCreditsRegistered} TC`,
        '',
        'Tín chỉ đạt',
        `${semester.totalCreditsEarned} TC`,
        '',
        'GPA học kỳ (4)',
        semester.semesterGPA4.toFixed(2),
        '',
      ]);
      wsData.push([
        '',
        'Tín chỉ tích lũy',
        `${semester.totalCreditsEarned} TC`,
        '',
        'GPA tích lũy (4)',
        semester.cumulativeGPA4.toFixed(2),
        '',
        'Xếp loại',
        semester.semesterRank,
        '',
      ]);

      // Add spacing between semesters
      if (semesterIndex < studentData.semesterGrades.length - 1) {
        wsData.push([]);
        wsData.push([]);
      }
    });

    // Create worksheet from array
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // STT
      { wch: 12 }, // Mã HP
      { wch: 35 }, // Tên học phần
      { wch: 8 },  // Tín chỉ
      { wch: 10 }, // Thường kỳ
      { wch: 10 }, // Thực hành
      { wch: 10 }, // Giữa kỳ
      { wch: 10 }, // Cuối kỳ
      { wch: 10 }, // Điểm TK
      { wch: 10 }, // Điểm chữ
    ];

    // Merge cells for headers
    const merges = [
      // School info header
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 1, c: 5 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: 9 } },

      // Title
      { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } },

      // Student info
      { s: { r: 6, c: 1 }, e: { r: 6, c: 3 } },
      { s: { r: 6, c: 5 }, e: { r: 6, c: 7 } },

      { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } },
      { s: { r: 7, c: 5 }, e: { r: 7, c: 7 } },
    ];

    ws['!merges'] = merges;

    // Add styling
    const range = XLSX.utils.decode_range(ws['!ref']);
    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    };

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }

        const cell = ws[cellAddress];

        // Header section styling
        if (R <= 7) {
          cell.s = {
            alignment: {
              horizontal: R === 0 || R === 1 || R === 2 || R === 4 ? 'center' : 'left',
              vertical: 'center',
              wrapText: true,
            },
            font: {
              bold: R === 0 || R === 1 || R === 4,
              size: R === 4 ? 14 : 11,
            },
          };
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Bảng điểm');

    // Generate file name
    const fileName = `bang-diem-${mssv}-${new Date().getTime()}.xlsx`;

    // Export file
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting student grades Excel:', error);
    return { success: false, error: error.message };
  }
};
