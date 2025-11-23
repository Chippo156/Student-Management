import ExcelJS from 'exceljs';

/**
 * Export student grade sheet to Excel with school format
 * @param {Object} studentData - Student data with semester grades
 */
export const exportStudentGradesExcel = async (studentData) => {
  try {
    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bảng điểm');

    // Prepare header info
    const studentName = studentData.studentName || '';
    const mssv = studentData.mssv || '';

    const totalCols = 10; // 10 columns for student grades

    // === ROW 1-4: Header truyền thống ===
    // Row 1: Bộ Công Thương và CHXHCNVN
    const row1 = worksheet.getRow(1);
    row1.getCell(1).value = 'BỘ CÔNG THƯƠNG';
    const midCol = Math.ceil(totalCols / 2);
    row1.getCell(midCol).value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
    worksheet.mergeCells(1, 1, 1, midCol - 1);
    worksheet.mergeCells(1, midCol, 1, totalCols);
    row1.height = 20;
    row1.alignment = { horizontal: 'center', vertical: 'middle' };
    row1.font = { bold: true, size: 11 };

    // Row 2: Tên trường và khẩu hiệu
    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM';
    row2.getCell(midCol).value = 'Độc lập - Tự do - Hạnh phúc';
    worksheet.mergeCells(2, 1, 2, midCol - 1);
    worksheet.mergeCells(2, midCol, 2, totalCols);
    row2.height = 20;
    row2.alignment = { horizontal: 'center', vertical: 'middle' };
    row2.font = { bold: true, size: 11 };

    // Row 3: Dòng gạch dưới
    const row3 = worksheet.getRow(3);
    row3.getCell(1).value = '_______________';
    row3.getCell(midCol).value = '_______________';
    worksheet.mergeCells(3, 1, 3, midCol - 1);
    worksheet.mergeCells(3, midCol, 3, totalCols);
    row3.height = 20;
    row3.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 4: Empty
    worksheet.getRow(4).height = 15;

    // === ROW 5: Title ===
    const row5 = worksheet.getRow(5);
    row5.getCell(1).value = 'BẢNG ĐIỂM SINH VIÊN';
    row5.getCell(1).font = { bold: true, size: 16 };
    row5.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row5.height = 25;
    worksheet.mergeCells(5, 1, 5, totalCols);

    // === ROW 6-8: Info - mỗi dòng 1 row riêng, merge theo column (không có border) ===

    // Row 6: Họ và tên
    const row6 = worksheet.getRow(6);
    row6.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Họ và tên:' }],
    };
    row6.getCell(2).value = studentName;
    worksheet.mergeCells(6, 2, 6, totalCols);
    row6.height = 20;

    // Row 7: MSSV
    const row7 = worksheet.getRow(7);
    row7.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'MSSV:' }],
    };
    row7.getCell(2).value = mssv;
    worksheet.mergeCells(7, 2, 7, totalCols);
    row7.height = 20;

    // Get cumulative data from latest semester
    const latestSemester = studentData.semesterGrades?.[0];

    // Row 8: GPA tích lũy
    const row8 = worksheet.getRow(8);
    row8.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'GPA tích lũy (10):' }],
    };
    row8.getCell(2).value = latestSemester?.cumulativeGPA10?.toFixed(2) || '';
    row8.getCell(3).value = {
      richText: [{ font: { bold: true }, text: 'GPA tích lũy (4):' }],
    };
    row8.getCell(4).value = latestSemester?.cumulativeGPA4?.toFixed(2) || '';
    row8.getCell(5).value = {
      richText: [{ font: { bold: true }, text: 'Xếp loại:' }],
    };
    row8.getCell(6).value = latestSemester?.cumulativeRank || '';
    row8.height = 20;

    // Set alignment và font cho tất cả rows info
    [row6, row7, row8].forEach((row) => {
      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        if (!cell.value) cell.value = '';
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.font = { size: 12 };
      }
    });

    // Xóa border cho tất cả cells trong phần info (rows 1-8)
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= totalCols; c++) {
        const cell = worksheet.getRow(r).getCell(c);
        cell.border = {}; // Xóa border
      }
    }

    let currentRow = 9;

    // Process each semester
    studentData.semesterGrades?.forEach((semester, semesterIndex) => {
      // Semester header row
      const semesterHeaderRow = worksheet.getRow(currentRow);
      semesterHeaderRow.getCell(1).value = `${semester.semesterName} - ${semester.year}`;
      semesterHeaderRow.getCell(5).value = `GPA HK: ${semester.semesterGPA10.toFixed(2)}`;
      semesterHeaderRow.getCell(7).value = `GPA TL: ${semester.cumulativeGPA10.toFixed(2)}`;
      semesterHeaderRow.getCell(9).value = `Xếp loại: ${semester.semesterRank}`;
      worksheet.mergeCells(currentRow, 1, currentRow, 4);
      worksheet.mergeCells(currentRow, 5, currentRow, 6);
      worksheet.mergeCells(currentRow, 7, currentRow, 8);
      worksheet.mergeCells(currentRow, 9, currentRow, 10);
      semesterHeaderRow.height = 25;
      semesterHeaderRow.alignment = { horizontal: 'left', vertical: 'middle' };
      semesterHeaderRow.font = { bold: true, size: 12 };
      semesterHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' },
      };
      currentRow++;

      // Table header
      const tableHeaderRow = worksheet.getRow(currentRow);
      const headers = [
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
      ];

      headers.forEach((header, index) => {
        const cell = tableHeaderRow.getCell(index + 1);
        cell.value = header;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      tableHeaderRow.height = 25;
      currentRow++;

      // Course rows
      semester.courseGrades?.forEach((course, index) => {
        // Calculate scores by type
        const regularScore =
          course.assessments?.find((a) => a.assessmentTypeId === 1)
            ?.regularPointsDetails?.reduce(
              (sum, detail) => sum + detail.score,
              0
            ) /
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

        const courseRow = worksheet.getRow(currentRow);
        const courseData = [
          index + 1,
          course.courseCode,
          course.courseName,
          course.credits,
          regularScore > 0 ? regularScore : '',
          practiceScore > 0 ? practiceScore : '',
          midtermScore > 0 ? midtermScore : '',
          finalScore > 0 ? finalScore : '',
          course.finalScore,
          course.gradeLetter,
        ];

        courseData.forEach((data, colIndex) => {
          const cell = courseRow.getCell(colIndex + 1);
          cell.value = data;

          // Number formatting for scores
          if (
            colIndex >= 4 &&
            colIndex <= 8 &&
            typeof data === 'number' &&
            data > 0
          ) {
            cell.numFmt = '0.0';
          }

          cell.alignment = {
            horizontal:
              colIndex === 0 || colIndex === 1 || colIndex >= 4
                ? 'center'
                : 'left',
            vertical: 'middle',
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
        courseRow.height = 20;
        currentRow++;
      });

      // Semester summary section
      const summaryHeaderRow = worksheet.getRow(currentRow);
      summaryHeaderRow.getCell(3).value = 'TỔNG KẾT HỌC KỲ';
      worksheet.mergeCells(currentRow, 3, currentRow, 10);
      summaryHeaderRow.height = 25;
      summaryHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
      summaryHeaderRow.font = { bold: true, size: 12 };
      summaryHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
      currentRow++;

      // Summary row 1
      const summaryRow1 = worksheet.getRow(currentRow);
      summaryRow1.getCell(2).value = {
        richText: [{ font: { bold: true }, text: 'Tín chỉ đăng ký:' }],
      };
      summaryRow1.getCell(3).value = `${semester.totalCreditsRegistered} TC`;
      summaryRow1.getCell(5).value = {
        richText: [{ font: { bold: true }, text: 'Tín chỉ đạt:' }],
      };
      summaryRow1.getCell(6).value = `${semester.totalCreditsEarned} TC`;
      summaryRow1.getCell(8).value = {
        richText: [{ font: { bold: true }, text: 'GPA học kỳ (4):' }],
      };
      summaryRow1.getCell(9).value = semester.semesterGPA4.toFixed(2);
      worksheet.mergeCells(currentRow, 9, currentRow, 10);
      summaryRow1.height = 20;
      currentRow++;

      // Summary row 2
      const summaryRow2 = worksheet.getRow(currentRow);
      summaryRow2.getCell(2).value = {
        richText: [{ font: { bold: true }, text: 'Tín chỉ tích lũy:' }],
      };
      summaryRow2.getCell(3).value = `${semester.totalCreditsEarned} TC`;
      summaryRow2.getCell(5).value = {
        richText: [{ font: { bold: true }, text: 'GPA tích lũy (4):' }],
      };
      summaryRow2.getCell(6).value = semester.cumulativeGPA4.toFixed(2);
      summaryRow2.getCell(8).value = {
        richText: [{ font: { bold: true }, text: 'Xếp loại:' }],
      };
      summaryRow2.getCell(9).value = semester.semesterRank;
      worksheet.mergeCells(currentRow, 9, currentRow, 10);
      summaryRow2.height = 20;
      currentRow++;

      // Add spacing between semesters
      if (semesterIndex < studentData.semesterGrades.length - 1) {
        worksheet.getRow(currentRow).height = 15;
        currentRow++;
        worksheet.getRow(currentRow).height = 15;
        currentRow++;
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 5; // STT
    worksheet.getColumn(2).width = 12; // Mã HP
    worksheet.getColumn(3).width = 35; // Tên học phần
    worksheet.getColumn(4).width = 8; // Tín chỉ
    worksheet.getColumn(5).width = 10; // Thường kỳ
    worksheet.getColumn(6).width = 10; // Thực hành
    worksheet.getColumn(7).width = 10; // Giữa kỳ
    worksheet.getColumn(8).width = 10; // Cuối kỳ
    worksheet.getColumn(9).width = 10; // Điểm TK
    worksheet.getColumn(10).width = 10; // Điểm chữ

    // Generate file name
    const fileName = `bang-diem-${mssv}-${new Date().getTime()}.xlsx`;

    // Export file
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting student grades Excel:', error);
    return { success: false, error: error.message };
  }
};
