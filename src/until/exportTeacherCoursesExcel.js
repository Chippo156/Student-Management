import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

/**
 * Export teacher courses list to Excel
 * @param {Array} courses - Array of section objects
 * @param {Object} options - Additional options like lecturer name
 */
export const exportTeacherCoursesExcel = async (courses, options = {}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách lớp học phần');

    const lecturerName = options.lecturerName || 'Giảng viên';
    const exportDate = dayjs().format('DD/MM/YYYY HH:mm');

    // === ROW 1: Title ===
    const row1 = worksheet.getRow(1);
    row1.getCell(1).value = 'DANH SÁCH LỚP HỌC PHẦN';
    row1.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF1976D2' } };
    row1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row1.height = 30;
    worksheet.mergeCells(1, 1, 1, 8);

    // === ROW 2: Lecturer info ===
    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = 'Giảng viên:';
    row2.getCell(1).font = { bold: true, size: 12 };
    row2.getCell(2).value = lecturerName;
    row2.getCell(2).font = { size: 12 };
    worksheet.mergeCells(2, 2, 2, 4);
    row2.height = 20;

    // === ROW 3: Export date ===
    const row3 = worksheet.getRow(3);
    row3.getCell(1).value = 'Ngày xuất:';
    row3.getCell(1).font = { bold: true, size: 12 };
    row3.getCell(2).value = exportDate;
    row3.getCell(2).font = { size: 12 };
    worksheet.mergeCells(3, 2, 3, 4);
    row3.height = 20;

    // === ROW 4: Total courses ===
    const row4 = worksheet.getRow(4);
    row4.getCell(1).value = 'Tổng số lớp:';
    row4.getCell(1).font = { bold: true, size: 12 };
    row4.getCell(2).value = courses.length;
    row4.getCell(2).font = { size: 12 };
    row4.height = 20;

    // Remove borders for info section
    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 8; c++) {
        const cell = worksheet.getRow(r).getCell(c);
        cell.border = {};
      }
    }

    // === ROW 5: Empty ===
    worksheet.getRow(5).height = 10;

    // === ROW 6: Table headers ===
    const headerRow = worksheet.getRow(6);
    const headers = [
      { text: 'STT', width: 6 },
      { text: 'Mã lớp HP', width: 15 },
      { text: 'Mã môn học', width: 12 },
      { text: 'Tên môn học', width: 35 },
      { text: 'Số sinh viên', width: 12 },
      { text: 'Học kỳ', width: 20 },
      { text: 'Trạng thái', width: 15 },
      { text: 'Thời gian', width: 20 },
    ];

    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header.text;
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' }, // Primary blue color
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Set column width
      worksheet.getColumn(index + 1).width = header.width;
    });
    headerRow.height = 25;

    // Helper function to get status text
    const getStatusText = (status) => {
      const statusMap = {
        0: 'Chưa bắt đầu',
        1: 'Đang diễn ra',
        2: 'Đã kết thúc',
        3: 'Đã hủy',
      };
      return statusMap[status] || 'Không xác định';
    };

    // === Data rows ===
    courses.forEach((section, index) => {
      const dataRow = worksheet.getRow(7 + index);

      // Format date range
      const startDate = section.startDate
        ? dayjs(section.startDate).format('DD/MM/YYYY')
        : '';
      const endDate = section.endDate
        ? dayjs(section.endDate).format('DD/MM/YYYY')
        : '';
      const dateRange =
        startDate && endDate ? `${startDate} - ${endDate}` : 'Chưa xác định';

      const rowData = [
        index + 1, // STT
        section.sectionCode || '', // Mã lớp HP
        section.courseCode || '', // Mã môn học
        section.courseName || '', // Tên môn học
        `${section.enrolledCount || 0}/${section.capacity || 0}`, // Số sinh viên
        section.semesterName || '', // Học kỳ
        getStatusText(section.status), // Trạng thái
        dateRange, // Thời gian
      ];

      rowData.forEach((value, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1);
        cell.value = value;
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
        cell.font = { size: 11 };

        // Color status cells
        if (colIndex === 6) {
          // Status column
          if (section.status === 1) {
            // Đang diễn ra
            cell.font = { size: 11, color: { argb: 'FF2E7D32' }, bold: true };
          } else if (section.status === 3) {
            // Đã hủy
            cell.font = { size: 11, color: { argb: 'FFD32F2F' }, bold: true };
          }
        }
      });

      dataRow.height = 20;
    });

    // === Footer ===
    const footerRow = worksheet.getRow(7 + courses.length);
    footerRow.getCell(1).value = `Tổng cộng: ${courses.length} lớp học phần`;
    footerRow.getCell(1).font = { bold: true, size: 11 };
    footerRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.mergeCells(
      7 + courses.length,
      1,
      7 + courses.length,
      8
    );
    footerRow.height = 25;

    // Remove border for footer
    for (let c = 1; c <= 8; c++) {
      footerRow.getCell(c).border = {};
    }

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `Danh_sach_lop_hoc_phan_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Xuất Excel thành công' };
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi xuất Excel',
    };
  }
};
