import ExcelJS from 'exceljs';

/**
 * Export section students list to Excel with school format
 * @param {Object} sectionData - Section information
 * @param {Array} students - Array of student objects
 * @param {String} scheduleType - 'Lý thuyết' or 'Thực hành'
 */
export const exportSectionStudentsExcel = async (
  sectionData,
  students,
  scheduleType = 'Lý thuyết'
) => {
  try {
    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Danh sách ${scheduleType}`);

    const totalCols = 4;

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
    row5.getCell(1).value = 'DANH SÁCH SINH VIÊN LỚP HỌC PHẦN';
    row5.getCell(1).font = { bold: true, size: 16 };
    row5.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row5.height = 25;
    worksheet.mergeCells(5, 1, 5, totalCols);

    // === ROW 6-10: Info ===
    // Row 6: Mã lớp
    const row6 = worksheet.getRow(6);
    row6.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Mã lớp:' }],
    };
    row6.getCell(2).value = `${sectionData?.sectionCode || ''} - ${sectionData?.courseName || ''}`;
    worksheet.mergeCells(6, 2, 6, totalCols);
    row6.height = 20;

    // Row 7: Mã môn học
    const row7 = worksheet.getRow(7);
    row7.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Mã môn học:' }],
    };
    row7.getCell(2).value = sectionData?.courseCode || '';
    worksheet.mergeCells(7, 2, 7, totalCols);
    row7.height = 20;

    // Row 8: Loại lớp
    const row8 = worksheet.getRow(8);
    row8.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Loại:' }],
    };
    row8.getCell(2).value = scheduleType;
    worksheet.mergeCells(8, 2, 8, totalCols);
    row8.height = 20;

    // Row 9: Học kỳ
    const row9 = worksheet.getRow(9);
    row9.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Học kỳ:' }],
    };
    row9.getCell(2).value = sectionData?.semesterName || '';
    worksheet.mergeCells(9, 2, 9, totalCols);
    row9.height = 20;

    // Row 10: Tổng số sinh viên
    const row10 = worksheet.getRow(10);
    row10.getCell(1).value = {
      richText: [{ font: { bold: true }, text: 'Tổng số sinh viên:' }],
    };
    row10.getCell(2).value = students.length;
    worksheet.mergeCells(10, 2, 10, totalCols);
    row10.height = 20;

    // Set alignment for info rows
    [row6, row7, row8, row9, row10].forEach((row) => {
      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        if (!cell.value) cell.value = '';
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.font = { size: 11 };
      }
    });

    // Remove borders for header rows
    for (let r = 1; r <= 10; r++) {
      for (let c = 1; c <= totalCols; c++) {
        worksheet.getRow(r).getCell(c).border = {};
      }
    }

    let currentRow = 11;

    // === Table Header ===
    const tableHeaderRow = worksheet.getRow(currentRow);
    const headers = ['STT', 'MSSV', 'Họ và tên', 'Trạng thái'];

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

    // === Data Rows ===
    students.forEach((student, index) => {
      const row = worksheet.getRow(currentRow);
      const rowData = [
        index + 1,
        student.mssv || student.studentId,
        student.fullName || student.studentName,
        student.enrollmentStatus || student.status || 'Đang học',
      ];

      rowData.forEach((data, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = data;
        cell.alignment = {
          horizontal: colIndex === 0 || colIndex === 3 ? 'center' : 'left',
          vertical: 'middle',
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      row.height = 20;
      currentRow++;
    });

    // Add empty row
    currentRow++;

    // === Footer ===
    const footerRowNum = currentRow;
    const footerRow = worksheet.getRow(footerRowNum);
    footerRow.getCell(1).value = `Tổng số sinh viên: ${students.length}`;
    footerRow.getCell(1).font = { bold: true };
    footerRow.height = 20;

    // Add signature row
    const signatureRowNum = footerRowNum + 2;
    const signatureRow = worksheet.getRow(signatureRowNum);
    signatureRow.getCell(3).value = 'Giảng viên';
    signatureRow.getCell(3).font = { bold: true, italic: true };
    signatureRow.getCell(3).alignment = { horizontal: 'center' };
    signatureRow.height = 20;

    // === Set Column Widths ===
    worksheet.getColumn(1).width = 8; // STT
    worksheet.getColumn(2).width = 15; // MSSV
    worksheet.getColumn(3).width = 30; // Họ và tên
    worksheet.getColumn(4).width = 15; // Trạng thái

    // Generate file name
    const fileName = `Danh_sach_${sectionData?.sectionCode || 'lop'}_${scheduleType}_${new Date().getTime()}.xlsx`;

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
    console.error('Error exporting section students Excel:', error);
    return { success: false, error: error.message };
  }
};
