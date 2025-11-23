import ExcelJS from 'exceljs';

/**
 * Export grades to Excel with school format
 * @param {Object} sectionData - Section and student data
 * @param {Array} assessmentHeaders - Assessment column headers
 * @param {Array} students - Student grades data
 */
export const exportGradesExcel = async (
  sectionData,
  assessmentHeaders,
  students
) => {
  try {
    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Điểm');

    // Prepare header info
    const courseName = sectionData?.courseName || 'Tên môn học';
    const sectionCode = sectionData?.sectionCode || 'Mã lớp';
    const semester = sectionData?.semester || 'HK1';
    const academicYear = sectionData?.academicYear || '2025-2026';
    const className = sectionData?.className || 'DHHTTT19BTT';

    // Group assessments by type
    const ltAssessments = assessmentHeaders.filter(
      (a) => a.assessmentTypeId === 1
    );
    const thAssessments = assessmentHeaders.filter(
      (a) => a.assessmentTypeId === 2
    );
    const giuaKyAssessment = assessmentHeaders.find(
      (a) => a.assessmentTypeId === 3
    );
    const cuoiKyAssessment = assessmentHeaders.find(
      (a) => a.assessmentTypeId === 4
    );
    const totalAssessments = ltAssessments.length + thAssessments.length;

    // Calculate total columns
    const totalCols =
      5 + // STT, Mã số, Họ đệm, Tên, Lớp học
      totalAssessments +
      (giuaKyAssessment ? 1 : 0) +
      (cuoiKyAssessment ? 1 : 0) +
      2; // Điểm TB, Xếp loại

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
    row5.getCell(1).value = 'DANH SÁCH ĐIỂM SINH VIÊN';
    row5.getCell(1).font = { bold: true, size: 16 };
    row5.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row5.height = 25;
    worksheet.mergeCells(5, 1, 5, totalCols);

    // === ROW 6-9: Info - mỗi dòng 1 row riêng, merge theo column (không có border) ===

    // Row 6: Môn thi
    const row6 = worksheet.getRow(6);
    row6.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Môn thi:' }],
    };
    row6.getCell(2).value = courseName;
    worksheet.mergeCells(6, 2, 6, totalCols);
    row6.height = 20;

    // Row 7: Học kỳ
    const row7 = worksheet.getRow(7);
    row7.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Học kỳ:' }],
    };
    row7.getCell(2).value = `${semester} (${academicYear})`;
    worksheet.mergeCells(7, 2, 7, totalCols);
    row7.height = 20;

    // Row 8: Lớp học phần
    const row8 = worksheet.getRow(8);
    row8.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Lớp học phần:' }],
    };
    row8.getCell(2).value = sectionCode;
    worksheet.mergeCells(8, 2, 8, totalCols);
    row8.height = 20;

    // Row 9: Lớp học và Niên học
    const row9 = worksheet.getRow(9);
    row9.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Lớp học:' }],
    };
    row9.getCell(2).value = className;
    row9.getCell(3).value = {
      richText: [{ font: { bold: true }, text: 'Niên học:' }],
    };
    row9.getCell(4).value = academicYear;
    row9.height = 20;

    // Set alignment và font cho tất cả rows info
    [row6, row7, row8, row9].forEach((row) => {
      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        if (!cell.value) cell.value = '';
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.font = { size: 12 };
      }
    });

    // Xóa border cho tất cả cells trong phần info (rows 1-9)
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= totalCols; c++) {
        const cell = worksheet.getRow(r).getCell(c);
        cell.border = {}; // Xóa border
      }
    }

    // Row 10-12: Table headers (3 rows)
    const headerRow1 = worksheet.getRow(10);
    const headerRow2 = worksheet.getRow(11);
    const headerRow3 = worksheet.getRow(12);

    // Basic headers (merged across 3 rows)
    const basicHeaders = [
      { text: 'STT', col: 1 },
      { text: 'Mã số', col: 2 },
      { text: 'Họ đệm', col: 3 },
      { text: 'Tên', col: 4 },
      { text: 'Lớp học', col: 5 },
    ];

    basicHeaders.forEach((header) => {
      headerRow1.getCell(header.col).value = header.text;
      worksheet.mergeCells(10, header.col, 12, header.col);
    });

    let currentCol = 6; // Start after "Lớp học"

    // Điểm GKTH header (if there are assessments)
    if (ltAssessments.length > 0 || thAssessments.length > 0) {
      const totalSubCols = ltAssessments.length + thAssessments.length;
      headerRow1.getCell(currentCol).value = 'Điểm GKTH';
      worksheet.mergeCells(10, currentCol, 10, currentCol + totalSubCols - 1);

      // Lý thuyết sub-header
      if (ltAssessments.length > 0) {
        headerRow2.getCell(currentCol).value = 'Lý thuyết';
        worksheet.mergeCells(
          11,
          currentCol,
          11,
          currentCol + ltAssessments.length - 1
        );

        // Column numbers for LT
        for (let i = 0; i < ltAssessments.length; i++) {
          headerRow3.getCell(currentCol + i).value = `${i + 1}`;
        }
        currentCol += ltAssessments.length;
      }

      // Thực hành sub-header
      if (thAssessments.length > 0) {
        headerRow2.getCell(currentCol).value = 'Thực hành';
        worksheet.mergeCells(
          11,
          currentCol,
          11,
          currentCol + thAssessments.length - 1
        );

        // Column numbers for TH
        for (let i = 0; i < thAssessments.length; i++) {
          headerRow3.getCell(currentCol + i).value = `${i + 1}`;
        }
        currentCol += thAssessments.length;
      }
    }

    // Điểm thi GK (merged across 3 rows)
    if (giuaKyAssessment) {
      headerRow1.getCell(currentCol).value = 'Điểm thi GK';
      worksheet.mergeCells(10, currentCol, 12, currentCol);
      currentCol++;
    }

    // Điểm thi CK (merged across 3 rows)
    if (cuoiKyAssessment) {
      headerRow1.getCell(currentCol).value = 'Điểm thi CK';
      worksheet.mergeCells(10, currentCol, 12, currentCol);
      currentCol++;
    }

    // Điểm TB (merged across 3 rows)
    headerRow1.getCell(currentCol).value = 'Điểm TB';
    worksheet.mergeCells(10, currentCol, 12, currentCol);
    currentCol++;

    // Xếp loại (merged across 3 rows)
    headerRow1.getCell(currentCol).value = 'Xếp loại';
    worksheet.mergeCells(10, currentCol, 12, currentCol);

    // Style header rows
    [headerRow1, headerRow2, headerRow3].forEach((row) => {
      row.height = 25;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= totalCols) {
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
        }
      });
    });

    // Add student data rows
    students.forEach((student, index) => {
      const rowNum = 13 + index;
      const dataRow = worksheet.getRow(rowNum);

      // Basic info
      dataRow.getCell(1).value = index + 1;
      dataRow.getCell(2).value = student.studentCode || '';
      dataRow.getCell(3).value = student.lastName || '';
      dataRow.getCell(4).value =
        student.firstName || student.fullName?.split(' ').pop() || '';
      dataRow.getCell(5).value = student.className || sectionCode;

      let col = 6;

      // LT assessment scores
      ltAssessments.forEach((assessment) => {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === assessment.assessmentId
        );
        dataRow.getCell(col).value =
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score)
            : '';
        col++;
      });

      // TH assessment scores
      thAssessments.forEach((assessment) => {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === assessment.assessmentId
        );
        dataRow.getCell(col).value =
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score)
            : '';
        col++;
      });

      // Giữa kỳ score
      if (giuaKyAssessment) {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === giuaKyAssessment.assessmentId
        );
        dataRow.getCell(col).value =
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score)
            : '';
        col++;
      }

      // Cuối kỳ score
      if (cuoiKyAssessment) {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === cuoiKyAssessment.assessmentId
        );
        dataRow.getCell(col).value =
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score)
            : '';
        col++;
      }

      // Final score
      dataRow.getCell(col).value =
        student.finalScore !== null && student.finalScore !== undefined
          ? parseFloat(student.finalScore)
          : '';
      col++;

      // Grade letter
      dataRow.getCell(col).value = student.gradeLetter || '';

      // Style data row
      dataRow.height = 20;
      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= totalCols) {
          // Number formatting
          if (colNumber >= 6 && colNumber <= totalCols - 1 && cell.value) {
            cell.numFmt = '0.00';
          }

          cell.alignment = {
            horizontal:
              colNumber === 1 || colNumber === 2 || colNumber >= 6
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
        }
      });
    });

    // Set column widths
    const colWidths = [
      5, // STT
      12, // Mã số
      15, // Họ đệm
      10, // Tên
      15, // Lớp học
    ];

    // Add widths for assessment columns
    for (let i = 0; i < totalAssessments; i++) {
      colWidths.push(8);
    }

    if (giuaKyAssessment) colWidths.push(10);
    if (cuoiKyAssessment) colWidths.push(10);
    colWidths.push(10); // Điểm TB
    colWidths.push(10); // Xếp loại

    colWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Generate file name
    const fileName = `diem-${sectionCode}-${new Date().getTime()}.xlsx`;

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
    console.error('Error exporting grades Excel:', error);
    return { success: false, error: error.message };
  }
};
