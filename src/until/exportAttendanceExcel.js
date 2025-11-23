import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

/**
 * Tạo danh sách các ngày học dựa vào lịch học
 */
const generateScheduleDates = (startDate, endDate, schedules) => {
  const dates = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  const scheduleDays = schedules.map((s) => s.dayOfWeek);

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const dayOfWeek = current.day();

    if (scheduleDays.includes(dayOfWeek)) {
      const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
      dates.push({
        date: current.format('DD/MM/YYYY'),
        dayText: schedule.dayOfWeekText,
        timeSlot: schedule.timeSlot,
      });
    }

    current = current.add(1, 'day');
  }

  return dates;
};

/**
 * Convert column number to Excel column letter (A, B, C, ..., Z, AA, AB, ...)
 */
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
 * Export attendance to Excel with full styling like the image
 */
export const exportAttendanceExcel = async (sectionData, students) => {
  try {
    // Create new workbook with ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách điểm danh');

    // Prepare info
    const courseName = sectionData?.courseName || '';
    const sectionCode = sectionData?.sectionCode || '';
    const className = sectionData?.className || '';

    // Generate schedule dates
    const sessions = generateScheduleDates(
      sectionData.startDate,
      sectionData.endDate,
      sectionData.schedules || []
    );

    // === ROW 1: Title ===
    const row1 = worksheet.getRow(1);
    row1.getCell(1).value = 'DANH SÁCH IMPORT ĐIỂM DANH LỚP HỌC PHẦN';
    row1.getCell(1).font = { bold: true, size: 16 };
    row1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row1.height = 25;

    // Merge row 1 (6 base columns + sessions + 5 summary columns)
    const totalCols = 6 + sessions.length + 5;
    worksheet.mergeCells(1, 1, 1, totalCols);

    // === ROW 2-6: Info - mỗi dòng 1 row riêng, merge theo column (không có border) ===

    // Row 2: Đợt
    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Đợt:' }] };
    row2.getCell(2).value = 'HK1 (2025 - 2026)';
    worksheet.mergeCells(2, 2, 2, totalCols);
    row2.height = 20;

    // Row 3: Cơ sở
    const row3 = worksheet.getRow(3);
    row3.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Cơ sở:' }] };
    row3.getCell(2).value = 'Cơ sở 1 (Thành phố Hồ Chí Minh)';
    worksheet.mergeCells(3, 2, 3, totalCols);
    row3.height = 20;

    // Row 4: Mã lớp học phần
    const row4 = worksheet.getRow(4);
    row4.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Mã lớp học phần:' }] };
    row4.getCell(2).value = sectionCode;
    worksheet.mergeCells(4, 2, 4, totalCols);
    row4.height = 20;

    // Row 5: Tên môn học
    const row5 = worksheet.getRow(5);
    row5.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Tên môn học:' }] };
    row5.getCell(2).value = `${courseName} (${sectionCode} - ${className})`;
    worksheet.mergeCells(5, 2, 5, totalCols);
    row5.height = 20;

    // Row 6: Lớp học và Nhóm
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
        cell.border = {}; // Xóa border
      }
    }

    // === ROW 7: Empty ===

    // === ROW 8-10: Table Header (3 rows) ===
    const headerRow1 = worksheet.getRow(8);
    const headerRow2 = worksheet.getRow(9);
    const headerRow3 = worksheet.getRow(10);

    // Base columns
    const baseHeaders = [
      'STT',
      'Mã sinh viên',
      'Họ đệm',
      'Tên',
      'Giới tính',
      'Ngày sinh',
    ];

    baseHeaders.forEach((header, idx) => {
      const cell = headerRow1.getCell(idx + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Merge 3 rows for base columns
      worksheet.mergeCells(8, idx + 1, 10, idx + 1);
    });

    // Session columns
    let colIndex = 7;
    sessions.forEach((session) => {
      // Row 1: Day + Time
      const cell1 = headerRow1.getCell(colIndex);
      cell1.value = `[${session.dayText}] - [${session.timeSlot}]`;
      cell1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell1.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell1.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell1.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Row 2: Date
      const cell2 = headerRow2.getCell(colIndex);
      cell2.value = session.date;
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

      // Row 3: (P/K)
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

    // Summary columns
    const summaryStartCol = 6 + sessions.length + 1;

    // "Tổng cộng" header - merge 5 columns (thêm cột Có mặt)
    const tongCongCell = headerRow1.getCell(summaryStartCol);
    tongCongCell.value = 'Tổng cộng';
    tongCongCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    tongCongCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    tongCongCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tongCongCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.mergeCells(8, summaryStartCol, 8, summaryStartCol + 4);

    const summaryHeaders = [
      { text: 'Có mặt', merge: true },
      { text: 'Vắng có\nphép', merge: true },
      { text: 'Vắng\nkhông', merge: true },
      { text: 'Tổng số\ntiết', merge: true },
      { text: '(%) vắng', merge: true },
    ];

    summaryHeaders.forEach((header, idx) => {
      const col = summaryStartCol + idx;

      const cell2 = headerRow2.getCell(col);
      cell2.value = header.text;
      cell2.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell2.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell2.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell2.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      if (header.merge) {
        worksheet.mergeCells(9, col, 10, col);
      }
    });

    headerRow1.height = 30;
    headerRow2.height = 25;
    headerRow3.height = 20;

    // === DATA ROWS: Students ===
    let rowNum = 11;
    students.forEach((student, index) => {
      const dataRow = worksheet.getRow(rowNum);

      const nameParts = (student.fullName || '').trim().split(' ');
      const lastName = nameParts[nameParts.length - 1] || '';
      const firstName = nameParts.slice(0, -1).join(' ') || '';

      const gender =
        student.gender === 'MALE'
          ? 'Nam'
          : student.gender === 'FEMALE'
            ? 'Nữ'
            : 'Khác';
      const dob = student.dateOfBirth
        ? dayjs(student.dateOfBirth).format('DD/MM/YYYY')
        : '';

      // Base columns
      dataRow.getCell(1).value = index + 1;
      dataRow.getCell(2).value = student.mssv || student.studentCode || '';
      dataRow.getCell(3).value = firstName;
      dataRow.getCell(4).value = lastName;
      dataRow.getCell(5).value = gender;
      dataRow.getCell(6).value = dob;

      // Session columns - để trống NHƯNG VẪN CÓ BORDER
      let sessionCol = 7;
      const sessionStartCol = 7;
      const sessionEndCol = 6 + sessions.length;

      sessions.forEach((session) => {
        const cell = dataRow.getCell(sessionCol);
        cell.value = ''; // Để trống để user nhập C/P/K
        sessionCol++;
      });

      // Summary columns với công thức Excel
      const totalSessions = sessions.length;
      const firstSessionCol = numberToColumnLetter(sessionStartCol);
      const lastSessionCol = numberToColumnLetter(sessionEndCol);

      // Cột "Có mặt" - đếm số ô có chữ "C"
      const coMatFormula = `COUNTIF(${firstSessionCol}${rowNum}:${lastSessionCol}${rowNum},"C")`;
      dataRow.getCell(summaryStartCol).value = { formula: coMatFormula };

      // Cột "Vắng có phép" - đếm số ô có chữ "P"
      const vangCoPhepFormula = `COUNTIF(${firstSessionCol}${rowNum}:${lastSessionCol}${rowNum},"P")`;
      dataRow.getCell(summaryStartCol + 1).value = {
        formula: vangCoPhepFormula,
      };

      // Cột "Vắng không phép" - đếm số ô có chữ "K"
      const vangKhongPhepFormula = `COUNTIF(${firstSessionCol}${rowNum}:${lastSessionCol}${rowNum},"K")`;
      dataRow.getCell(summaryStartCol + 2).value = {
        formula: vangKhongPhepFormula,
      };

      // Cột "Tổng số tiết"
      dataRow.getCell(summaryStartCol + 3).value = totalSessions * 2 || 60;

      // Cột "(%) vắng" - tính phần trăm vắng
      const tongTietCol = numberToColumnLetter(summaryStartCol + 3);
      const vangCoPhepCol = numberToColumnLetter(summaryStartCol + 1);
      const vangKhongCol = numberToColumnLetter(summaryStartCol + 2);
      const phanTramVangFormula = `IF(${tongTietCol}${rowNum}=0,0,ROUND((${vangCoPhepCol}${rowNum}+${vangKhongCol}${rowNum})/${tongTietCol}${rowNum}*100,2))`;
      dataRow.getCell(summaryStartCol + 4).value = {
        formula: phanTramVangFormula,
      };

      // Apply borders and alignment cho TẤT CẢ các cells
      for (let c = 1; c <= totalCols; c++) {
        const cell = dataRow.getCell(c);

        // TẤT CẢ cells đều có border
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

    // === SET COLUMN WIDTHS ===
    worksheet.getColumn(1).width = 5; // STT
    worksheet.getColumn(2).width = 12; // Mã SV
    worksheet.getColumn(3).width = 20; // Họ đệm
    worksheet.getColumn(4).width = 12; // Tên
    worksheet.getColumn(5).width = 10; // Giới tính
    worksheet.getColumn(6).width = 12; // Ngày sinh

    // Session columns
    for (let i = 0; i < sessions.length; i++) {
      worksheet.getColumn(7 + i).width = 12;
    }

    // Summary columns (5 cột)
    worksheet.getColumn(summaryStartCol).width = 10; // Có mặt
    worksheet.getColumn(summaryStartCol + 1).width = 10; // Vắng có phép
    worksheet.getColumn(summaryStartCol + 2).width = 10; // Vắng không
    worksheet.getColumn(summaryStartCol + 3).width = 10; // Tổng số tiết
    worksheet.getColumn(summaryStartCol + 4).width = 10; // (%) vắng

    // === EXPORT FILE ===
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = `Diem_danh_${sectionCode}_${className}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting attendance Excel:', error);
    return { success: false, error: error.message };
  }
};
