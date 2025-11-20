import * as XLSX from 'xlsx';
import logoPath from '../assets/images/logo.png';

/**
 * Export grades to Excel with school format
 * @param {Object} sectionData - Section and student data
 * @param {Array} assessmentHeaders - Assessment column headers
 * @param {Array} students - Student grades data
 */
export const exportGradesExcel = (sectionData, assessmentHeaders, students) => {
  try {
    // Create new workbook
    const wb = XLSX.utils.book_new();

    // Prepare header info
    const schoolName = 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM';
    const courseName = sectionData?.courseName || 'Tên môn học';
    const sectionCode = sectionData?.sectionCode || 'Mã lớp';
    const semester = sectionData?.semester || 'HK1';
    const academicYear = sectionData?.academicYear || '2025-2026';
    const className = sectionData?.className || 'DHHTTT19BTT';

    // Create worksheet data array
    const wsData = [];

    // Row 1: School name (left) and motto (right)
    const row1 = ['BỘ CÔNG THƯƠNG'];
    // Fill with empty cells
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

    // Row 5: Title - "DANH SÁCH ĐIỂM SINH VIÊN" (centered across full table)
    wsData.push(['DANH SÁCH ĐIỂM SINH VIÊN']);

    // Row 6: Empty
    wsData.push([]);

    // Group assessments by type (need this before creating course info rows)
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

    // Row 7-8: Course info (simplified structure without Phòng and Ngày thi)
    const row7 = [
      'Môn thi',
      courseName,
      '',
      '',
      'Học kỳ',
      `${semester} (${academicYear})`,
      '',
      '',
      'Lớp học phần',
      sectionCode,
    ];
    wsData.push(row7);

    const row8 = [
      'Lớp học',
      className,
      '',
      '',
      '',
      '',
      '',
      '',
      'Niên học',
      academicYear,
    ];
    wsData.push(row8);

    // Row 11: Empty
    wsData.push([]);

    // Row 12: Table header row 1 (merged cells for assessment groups)
    const header1 = ['STT', 'Mã số', 'Họ đệm', 'Tên', 'Lớp học'];

    // Add "Điểm GKTH" header if there are regular assessments
    if (ltAssessments.length > 0 || thAssessments.length > 0) {
      header1.push('Điểm GKTH');
      // Add empty cells for sub-columns
      for (let i = 1; i < ltAssessments.length + thAssessments.length; i++) {
        header1.push('');
      }
    }

    if (giuaKyAssessment) {
      header1.push('Điểm thi GK');
    }

    if (cuoiKyAssessment) {
      header1.push('Điểm thi CK');
    }

    header1.push('Điểm TB');
    header1.push('Xếp loại');

    wsData.push(header1);

    // Row 13: Table header row 2 (sub-columns for LT and TH)
    const header2 = ['', '', '', '', ''];

    if (ltAssessments.length > 0 || thAssessments.length > 0) {
      // Add "Lý thuyết" header
      if (ltAssessments.length > 0) {
        header2.push('Lý thuyết');
        for (let i = 1; i < ltAssessments.length; i++) {
          header2.push('');
        }
      }

      // Add "Thực hành" header
      if (thAssessments.length > 0) {
        header2.push('Thực hành');
        for (let i = 1; i < thAssessments.length; i++) {
          header2.push('');
        }
      }
    }

    if (giuaKyAssessment) {
      header2.push('');
    }

    if (cuoiKyAssessment) {
      header2.push('');
    }

    header2.push('');
    header2.push('');

    wsData.push(header2);

    // Row 14: Table header row 3 (column numbers: 1, 2, 3 for LT/TH)
    const header3 = ['', '', '', '', ''];

    // Add LT column numbers
    for (let i = 0; i < ltAssessments.length; i++) {
      header3.push(`${i + 1}`);
    }

    // Add TH column numbers
    for (let i = 0; i < thAssessments.length; i++) {
      header3.push(`${i + 1}`);
    }

    if (giuaKyAssessment) {
      header3.push('');
    }

    if (cuoiKyAssessment) {
      header3.push('');
    }

    header3.push('');
    header3.push('');
    header3.push('');

    wsData.push(header3);

    // Add student rows
    students.forEach((student, index) => {
      const row = [
        index + 1,
        student.studentCode || '',
        student.lastName || '', // Họ đệm
        student.firstName || student.fullName?.split(' ').pop() || '', // Tên
        student.className || sectionCode,
      ];

      // Add all assessment scores in order (LT first, then TH)
      ltAssessments.forEach((assessment) => {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === assessment.assessmentId
        );
        row.push(
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score).toFixed(2)
            : ''
        );
      });

      thAssessments.forEach((assessment) => {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === assessment.assessmentId
        );
        row.push(
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score).toFixed(2)
            : ''
        );
      });

      // Add Giữa kỳ score
      if (giuaKyAssessment) {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === giuaKyAssessment.assessmentId
        );
        row.push(
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score).toFixed(2)
            : ''
        );
      }

      // Add Cuối kỳ score
      if (cuoiKyAssessment) {
        const grade = student.assessmentGrades?.find(
          (g) => g.assessmentId === cuoiKyAssessment.assessmentId
        );
        row.push(
          grade?.score !== null && grade?.score !== undefined
            ? parseFloat(grade.score).toFixed(2)
            : ''
        );
      }

      // Add final score and grade letter
      row.push(
        student.finalScore !== null && student.finalScore !== undefined
          ? parseFloat(student.finalScore).toFixed(2)
          : ''
      );
      row.push(student.gradeLetter || '');

      wsData.push(row);
    });

    // Create worksheet from array
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
      { wch: 5 }, // STT
      { wch: 12 }, // Mã số
      { wch: 15 }, // Họ đệm
      { wch: 10 }, // Tên
      { wch: 40 }, // Lớp học
    ];

    // Add widths for assessment columns (Lần 1, Lần 2, ...)
    for (let i = 0; i < totalAssessments; i++) {
      colWidths.push({ wch: 8 });
    }

    if (giuaKyAssessment) colWidths.push({ wch: 10 }); // Điểm thi GK
    if (cuoiKyAssessment) colWidths.push({ wch: 10 }); // Điểm thi CK
    colWidths.push({ wch: 10 }); // Điểm TB
    colWidths.push({ wch: 10 }); // Xếp loại

    ws['!cols'] = colWidths;

    // Calculate total columns for proper merging
    const totalColumns =
      5 +
      totalAssessments +
      (giuaKyAssessment ? 1 : 0) +
      (cuoiKyAssessment ? 1 : 0) +
      2; // STT + Mã số + Họ đệm + Tên + Lớp học + assessments + GK + CK + ĐTB + Xếp loại
    const lastCol = totalColumns - 1;

    // Merge cells for headers
    const merges = [
      // Row 1: BỘ CÔNG THƯƠNG (merge to column 4 - Lớp học)
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      // Row 1: CỘNG HÒA XÃ HỘI... (merge from column 5 to end)
      { s: { r: 0, c: 5 }, e: { r: 0, c: lastCol } },

      // Row 2: School name (merge to column 4 - Lớp học)
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      // Row 2: Độc lập... (merge from column 5 to end)
      { s: { r: 1, c: 5 }, e: { r: 1, c: lastCol } },

      // Row 3: Separator lines
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: lastCol } },

      // Row 5: Title - DANH SÁCH ĐIỂM SINH VIÊN (merge across full table)
      { s: { r: 4, c: 0 }, e: { r: 4, c: lastCol } },

      // Row 7: Course info merges
      { s: { r: 6, c: 1 }, e: { r: 6, c: 3 } }, // Môn thi value
      { s: { r: 6, c: 5 }, e: { r: 6, c: 7 } }, // Học kỳ value
      { s: { r: 6, c: 9 }, e: { r: 6, c: lastCol } }, // Lớp học phần value

      // Row 8: Class info merges
      { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } }, // Lớp học value
      { s: { r: 7, c: 8 }, e: { r: 7, c: lastCol } }, // Niên học value,

      // Table header merges (rows 9, 10, 11 - 3 header rows)
      { s: { r: 9, c: 0 }, e: { r: 11, c: 0 } }, // STT
      { s: { r: 9, c: 1 }, e: { r: 11, c: 1 } }, // Mã số
      { s: { r: 9, c: 2 }, e: { r: 11, c: 2 } }, // Họ đệm
      { s: { r: 9, c: 3 }, e: { r: 11, c: 3 } }, // Tên
      { s: { r: 9, c: 4 }, e: { r: 11, c: 4 } }, // Lớp học
    ];

    let currentCol = 5; // Bắt đầu sau cột "Lớp học"

    // Merge "Điểm GKTH" nếu có
    if (ltAssessments.length > 0 || thAssessments.length > 0) {
      const totalCols = ltAssessments.length + thAssessments.length;
      // Merge header "Điểm GKTH" ở row 9
      merges.push({
        s: { r: 9, c: currentCol },
        e: { r: 9, c: currentCol + totalCols - 1 },
      });

      // Merge "Lý thuyết" header ở row 10
      if (ltAssessments.length > 0) {
        merges.push({
          s: { r: 10, c: currentCol },
          e: { r: 10, c: currentCol + ltAssessments.length - 1 },
        });
        currentCol += ltAssessments.length;
      }

      // Merge "Thực hành" header ở row 10
      if (thAssessments.length > 0) {
        merges.push({
          s: { r: 10, c: currentCol },
          e: { r: 10, c: currentCol + thAssessments.length - 1 },
        });
        currentCol += thAssessments.length;
      }
    }

    // Merge Điểm thi GK (3 rows)
    if (giuaKyAssessment) {
      merges.push({ s: { r: 9, c: currentCol }, e: { r: 11, c: currentCol } });
      currentCol++;
    }

    // Merge Điểm thi CK (3 rows)
    if (cuoiKyAssessment) {
      merges.push({ s: { r: 9, c: currentCol }, e: { r: 11, c: currentCol } });
      currentCol++;
    }

    // Merge Điểm TB (3 rows)
    merges.push({ s: { r: 9, c: currentCol }, e: { r: 11, c: currentCol } });
    currentCol++;

    // Merge Xếp loại (3 rows)
    merges.push({ s: { r: 9, c: currentCol }, e: { r: 11, c: currentCol } });
    ws['!merges'] = merges;

    // Add styling (borders, alignment, etc.) using cell properties
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Define border style
    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    };

    const thickBorder = {
      top: { style: 'medium', color: { rgb: '000000' } },
      bottom: { style: 'medium', color: { rgb: '000000' } },
      left: { style: 'medium', color: { rgb: '000000' } },
      right: { style: 'medium', color: { rgb: '000000' } },
    };

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }

        const cell = ws[cellAddress];

        // Header section (rows 0-9)
        if (R <= 9) {
          cell.s = {
            alignment: {
              horizontal: R === 0 || R === 1 || R === 2 ? 'center' : 'left',
              vertical: 'center',
              wrapText: true,
            },
            font: {
              bold: R === 0 || R === 1 || R === 4,
              size: R === 4 ? 14 : 11,
            },
          };
        }

        // Table header rows (9-11) - 3 rows of headers
        if (R >= 9 && R <= 11) {
          cell.s = {
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: true,
            },
            font: { bold: true, size: 11, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4472C4' } }, // Blue theme color
            border: thinBorder,
          };
        }

        // Data rows (12+)
        if (R > 11) {
          cell.s = {
            alignment: {
              horizontal: C === 0 || C === 1 || C >= 5 ? 'center' : 'left', // STT, MSSV, scores centered
              vertical: 'center',
            },
            border: thinBorder,
          };
        }
      }
    }

    // Set row heights
    const rowHeights = [];
    for (let i = 0; i < 9; i++) {
      rowHeights.push({ hpt: 18 });
    }
    // Header rows (3 rows)
    rowHeights.push({ hpt: 25 }); // Row 9 - Điểm GKTH, Điểm thi GK/CK, etc.
    rowHeights.push({ hpt: 20 }); // Row 10 - Lý thuyết, Thực hành
    rowHeights.push({ hpt: 20 }); // Row 11 - 1, 2, 3...

    ws['!rows'] = rowHeights;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm');

    // Generate file name
    const fileName = `diem-${sectionCode}-${new Date().getTime()}.xlsx`;

    // Export file
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting grades Excel:', error);
    return { success: false, error: error.message };
  }
};
