import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Fade,
  Grow,
  Snackbar,
  Alert,
} from '@mui/material';
import { Table, Tag } from 'antd';
import {
  Grade,
  TrendingUp,
  CheckCircle,
  Warning,
  FileDownload,
  FileUpload,
  Save,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { sectionService, gradeService } from '../../../service';

const GradesPage = () => {
  const theme = useTheme();
  const colors = useMemo(
    () => ({
      bgCard: theme.palette.background.paper,
      bgPage: theme.palette.background.default,
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      text: theme.palette.text.primary,
      textSecondary: theme.palette.text.secondary,
      border: theme.palette.divider,
      bgPrimarySoft: alpha(theme.palette.primary.main, 0.12),
      bgSuccessSoft: alpha(theme.palette.success.main, 0.12),
      bgWarningSoft: alpha(theme.palette.warning.main, 0.12),
      bgErrorSoft: alpha(theme.palette.error.main, 0.12),
    }),
    [theme]
  );

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [assessmentHeaders, setAssessmentHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [editedGrades, setEditedGrades] = useState(new Map()); // Map<assessmentId, Map<studentId, {score, gradeId}>>

  const fileInputRef = useRef(null);

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await sectionService.getSectionDropdownForLecturer();
        if (response) {
          setSections(response || []);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải danh sách lớp học phần',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchSections();
    }
  }, [lecturerId]);

  useEffect(() => {
    const fetchStudentsAndGrades = async () => {
      if (!selectedSection) return;

      setLoading(true);
      setLoadingGrades(true);
      try {
        // Fetch all student grades for the section using new API (only 1 call)
        const gradesResponse =
          await gradeService.getAllStudentGradesBySection(selectedSection);

        if (!gradesResponse || !gradesResponse.studentGrades) {
          setStudents([]);
          setAssessmentHeaders([]);
          setLoading(false);
          setLoadingGrades(false);
          return;
        }

        // Store assessment headers for column mapping
        setAssessmentHeaders(gradesResponse.assessmentHeaders || []);

        // Map the response to match our table structure
        // Create a map of assessmentId -> assessment info for quick lookup
        const assessmentMap = new Map();
        gradesResponse.assessmentHeaders?.forEach((header) => {
          assessmentMap.set(header.assessmentId, header);
        });

        const studentsWithGrades = gradesResponse.studentGrades.map(
          (student) => {
            // Enhance assessmentGrades with full assessment info
            const enrichedAssessmentGrades =
              student.assessmentGrades?.map((grade) => {
                const assessmentInfo = assessmentMap.get(grade.assessmentId);
                return {
                  ...grade,
                  assessmentName: assessmentInfo?.assessmentName || '',
                  assessmentType: assessmentInfo?.assessmentType || '',
                  assessmentTypeId: assessmentInfo?.assessmentTypeId || null,
                  weight: assessmentInfo?.weight || 0,
                };
              }) || [];

            return {
              studentId: student.studentId,
              studentCode: student.mssv,
              fullName: student.studentName,
              enrollmentStatus: student.enrollmentStatus,
              finalScore: student.finalScore,
              gradeLetter: student.gradeLetter,
              assessmentGrades: enrichedAssessmentGrades,
              completedAssessments: student.completedAssessments || 0,
              pendingAssessments: student.pendingAssessments || 0,
              completionPercentage: student.completionPercentage || 0,
            };
          }
        );

        setStudents(studentsWithGrades);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải dữ liệu',
          severity: 'error',
        });
        setStudents([]);
        setAssessmentHeaders([]);
      } finally {
        setLoading(false);
        setLoadingGrades(false);
      }
    };

    fetchStudentsAndGrades();
  }, [selectedSection]);

  const getGradeColor = (gradeLetter) => {
    if (!gradeLetter) return 'default';
    if (gradeLetter.startsWith('A')) return 'success';
    if (gradeLetter.startsWith('B')) return 'processing';
    if (gradeLetter.startsWith('C')) return 'warning';
    if (gradeLetter.startsWith('D') || gradeLetter === 'F') return 'error';
    return 'default';
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Submit all edited grades
  const handleSubmitGrades = async () => {
    if (editedGrades.size === 0) {
      setSnackbar({
        open: true,
        message: 'Không có điểm nào được thay đổi',
        severity: 'warning',
      });
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const [assessmentId, studentGradesMap] of editedGrades) {
      const studentGrades = Array.from(studentGradesMap.entries()).map(
        ([studentId, data]) => ({
          studentId,
          score: data.score,
          note: null,
        })
      );

      const result = await gradeService.createBulkGrades(
        assessmentId,
        studentGrades
      );
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setLoading(false);

    if (failCount === 0) {
      setSnackbar({
        open: true,
        message: `Lưu thành công ${successCount} cột điểm!`,
        severity: 'success',
      });
      // Clear edited grades
      setEditedGrades(new Map());
      // Refresh data
      const gradesResponse =
        await gradeService.getAllStudentGradesBySection(selectedSection);
      if (gradesResponse && gradesResponse.studentGrades) {
        const assessmentMap = new Map();
        gradesResponse.assessmentHeaders?.forEach((header) => {
          assessmentMap.set(header.assessmentId, header);
        });

        const studentsWithGrades = gradesResponse.studentGrades.map(
          (student) => {
            const enrichedAssessmentGrades =
              student.assessmentGrades?.map((grade) => {
                const assessmentInfo = assessmentMap.get(grade.assessmentId);
                return {
                  ...grade,
                  assessmentName: assessmentInfo?.assessmentName || '',
                  assessmentType: assessmentInfo?.assessmentType || '',
                  assessmentTypeId: assessmentInfo?.assessmentTypeId || null,
                  weight: assessmentInfo?.weight || 0,
                };
              }) || [];

            return {
              studentId: student.studentId,
              studentCode: student.mssv,
              fullName: student.studentName,
              enrollmentStatus: student.enrollmentStatus,
              finalScore: student.finalScore,
              gradeLetter: student.gradeLetter,
              assessmentGrades: enrichedAssessmentGrades,
              completedAssessments: student.completedAssessments || 0,
              pendingAssessments: student.pendingAssessments || 0,
              completionPercentage: student.completionPercentage || 0,
            };
          }
        );

        setStudents(studentsWithGrades);
        setAssessmentHeaders(gradesResponse.assessmentHeaders || []);
      }
    } else {
      setSnackbar({
        open: true,
        message: `Lưu hoàn tất: ${successCount} thành công, ${failCount} thất bại`,
        severity: 'warning',
      });
    }
  };

  // Export Excel Template
  const handleExportTemplate = () => {
    if (students.length === 0) {
      setSnackbar({
        open: true,
        message: 'Không có dữ liệu sinh viên để xuất',
        severity: 'warning',
      });
      return;
    }

    // Create headers
    const headers = ['STT', 'Mã SV', 'Họ và tên'];

    // Add assessment headers
    // Lý thuyết columns
    for (let i = 1; i <= 3; i++) {
      headers.push(`LT ${i}`);
    }
    // Thực hành columns
    for (let i = 1; i <= 3; i++) {
      headers.push(`TH ${i}`);
    }
    headers.push('Giữa kỳ');
    headers.push('Cuối kỳ');

    // Create data rows
    const data = students.map((student, index) => {
      const row = [index + 1, student.studentCode, student.fullName];

      // Add empty cells for grades (to be filled by teacher)
      for (let i = 0; i < 8; i++) {
        row.push('');
      }

      return row;
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 }, // STT
      { wch: 12 }, // Mã SV
      { wch: 25 }, // Họ và tên
      { wch: 8 }, // LT 1
      { wch: 8 }, // LT 2
      { wch: 8 }, // LT 3
      { wch: 8 }, // TH 1
      { wch: 8 }, // TH 2
      { wch: 8 }, // TH 3
      { wch: 10 }, // Giữa kỳ
      { wch: 10 }, // Cuối kỳ
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm');

    // Get section info
    const section = sections.find((s) => s.sectionId === selectedSection);
    const fileName = `Template_Diem_${section?.displayName || 'LopHocPhan'}_${new Date().getTime()}.xlsx`;

    // Export
    XLSX.writeFile(wb, fileName);

    setSnackbar({
      open: true,
      message: 'Xuất file template thành công!',
      severity: 'success',
    });
  };

  // Import Excel
  const handleImportExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file name matches current section
    const section = sections.find((s) => s.sectionId === selectedSection);
    if (section) {
      const expectedFilePrefix = `Template_Diem_${section.displayName}`;
      if (!file.name.startsWith(expectedFilePrefix)) {
        setSnackbar({
          open: true,
          message: `File Excel không đúng lớp học phần. Vui lòng sử dụng file template của lớp "${section.displayName}"`,
          severity: 'error',
        });
        event.target.value = '';
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Validate structure
        if (jsonData.length < 2) {
          setSnackbar({
            open: true,
            message: 'File Excel không hợp lệ',
            severity: 'error',
          });
          return;
        }

        const headers = jsonData[0];
        const expectedHeaders = [
          'STT',
          'Mã SV',
          'Họ và tên',
          'LT 1',
          'LT 2',
          'LT 3',
          'TH 1',
          'TH 2',
          'TH 3',
          'Giữa kỳ',
          'Cuối kỳ',
        ];

        // Check headers
        const headersMatch = expectedHeaders.every(
          (header, index) => headers[index]?.toString().trim() === header
        );

        if (!headersMatch) {
          setSnackbar({
            open: true,
            message:
              'Cấu trúc file Excel không đúng. Vui lòng sử dụng file template đã xuất.',
            severity: 'error',
          });
          return;
        }

        const dataRows = jsonData.slice(1); // Skip header row

        // Validate number of students matches
        if (dataRows.length !== students.length) {
          setSnackbar({
            open: true,
            message: `Số lượng sinh viên không khớp. Excel có ${dataRows.length} sinh viên, hệ thống có ${students.length} sinh viên.`,
            severity: 'error',
          });
          return;
        }

        // Validate STT and student codes match exactly
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const expectedSTT = i + 1;
          const actualSTT = row[0];
          const studentCode = row[1]?.toString().trim();
          const studentName = row[2]?.toString().trim();

          // Check STT
          if (actualSTT !== expectedSTT) {
            setSnackbar({
              open: true,
              message: `Lỗi tại dòng ${i + 2}: STT không đúng. Mong đợi ${expectedSTT}, nhận được ${actualSTT}`,
              severity: 'error',
            });
            return;
          }

          // Check if student exists in the system
          const systemStudent = students.find(
            (s) => s.studentCode === studentCode
          );
          if (!systemStudent) {
            setSnackbar({
              open: true,
              message: `Lỗi tại dòng ${i + 2}: Không tìm thấy sinh viên ${studentCode} trong lớp học phần này`,
              severity: 'error',
            });
            return;
          }

          // Check if student name matches
          if (systemStudent.fullName !== studentName) {
            setSnackbar({
              open: true,
              message: `Lỗi tại dòng ${i + 2}: Tên sinh viên không khớp. Hệ thống: "${systemStudent.fullName}", Excel: "${studentName}"`,
              severity: 'error',
            });
            return;
          }
        }

        // Validate all grade values are valid numbers or empty
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const studentCode = row[1]?.toString().trim();

          // Check LT grades (columns 3, 4, 5)
          for (let j = 3; j <= 5; j++) {
            const value = row[j];
            if (value !== undefined && value !== '' && value !== null) {
              const numValue = parseFloat(value);
              if (isNaN(numValue) || numValue < 0 || numValue > 10) {
                setSnackbar({
                  open: true,
                  message: `Lỗi tại dòng ${i + 2} (${studentCode}), cột LT ${j - 2}: Điểm phải là số từ 0-10`,
                  severity: 'error',
                });
                return;
              }
            }
          }

          // Check TH grades (columns 6, 7, 8)
          for (let j = 6; j <= 8; j++) {
            const value = row[j];
            if (value !== undefined && value !== '' && value !== null) {
              const numValue = parseFloat(value);
              if (isNaN(numValue) || numValue < 0 || numValue > 10) {
                setSnackbar({
                  open: true,
                  message: `Lỗi tại dòng ${i + 2} (${studentCode}), cột TH ${j - 5}: Điểm phải là số từ 0-10`,
                  severity: 'error',
                });
                return;
              }
            }
          }

          // Check Giữa kỳ (column 9)
          const giuaKy = row[9];
          if (giuaKy !== undefined && giuaKy !== '' && giuaKy !== null) {
            const numValue = parseFloat(giuaKy);
            if (isNaN(numValue) || numValue < 0 || numValue > 10) {
              setSnackbar({
                open: true,
                message: `Lỗi tại dòng ${i + 2} (${studentCode}), cột Giữa kỳ: Điểm phải là số từ 0-10`,
                severity: 'error',
              });
              return;
            }
          }

          // Check Cuối kỳ (column 10)
          const cuoiKy = row[10];
          if (cuoiKy !== undefined && cuoiKy !== '' && cuoiKy !== null) {
            const numValue = parseFloat(cuoiKy);
            if (isNaN(numValue) || numValue < 0 || numValue > 10) {
              setSnackbar({
                open: true,
                message: `Lỗi tại dòng ${i + 2} (${studentCode}), cột Cuối kỳ: Điểm phải là số từ 0-10`,
                severity: 'error',
              });
              return;
            }
          }
        }

        // Validate consistency of all assessment columns
        // For each column (LT 1-3, TH 1-3, Giữa kỳ, Cuối kỳ), if any student has a grade, all must have it
        const columnNames = [
          'LT 1',
          'LT 2',
          'LT 3',
          'TH 1',
          'TH 2',
          'TH 3',
          'Giữa kỳ',
          'Cuối kỳ',
        ];
        const columnIndices = [3, 4, 5, 6, 7, 8, 9, 10];

        for (let i = 0; i < columnIndices.length; i++) {
          const columnIndex = columnIndices[i];
          const columnName = columnNames[i];

          const columnPresence = dataRows.map((row) => {
            const value = row[columnIndex];
            return value !== undefined && value !== '' && value !== null;
          });

          const someHaveValue = columnPresence.some((v) => v);
          const allHaveValue = columnPresence.every((v) => v);

          if (someHaveValue && !allHaveValue) {
            setSnackbar({
              open: true,
              message: `Lỗi: Nếu có sinh viên có điểm "${columnName}" thì tất cả sinh viên phải có điểm "${columnName}"`,
              severity: 'error',
            });
            return;
          }
        }

        // Parse data and update UI state (editedGrades) - don't call API yet
        // Only import grades that are DIFFERENT from existing grades
        // The user will click "Lưu Điểm" button to submit
        const newEditedGrades = new Map(editedGrades);
        let importedGradeCount = 0;

        // Process each student row
        dataRows.forEach((row) => {
          const studentCode = row[1]?.toString().trim();
          const student = students.find((s) => s.studentCode === studentCode);
          if (!student) return;

          // Find existing gradeId for each assessment if it exists
          const studentGradeData = student.assessmentGrades || [];

          // Process LT grades (columns 3, 4, 5) - assessmentTypeId = 1
          const ltAssessments = assessmentHeaders.filter(
            (a) => a.assessmentTypeId === 1
          );
          for (let i = 0; i < 3; i++) {
            const value = row[3 + i];
            if (
              value !== undefined &&
              value !== '' &&
              value !== null &&
              ltAssessments[i]
            ) {
              const assessmentId = ltAssessments[i].assessmentId;
              const existingGrade = studentGradeData.find(
                (g) => g.assessmentId === assessmentId
              );
              const newScore = parseFloat(value);
              const currentScore = existingGrade?.score;

              // Only add to editedGrades if the score is different from current score
              if (
                currentScore === undefined ||
                currentScore === null ||
                Math.abs(currentScore - newScore) > 0.001
              ) {
                if (!newEditedGrades.has(assessmentId)) {
                  newEditedGrades.set(assessmentId, new Map());
                }
                newEditedGrades.get(assessmentId).set(student.studentId, {
                  score: newScore,
                  gradeId: existingGrade?.gradeId || null,
                });
                importedGradeCount++;
              }
            }
          }

          // Process TH grades (columns 6, 7, 8) - assessmentTypeId = 2
          const thAssessments = assessmentHeaders.filter(
            (a) => a.assessmentTypeId === 2
          );
          for (let i = 0; i < 3; i++) {
            const value = row[6 + i];
            if (
              value !== undefined &&
              value !== '' &&
              value !== null &&
              thAssessments[i]
            ) {
              const assessmentId = thAssessments[i].assessmentId;
              const existingGrade = studentGradeData.find(
                (g) => g.assessmentId === assessmentId
              );
              const newScore = parseFloat(value);
              const currentScore = existingGrade?.score;

              // Only add to editedGrades if the score is different from current score
              if (
                currentScore === undefined ||
                currentScore === null ||
                Math.abs(currentScore - newScore) > 0.001
              ) {
                if (!newEditedGrades.has(assessmentId)) {
                  newEditedGrades.set(assessmentId, new Map());
                }
                newEditedGrades.get(assessmentId).set(student.studentId, {
                  score: newScore,
                  gradeId: existingGrade?.gradeId || null,
                });
                importedGradeCount++;
              }
            }
          }

          // Process Giữa kỳ (column 9) - assessmentTypeId = 3
          const giuaKy = row[9];
          if (giuaKy !== undefined && giuaKy !== '' && giuaKy !== null) {
            const giuaKyAssessment = assessmentHeaders.find(
              (a) => a.assessmentTypeId === 3
            );
            if (giuaKyAssessment) {
              const assessmentId = giuaKyAssessment.assessmentId;
              const existingGrade = studentGradeData.find(
                (g) => g.assessmentId === assessmentId
              );
              const newScore = parseFloat(giuaKy);
              const currentScore = existingGrade?.score;

              // Only add to editedGrades if the score is different from current score
              if (
                currentScore === undefined ||
                currentScore === null ||
                Math.abs(currentScore - newScore) > 0.001
              ) {
                if (!newEditedGrades.has(assessmentId)) {
                  newEditedGrades.set(assessmentId, new Map());
                }
                newEditedGrades.get(assessmentId).set(student.studentId, {
                  score: newScore,
                  gradeId: existingGrade?.gradeId || null,
                });
                importedGradeCount++;
              }
            }
          }

          // Process Cuối kỳ (column 10) - assessmentTypeId = 4
          const cuoiKy = row[10];
          if (cuoiKy !== undefined && cuoiKy !== '' && cuoiKy !== null) {
            const cuoiKyAssessment = assessmentHeaders.find(
              (a) => a.assessmentTypeId === 4
            );
            if (cuoiKyAssessment) {
              const assessmentId = cuoiKyAssessment.assessmentId;
              const existingGrade = studentGradeData.find(
                (g) => g.assessmentId === assessmentId
              );
              const newScore = parseFloat(cuoiKy);
              const currentScore = existingGrade?.score;

              // Only add to editedGrades if the score is different from current score
              if (
                currentScore === undefined ||
                currentScore === null ||
                Math.abs(currentScore - newScore) > 0.001
              ) {
                if (!newEditedGrades.has(assessmentId)) {
                  newEditedGrades.set(assessmentId, new Map());
                }
                newEditedGrades.get(assessmentId).set(student.studentId, {
                  score: newScore,
                  gradeId: existingGrade?.gradeId || null,
                });
                importedGradeCount++;
              }
            }
          }
        });

        // Update state with imported grades
        setEditedGrades(newEditedGrades);

        setSnackbar({
          open: true,
          message: `Import thành công ${importedGradeCount} điểm từ file Excel. Vui lòng nhấn "Lưu Điểm" để lưu vào hệ thống.`,
          severity: 'success',
        });
      } catch (error) {
        console.error('Error importing Excel:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi đọc file Excel',
          severity: 'error',
        });
      }
    };

    reader.readAsArrayBuffer(file);
    // Reset input
    event.target.value = '';
  };

  const passedStudents = students.filter(
    (s) => s.finalScore !== null && s.finalScore >= 5
  ).length;
  const failedStudents = students.filter(
    (s) => s.finalScore !== null && s.finalScore < 5
  ).length;
  const avgScore =
    students.length && students.filter((s) => s.finalScore !== null).length
      ? (
          students.reduce(
            (sum, s) => sum + (parseFloat(s.finalScore) || 0),
            0
          ) / students.filter((s) => s.finalScore !== null).length
        ).toFixed(2)
      : 0;
  const avgCompletion = students.length
    ? (
        students.reduce((sum, s) => sum + (s.completionPercentage || 0), 0) /
        students.length
      ).toFixed(0)
    : 0;

  // Helper function to render assessment score cell (read-only display)
  const renderScoreCell = (record, assessmentId) => {
    const assessment = record.assessmentGrades?.find(
      (a) => a.assessmentId === assessmentId
    );

    const currentScore = assessment?.score;

    // Get edited value if exists (from import)
    const editedValue = editedGrades
      .get(assessmentId)
      ?.get(record.studentId)?.score;
    const displayValue = editedValue !== undefined ? editedValue : currentScore;
    const hasChanged = editedValue !== undefined;

    if (displayValue !== null && displayValue !== undefined) {
      return (
        <span
          style={{
            fontWeight: 600,
            fontSize: '14px',
            color: hasChanged ? '#d48806' : theme.palette.text.primary,
            backgroundColor: hasChanged ? '#fffbe6' : 'transparent',
            padding: hasChanged ? '4px 12px' : '4px 0',
            borderRadius: hasChanged ? '4px' : '0',
            display: 'inline-block',
            minWidth: '50px',
            textAlign: 'center',
            border: hasChanged ? '1px solid #ffd666' : 'none',
          }}
        >
          {parseFloat(displayValue).toFixed(2)}
        </span>
      );
    }

    return <span style={{ color: '#bfbfbf', fontSize: '14px' }}>-</span>;
  };

  // Dynamic column structure based on assessmentHeaders
  const getAssessmentColumns = () => {
    if (!assessmentHeaders || assessmentHeaders.length === 0) return [];

    const columns = [];

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

    // Create Thường xuyên group if there are LT or TH assessments
    if (ltAssessments.length > 0 || thAssessments.length > 0) {
      const thuongXuyenChildren = [];

      // Add LT group if exists
      if (ltAssessments.length > 0) {
        thuongXuyenChildren.push({
          title: 'Lý thuyết',
          key: 'thuongky_lt_group',
          align: 'center',
          children: ltAssessments.map((assessment, index) => ({
            title: `${index + 1}`,
            key: `lt_${assessment.assessmentId}`,
            width: 100,
            align: 'center',
            render: (_, record) =>
              renderScoreCell(record, assessment.assessmentId),
          })),
        });
      }

      // Add TH group if exists
      if (thAssessments.length > 0) {
        thuongXuyenChildren.push({
          title: 'Thực hành',
          key: 'thuongky_th_group',
          align: 'center',
          children: thAssessments.map((assessment, index) => ({
            title: `${index + 1}`,
            key: `th_${assessment.assessmentId}`,
            width: 100,
            align: 'center',
            render: (_, record) =>
              renderScoreCell(record, assessment.assessmentId),
          })),
        });
      }

      columns.push({
        title: 'Thường xuyên',
        key: 'thuongky_group',
        align: 'center',
        children: thuongXuyenChildren,
      });
    }

    // Add Giữa kỳ if exists
    if (giuaKyAssessment) {
      columns.push({
        title: 'Giữa kỳ',
        key: 'giuaky',
        width: 120,
        align: 'center',
        render: (_, record) =>
          renderScoreCell(record, giuaKyAssessment.assessmentId),
      });
    }

    // Add Cuối kỳ if exists
    if (cuoiKyAssessment) {
      columns.push({
        title: 'Cuối kỳ',
        key: 'cuoiky',
        width: 120,
        align: 'center',
        render: (_, record) =>
          renderScoreCell(record, cuoiKyAssessment.assessmentId),
      });
    }

    return columns;
  };

  // Helper function to calculate GPA 4.0
  const calculateGPA4 = (finalScore) => {
    if (finalScore === null || finalScore === undefined) return null;
    if (finalScore >= 8.5) return 4.0;
    if (finalScore >= 8.0) return 3.5;
    if (finalScore >= 7.0) return 3.0;
    if (finalScore >= 6.5) return 2.5;
    if (finalScore >= 5.5) return 2.0;
    if (finalScore >= 5.0) return 1.5;
    if (finalScore >= 4.0) return 1.0;
    return 0.0;
  };

  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
    },
    // Dynamic assessment columns
    ...getAssessmentColumns(),
    {
      title: 'Điểm thang 10',
      dataIndex: 'finalScore',
      key: 'finalScore',
      width: 110,
      align: 'center',
      render: (value) => (
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '15px',
            color: value !== null ? '#1890ff' : '#999',
          }}
        >
          {value !== null ? parseFloat(value).toFixed(2) : '-'}
        </span>
      ),
    },
    {
      title: 'Điểm thang 4',
      dataIndex: 'finalScore',
      key: 'gpa4',
      width: 100,
      align: 'center',
      render: (finalScore) => {
        const gpa4 = calculateGPA4(finalScore);
        return (
          <span
            style={{
              fontWeight: 600,
              color: gpa4 !== null ? '#52c41a' : '#999',
            }}
          >
            {gpa4 !== null ? gpa4.toFixed(1) : '-'}
          </span>
        );
      },
    },
    {
      title: 'Xếp loại',
      dataIndex: 'gradeLetter',
      key: 'gradeLetter',
      width: 100,
      align: 'center',
      render: (gradeLetter) => {
        if (!gradeLetter) return <Tag>-</Tag>;
        return <Tag color={getGradeColor(gradeLetter)}>{gradeLetter}</Tag>;
      },
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Fade in={true} timeout={600}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 4, fontWeight: 'bold', color: colors.text }}
        >
          Quản lý Điểm số
        </Typography>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                backgroundColor: colors.bgPrimarySoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Grade sx={{ fontSize: 40, color: colors.primary, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {avgScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điểm trung bình
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                backgroundColor: colors.bgSuccessSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle
                  sx={{ fontSize: 40, color: colors.success, mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {passedStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đạt
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={1200}>
            <Card
              sx={{
                backgroundColor: colors.bgErrorSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning sx={{ fontSize: 40, color: colors.error, mr: 2 }} />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {failedStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Không đạt
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Grow in={true} timeout={1400}>
            <Card
              sx={{
                backgroundColor: colors.bgWarningSoft,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp
                  sx={{ fontSize: 40, color: colors.warning, mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {avgCompletion}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành TB
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Section Selection */}
      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Chọn lớp học phần</InputLabel>
                <Select
                  value={selectedSection}
                  label="Chọn lớp học phần"
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={loading}
                >
                  {sections.map((section) => (
                    <MenuItem key={section.sectionId} value={section.sectionId}>
                      {section.displayName} - {section.className}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}
            >
              <Button
                variant="contained"
                color="success"
                startIcon={<Save />}
                onClick={handleSubmitGrades}
                disabled={
                  !selectedSection ||
                  students.length === 0 ||
                  editedGrades.size === 0
                }
              >
                Lưu Điểm ({editedGrades.size})
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleExportTemplate}
                disabled={!selectedSection || students.length === 0}
              >
                Xuất Template
              </Button>
              <Button
                variant="contained"
                startIcon={<FileUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedSection || students.length === 0}
              >
                Import Excel
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
              />
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Grades Table */}
      {selectedSection ? (
        <Fade in={true} timeout={1200}>
          <Card>
            <Table
              columns={columns}
              dataSource={students}
              loading={loading || loadingGrades}
              rowKey="studentId"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} sinh viên`,
              }}
              scroll={{ x: 1200 }}
              style={{ maxWidth: 1200 }}
            />
          </Card>
        </Fade>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vui lòng chọn lớp học phần để xem điểm
          </Typography>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GradesPage;
