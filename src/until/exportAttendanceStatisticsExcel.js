import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

// Helper function to convert column number to letter
const numberToColumnLetter = (num) => {
  let letter = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
};

/**
 * Export attendance statistics to Excel from API response
 * @param {Object} apiResponse - API response containing section, sessions, and student data
 */
export const exportAttendanceAllStatisticsExcel = async (apiResponse) => {
  // Extract data from API response structure
  const data = apiResponse.data || apiResponse;
  const sectionData = {
    sectionCode: data.sectionCode,
    courseName: data.courseName,
    courseCode: data.courseCode,
    className: '', // Will be derived from student data
    semester: data.semesterName,
    lecturerName: data.lecturerName
  };
  const sessions = data.sessionHeaders || [];
  const students = data.studentRows || [];
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Điểm danh');

    const courseName = sectionData?.courseName || 'Tên môn học';
    const sectionCode = sectionData?.sectionCode || 'Mã lớp';
    // Extract className from first student or use default
    const className = students.length > 0 ? students[0].className : (sectionData?.className || 'Lớp');
    const semester = sectionData?.semester || 'HK1';

    // === ROW 1: Title ===
    const row1 = worksheet.getRow(1);
    row1.getCell(1).value = 'DANH SÁCH IMPORT ĐIỂM DANH LỚP HỌC PHẦN';
    row1.getCell(1).font = { bold: true, size: 16 };
    row1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row1.height = 25;

    // Merge row 1 (6 base columns + sessions + 5 summary columns)
    const totalCols = 6 + sessions.length + 5;
    worksheet.mergeCells(1, 1, 1, totalCols);

    // === ROW 2-6: Info ===
    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Đợt:' }] };
    row2.getCell(2).value = `${semester} (2025 - 2026)`;
    worksheet.mergeCells(2, 2, 2, totalCols);
    row2.height = 20;

    const row3 = worksheet.getRow(3);
    row3.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Cơ sở:' }] };
    row3.getCell(2).value = 'Cơ sở 1 (Thành phố Hồ Chí Minh)';
    worksheet.mergeCells(3, 2, 3, totalCols);
    row3.height = 20;

    const row4 = worksheet.getRow(4);
    row4.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Mã lớp học phần:' }] };
    row4.getCell(2).value = sectionCode;
    worksheet.mergeCells(4, 2, 4, totalCols);
    row4.height = 20;

    const row5 = worksheet.getRow(5);
    row5.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Tên môn học:' }] };
    row5.getCell(2).value = `${courseName} (${sectionCode} - ${className})`;
    worksheet.mergeCells(5, 2, 5, totalCols);
    row5.height = 20;

    const row6 = worksheet.getRow(6);
    row6.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Lớp học:' }] };
    row6.getCell(2).value = className;
    row6.getCell(3).value = { richText: [{ font: { bold: true }, text: 'Nhóm' }] };
    row6.height = 20;

    // Set alignment và font cho tất cả rows info
    [row2, row3, row4, row5, row6].forEach(row => {
      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        if (!cell.value) cell.value = '';
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.font = { size: 12 };
      }
    });

    // Xóa border cho tất cả cells trong phần info (rows 1-6)
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= totalCols; c++) {
        const cell = worksheet.getRow(r).getCell(c);
        cell.border = {};
      }
    }

    // === ROW 7: Empty ===
    worksheet.getRow(7).height = 15;

    // === ROW 8-10: Table headers (3 rows) ===
    const headerRow1 = worksheet.getRow(8);
    const headerRow2 = worksheet.getRow(9);
    const headerRow3 = worksheet.getRow(10);

    // Base headers - simplified for API data structure
    const baseHeaders = [
      { text: 'STT', col: 1 },
      { text: 'MSSV', col: 2 },
      { text: 'Họ và tên', col: 3 },
      { text: 'Lớp', col: 4 },
      { text: 'Tỷ lệ điểm danh (%)', col: 5 },
      { text: 'Đánh giá', col: 6 },
    ];

    baseHeaders.forEach((header) => {
      const cell = headerRow1.getCell(header.col);
      cell.value = header.text;
      worksheet.mergeCells(8, header.col, 10, header.col);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
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

    // Session headers
    let colIndex = 7;
    sessions.forEach((session, index) => {
      // Row 1: Session name
      const cell1 = headerRow1.getCell(colIndex);
      cell1.value = session.sessionInfo || session.sessionName || `Buổi ${index + 1}`;
      cell1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell1.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell1.alignment = { horizontal: 'center', vertical: 'middle' };
      cell1.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Row 2: Session date
      const cell2 = headerRow2.getCell(colIndex);
      const sessionDate = session.sessionDate || session.sessionDateFormatted;
      cell2.value = sessionDate ? dayjs(sessionDate).format('DD/MM/YYYY') : '';
      cell2.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell2.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell2.alignment = { horizontal: 'center', vertical: 'middle' };
      cell2.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Row 3: (C/P/K)
      const cell3 = headerRow3.getCell(colIndex);
      cell3.value = '(C/P/K)';
      cell3.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell3.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell3.alignment = { horizontal: 'center', vertical: 'middle' };
      cell3.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      colIndex++;
    });

    // Summary headers - simplified to match requirements
    const summaryStartCol = 7 + sessions.length;
    const summaryHeaders = ['Có mặt', 'Có phép', 'Không phép', 'Tổng buổi'];

    summaryHeaders.forEach((header, index) => {
      const col = summaryStartCol + index;
      const cell = headerRow1.getCell(col);
      cell.value = header;
      worksheet.mergeCells(8, col, 10, col);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      // Use different colors for different summary types
      let fillColor = 'FF4472C4'; // Default blue
      if (header === 'Có mặt') fillColor = 'FF70AD47'; // Green
      else if (header === 'Có phép') fillColor = 'FFFFC000'; // Yellow
      else if (header === 'Không phép') fillColor = 'FFED7D31'; // Orange
      else if (header === 'Tổng buổi') fillColor = 'FF5B9BD5'; // Light blue

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fillColor },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    headerRow1.height = 25;
    headerRow2.height = 25;
    headerRow3.height = 25;

    // === Data rows ===
    let rowNum = 11;
    students.forEach((student, index) => {
      const dataRow = worksheet.getRow(rowNum);

      // Base columns - updated to match API structure
      dataRow.getCell(1).value = index + 1;
      dataRow.getCell(2).value = student.mssv || '';
      dataRow.getCell(3).value = student.studentName || '';
      dataRow.getCell(4).value = student.className || '';
      dataRow.getCell(5).value = student.attendanceRate || 0;
      dataRow.getCell(6).value = student.attendanceLevel || '';

      // Session columns - điền giá trị từ attendanceMatrix
      let sessionCol = 7;
      const sessionStartCol = 7;
      const sessionEndCol = 6 + sessions.length;

      sessions.forEach((session) => {
        const cell = dataRow.getCell(sessionCol);
        // Lấy trạng thái điểm danh từ attendanceMatrix bằng attendanceSessionId
        const attendanceData = student.attendanceMatrix?.[session.attendanceSessionId];
        if (attendanceData && attendanceData.status) {
          // Map to Vietnamese text: Có mặt, Có phép, Không phép
          let statusText = '';
          switch (attendanceData.status) {
            case 'Present':
              statusText = 'Có mặt';
              break;
            case 'Absent':
              statusText = 'Không phép';
              break;
            case 'Excused':
              statusText = 'Có phép';
              break;
            case 'Unknown':
            default:
              statusText = ''; // Unknown hoặc chưa điểm danh
          }
          cell.value = statusText;

          // Apply cell color based on status
          if (attendanceData.cellColor) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: attendanceData.cellColor.replace('#', 'FF') },
            };
          }
        } else {
          cell.value = '';
        }
        sessionCol++;
      });

      // Summary columns - simplified to match requirements
      dataRow.getCell(summaryStartCol).value = student.totalPresent || 0;           // Có mặt
      dataRow.getCell(summaryStartCol + 1).value = student.totalExcused || 0;        // Có phép
      dataRow.getCell(summaryStartCol + 2).value = student.totalAbsent || 0;        // Không phép
      dataRow.getCell(summaryStartCol + 3).value = (student.totalPresent || 0) + (student.totalAbsent || 0) + (student.totalLate || 0) + (student.totalExcused || 0); // Tổng buổi

      // Apply borders and alignment cho TẤT CẢ các cells
      for (let c = 1; c <= totalCols; c++) {
        const cell = dataRow.getCell(c);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          horizontal: c <= 2 || c >= summaryStartCol ? 'center' : 'left',
          vertical: 'middle',
        };
      }

      rowNum++;
    });

    // Add summary statistics section at the end
    const summaryRow = worksheet.getRow(rowNum + 2);
    summaryRow.getCell(1).value = 'Tổng kết:';
    summaryRow.getCell(1).font = { bold: true };
    summaryRow.getCell(2).value = `Tổng số sinh viên: ${data.totalStudents || students.length}`;
    summaryRow.getCell(4).value = `Tổng số buổi: ${data.totalSessions || sessions.length}`;
    summaryRow.getCell(5).value = `Tỷ lệ điểm danh trung bình: ${data.overallAttendanceRate || 0}%`;

    // Add export info
    const exportInfoRow = worksheet.getRow(rowNum + 3);
    exportInfoRow.getCell(1).value = `Người xuất: ${sectionData.lecturerName || 'N/A'}`;
    exportInfoRow.getCell(3).value = `Ngày xuất: ${data.exportedAt ? dayjs(data.exportedAt).format('DD/MM/YYYY HH:mm') : new Date().toLocaleString('vi-VN')}`;

    // Apply styling to summary rows
    [summaryRow, exportInfoRow].forEach(row => {
      for (let c = 1; c <= 6; c++) {
        const cell = row.getCell(c);
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE7E6E6' },
        };
      }
    });

    // Set column widths - updated for new structure
    worksheet.getColumn(1).width = 5;    // STT
    worksheet.getColumn(2).width = 12;   // MSSV
    worksheet.getColumn(3).width = 25;   // Họ và tên
    worksheet.getColumn(4).width = 15;   // Lớp
    worksheet.getColumn(5).width = 15;   // Tỷ lệ điểm danh
    worksheet.getColumn(6).width = 12;   // Đánh giá

    // Session columns
    for (let i = 0; i < sessions.length; i++) {
      worksheet.getColumn(7 + i).width = 12;
    }

    // Summary columns
    for (let i = 0; i < 4; i++) {
      worksheet.getColumn(summaryStartCol + i).width = 12;
    }

    // Generate file name
    const fileName = `diem-danh-${sectionCode}-${new Date().getTime()}.xlsx`;

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
    console.error('Error exporting attendance statistics Excel:', error);
    return { success: false, error: error.message };
  }
};
