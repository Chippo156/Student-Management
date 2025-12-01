import ExcelJS from 'exceljs';

/**
 * Export exam eligibility list to Excel with school format
 * @param {Object} examData - Exam list data containing students and exam info
 */
export const exportExamListExcel = async (examData) => {
  try {
    if (!examData || !examData.students) {
      return { success: false, error: 'No data to export' };
    }

    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách dự thi');

    // Calculate total columns dynamically based on assessment types
    const sampleStudent = examData.students[0];
    const assessmentColumns = sampleStudent?.currentGrades?.length || 0;
    const totalCols = 8 + assessmentColumns; // STT, MSSV, Name, Class, Email, Phone, Eligible, Reason + assessments

    // === ROW 1-4: Header truyền thống ===
    const row1 = worksheet.getRow(1);
    row1.getCell(1).value = 'BỘ CÔNG THƯƠNG';
    const midCol = Math.ceil(totalCols / 2);
    row1.getCell(midCol).value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
    worksheet.mergeCells(1, 1, 1, midCol - 1);
    worksheet.mergeCells(1, midCol, 1, totalCols);
    row1.height = 20;
    row1.alignment = { horizontal: 'center', vertical: 'middle' };
    row1.font = { bold: true, size: 11 };

    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM';
    row2.getCell(midCol).value = 'Độc lập - Tự do - Hạnh phúc';
    worksheet.mergeCells(2, 1, 2, midCol - 1);
    worksheet.mergeCells(2, midCol, 2, totalCols);
    row2.height = 20;
    row2.alignment = { horizontal: 'center', vertical: 'middle' };
    row2.font = { bold: true, size: 11 };

    const row3 = worksheet.getRow(3);
    row3.getCell(1).value = '_______________';
    row3.getCell(midCol).value = '_______________';
    worksheet.mergeCells(3, 1, 3, midCol - 1);
    worksheet.mergeCells(3, midCol, 3, totalCols);
    row3.height = 20;
    row3.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.getRow(4).height = 15;

    // === ROW 5: Title ===
    const row5 = worksheet.getRow(5);
    row5.getCell(1).value = 'DANH SÁCH DỰ THI';
    row5.getCell(1).font = { bold: true, size: 16 };
    row5.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row5.height = 25;
    worksheet.mergeCells(5, 1, 5, totalCols);

    // === ROW 6-9: Info ===
    const row6 = worksheet.getRow(6);
    row6.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Mã lớp:' }],
    };
    row6.getCell(2).value = `${examData.sectionCode || ''} - ${examData.courseName || ''}`;
    worksheet.mergeCells(6, 2, 6, totalCols);
    row6.height = 20;

    const row7 = worksheet.getRow(7);
    row7.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Học kỳ:' }],
    };
    row7.getCell(2).value = examData.semesterName || '';
    worksheet.mergeCells(7, 2, 7, totalCols);
    row7.height = 20;

    const row8 = worksheet.getRow(8);
    row8.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Ngày xuất:' }],
    };
    row8.getCell(2).value = new Date().toLocaleDateString('vi-VN');
    worksheet.mergeCells(8, 2, 8, totalCols);
    row8.height = 20;

    const row9 = worksheet.getRow(9);
    row9.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Tổng số sinh viên:' }],
    };
    row9.getCell(2).value = examData.students.length;
    worksheet.mergeCells(9, 2, 9, totalCols);
    row9.height = 20;

    // Set alignment for info rows
    [row6, row7, row8, row9].forEach((row) => {
      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        if (!cell.value) cell.value = '';
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.font = { size: 11 };
      }
    });

    // Remove borders for header rows
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= totalCols; c++) {
        worksheet.getRow(r).getCell(c).border = {};
      }
    }

    let currentRow = 10;

    // === Table Header ===
    const tableHeaderRow = worksheet.getRow(currentRow);
    const baseHeaders = [
      'STT',
      'MSSV',
      'Họ và tên',
      'Lớp',
      'Email',
      'SĐT',
    ];

    // Add assessment columns
    const assessmentHeaders = [];
    if (sampleStudent?.currentGrades) {
      sampleStudent.currentGrades.forEach((grade) => {
        assessmentHeaders.push(`${grade.assessmentType}\n(${grade.weight}%)`);
      });
    }

    const endHeaders = ['Đủ ĐK', 'Lý do'];
    const allHeaders = [...baseHeaders, ...assessmentHeaders, ...endHeaders];

    allHeaders.forEach((header, index) => {
      const cell = tableHeaderRow.getCell(index + 1);
      cell.value = header;
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
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
    tableHeaderRow.height = 35;
    currentRow++;

    // === Data Rows ===
    examData.students.forEach((student, index) => {
      const row = worksheet.getRow(currentRow);
      const rowData = [
        index + 1,
        student.mssv || '',
        student.studentName || '',
        student.className || '',
        student.email || '',
        student.phone || '',
      ];

      // Add assessment scores
      if (student.currentGrades) {
        student.currentGrades.forEach((grade) => {
          rowData.push(grade.score || '');
        });
      } else {
        // Fill with empty values if no grades
        for (let i = 0; i < assessmentColumns; i++) {
          rowData.push('');
        }
      }

      // Add eligibility
      rowData.push(student.isEligible ? 'Có' : 'Không');
      rowData.push(student.eligibilityReason || '');

      rowData.forEach((data, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = data;
        cell.alignment = {
          horizontal: colIndex === 0 ? 'center' : 'left',
          vertical: 'middle',
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        // Highlight ineligible students
        if (!student.isEligible) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFCCCC' }, // Light red
          };
        }
      });
      row.height = 20;
      currentRow++;
    });

    // === Set Column Widths ===
    worksheet.getColumn(1).width = 6;   // STT
    worksheet.getColumn(2).width = 12;  // MSSV
    worksheet.getColumn(3).width = 25;  // Họ và tên
    worksheet.getColumn(4).width = 12;  // Lớp
    worksheet.getColumn(5).width = 30;  // Email
    worksheet.getColumn(6).width = 15;  // SĐT

    // Assessment columns
    for (let i = 0; i < assessmentColumns; i++) {
      worksheet.getColumn(7 + i).width = 12;
    }

    worksheet.getColumn(7 + assessmentColumns).width = 10; // Đủ ĐK
    worksheet.getColumn(8 + assessmentColumns).width = 30; // Lý do

    // Add summary row
    currentRow++;
    const summaryRow = worksheet.getRow(currentRow);
    const eligibleCount = examData.students.filter(s => s.isEligible).length;
    const ineligibleCount = examData.students.length - eligibleCount;

    summaryRow.getCell(1).value = {
      richText: [{ font: { bold: true }, text: `Đủ điều kiện: ${eligibleCount} | Không đủ: ${ineligibleCount}` }],
    };
    summaryRow.getCell(1).font = { bold: true, size: 11 };
    summaryRow.height = 25;

    // Add signature section
    currentRow += 2;
    const signatureRow = worksheet.getRow(currentRow);
    signatureRow.getCell(totalCols - 2).value = 'Giảng viên';
    signatureRow.getCell(totalCols - 2).font = { bold: true, italic: true };
    signatureRow.getCell(totalCols - 2).alignment = { horizontal: 'center' };
    signatureRow.height = 20;

    // Generate file name
    const fileName = `Danh_sach_du_thi_${examData.sectionCode || 'exam'}_${new Date().getTime()}.xlsx`;

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
    console.error('Error exporting exam list Excel:', error);
    return { success: false, error: error.message };
  }
};
