import ExcelJS from 'exceljs';

/**
 * Export users/accounts list to Excel with school format
 * @param {Array} users - Array of user objects
 * @param {String} filters - Optional filter description
 */
export const exportUsersExcel = async (users, filters = '') => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách tài khoản');
    const totalCols = 7;

    // Header
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

    const row5 = worksheet.getRow(5);
    row5.getCell(1).value = 'DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG';
    row5.getCell(1).font = { bold: true, size: 16 };
    row5.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row5.height = 25;
    worksheet.mergeCells(5, 1, 5, totalCols);

    const row6 = worksheet.getRow(6);
    row6.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Ngày xuất:' }] };
    row6.getCell(2).value = new Date().toLocaleDateString('vi-VN');
    worksheet.mergeCells(6, 2, 6, totalCols);
    row6.height = 20;

    if (filters) {
      const row7 = worksheet.getRow(7);
      row7.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Bộ lọc:' }] };
      row7.getCell(2).value = filters;
      worksheet.mergeCells(7, 2, 7, totalCols);
      row7.height = 20;
    }

    const row8 = worksheet.getRow(8);
    row8.getCell(1).value = { richText: [{ font: { bold: true }, text: 'Tổng số tài khoản:' }] };
    row8.getCell(2).value = users.length;
    worksheet.mergeCells(8, 2, 8, totalCols);
    row8.height = 20;

    [row6, row8].forEach((row) => {
      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        if (!cell.value) cell.value = '';
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.font = { size: 11 };
      }
    });

    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= totalCols; c++) {
        worksheet.getRow(r).getCell(c).border = {};
      }
    }

    let currentRow = 9;
    const tableHeaderRow = worksheet.getRow(currentRow);
    const headers = ['STT', 'Tên đăng nhập', 'Họ và tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái'];

    headers.forEach((header, index) => {
      const cell = tableHeaderRow.getCell(index + 1);
      cell.value = header;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    tableHeaderRow.height = 25;
    currentRow++;

    const getStatusText = (status) => (status === 1 ? 'Hoạt động' : 'Bị khóa');

    users.forEach((user, index) => {
      const row = worksheet.getRow(currentRow);
      const rowData = [
        index + 1,
        user.username || '',
        user.fullName || '',
        user.email || '',
        user.phone || '',
        user.role?.roleName || '',
        getStatusText(user.accountStatus),
      ];

      rowData.forEach((data, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = data;
        cell.alignment = { horizontal: colIndex === 0 ? 'center' : 'left', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      row.height = 20;
      currentRow++;
    });

    worksheet.getColumn(1).width = 6;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 25;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 12;

    const fileName = `Danh_sach_tai_khoan_${new Date().getTime()}.xlsx`;

    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting users Excel:', error);
    return { success: false, error: error.message };
  }
};
