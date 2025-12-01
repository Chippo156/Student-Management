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
  TextField,
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
import { useLocation } from 'react-router-dom';
import { sectionService, gradeService } from '../../../service';
import { exportGradesExcel } from '../../../until/exportGradesExcel';

const GradesPage = () => {
  const theme = useTheme();
  const location = useLocation();
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

  // Check if selected section allows grade editing
  const isSectionOpen = useMemo(() => {
    if (!selectedSection) return false;
    const section = sections.find((s) => s.sectionId === selectedSection);
    return section?.status === 'Đang mở';
  }, [selectedSection, sections]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await sectionService.getSectionDropdownForLecturer();
        if (response) {
          setSections(response || []);

          // Auto-select section from navigation state
          if (location.state?.selectedSection) {
            const navSection = location.state.selectedSection;
            setSelectedSection(navSection.sectionId);
          }
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
  }, [lecturerId, location.state]);

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

  // Export Excel with school format
  const handleExportTemplate = () => {
    if (students.length === 0) {
      setSnackbar({
        open: true,
        message: 'Không có dữ liệu sinh viên để xuất',
        severity: 'warning',
      });
      return;
    }

    // Get section info
    const section = sections.find((s) => s.sectionId === selectedSection);

    // Prepare section data with additional info
    const sectionData = {
      courseName: section?.courseName || 'Tên môn học',
      sectionCode: section?.sectionCode || section?.displayName || 'Mã lớp',
      className: section?.className || '',
      semester: 'HK1',
      academicYear: '2025-2026',
    };

    // Split fullName into lastName and firstName for better formatting
    const studentsWithNames = students.map((student) => {
      const nameParts = (student.fullName || '').trim().split(' ');
      const firstName = nameParts.pop() || '';
      const lastName = nameParts.join(' ') || '';

      return {
        ...student,
        firstName,
        lastName,
      };
    });

    // Export using new utility
    const result = exportGradesExcel(
      sectionData,
      assessmentHeaders,
      studentsWithNames
    );

    if (result.success) {
      setSnackbar({
        open: true,
        message: `Xuất file Excel thành công: ${result.fileName}`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: `Lỗi khi xuất Excel: ${result.error}`,
        severity: 'error',
      });
    }
  };

  // Import Excel
  const handleImportExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // New format with traditional header:
        // Row 1-3: Bộ Công Thương, Trường ĐH, gạch dưới
        // Row 4: Empty
        // Row 5: Title "DANH SÁCH ĐIỂM SINH VIÊN"
        // Row 6-9: Course info (Môn thi, Học kỳ, Lớp học phần, Lớp học + Niên học)
        // Row 10-12: Table headers (3 rows - index 9, 10, 11)
        //   Row 10: Main headers (STT, Mã số, Họ đệm, Tên, Lớp học, Điểm GKTH, ...)
        //   Row 11: Sub-headers (Lý thuyết, Thực hành)
        //   Row 12: Assessment numbers (1, 2, 3...)
        // Data starts at row 13 (index 12)

        if (jsonData.length < 13) {
          setSnackbar({
            open: true,
            message: 'File Excel không hợp lệ hoặc không có dữ liệu sinh viên',
            severity: 'error',
          });
          return;
        }

        // Data rows start at index 12 (row 13 in Excel)
        const dataRows = jsonData.slice(12);

        // Filter out empty rows
        const validDataRows = dataRows.filter(
          (row) => row && row.length > 0 && row[0] && row[1]
        );

        if (validDataRows.length === 0) {
          setSnackbar({
            open: true,
            message: 'File Excel không có dữ liệu sinh viên',
            severity: 'error',
          });
          return;
        }

        // Validate STT and student codes match
        for (let i = 0; i < validDataRows.length; i++) {
          const row = validDataRows[i];
          const expectedSTT = i + 1;
          const actualSTT = row[0];
          const studentCode = row[1]?.toString().trim();
          const lastName = row[2]?.toString().trim() || '';
          const firstName = row[3]?.toString().trim() || '';
          const fullName = `${lastName} ${firstName}`.trim();

          // Check STT
          if (actualSTT !== expectedSTT) {
            setSnackbar({
              open: true,
              message: `Lỗi tại dòng ${i + 13}: STT không đúng. Mong đợi ${expectedSTT}, nhận được ${actualSTT}`,
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
              message: `Lỗi tại dòng ${i + 13}: Không tìm thấy sinh viên ${studentCode} trong lớp học phần này`,
              severity: 'error',
            });
            return;
          }

          // Optional: Check if student name matches
          if (fullName && systemStudent.fullName !== fullName) {
            console.warn(
              `Warning: Name mismatch at row ${i + 13}. System: "${systemStudent.fullName}", Excel: "${fullName}"`
            );
          }
        }

        // Determine column indices dynamically based on assessmentHeaders
        // New format: STT, Mã số, Họ đệm, Tên, Lớp học, then assessment columns
        // Column 0: STT
        // Column 1: Mã số
        // Column 2: Họ đệm
        // Column 3: Tên
        // Column 4: Lớp học
        // Column 5+: Assessment scores (LT 1, LT 2, LT 3, TH 1, TH 2, TH 3, Giữa kỳ, Cuối kỳ, ...)

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

        // Build column mapping
        const columnMapping = [];
        let currentCol = 5; // Start after Lớp học

        // LT columns
        ltAssessments.forEach((assessment, index) => {
          columnMapping.push({
            col: currentCol++,
            assessmentId: assessment.assessmentId,
            name: `LT ${index + 1}`,
            type: 'LT',
          });
        });

        // TH columns
        thAssessments.forEach((assessment, index) => {
          columnMapping.push({
            col: currentCol++,
            assessmentId: assessment.assessmentId,
            name: `TH ${index + 1}`,
            type: 'TH',
          });
        });

        // Giữa kỳ
        if (giuaKyAssessment) {
          columnMapping.push({
            col: currentCol++,
            assessmentId: giuaKyAssessment.assessmentId,
            name: 'Giữa kỳ',
            type: 'GK',
          });
        }

        // Cuối kỳ
        if (cuoiKyAssessment) {
          columnMapping.push({
            col: currentCol++,
            assessmentId: cuoiKyAssessment.assessmentId,
            name: 'Cuối kỳ',
            type: 'CK',
          });
        }

        // Validate all grade values
        for (let i = 0; i < validDataRows.length; i++) {
          const row = validDataRows[i];
          const studentCode = row[1]?.toString().trim();

          for (const colInfo of columnMapping) {
            const value = row[colInfo.col];
            if (value !== undefined && value !== '' && value !== null) {
              const numValue = parseFloat(value);
              if (isNaN(numValue) || numValue < 0 || numValue > 10) {
                setSnackbar({
                  open: true,
                  message: `Lỗi tại dòng ${i + 13} (${studentCode}), cột ${colInfo.name}: Điểm phải là số từ 0-10`,
                  severity: 'error',
                });
                return;
              }
            }
          }
        }

        // Parse data and update UI state (editedGrades)
        const newEditedGrades = new Map(editedGrades);
        let importedGradeCount = 0;

        // Process each student row
        validDataRows.forEach((row) => {
          const studentCode = row[1]?.toString().trim();
          const student = students.find((s) => s.studentCode === studentCode);
          if (!student) return;

          const studentGradeData = student.assessmentGrades || [];

          // Process each assessment column based on columnMapping
          for (const colInfo of columnMapping) {
            const value = row[colInfo.col];
            if (value !== undefined && value !== '' && value !== null) {
              const assessmentId = colInfo.assessmentId;
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

  // Helper function to render assessment score cell with inline editing
  const renderScoreCell = (record, assessmentId) => {
    const assessment = record.assessmentGrades?.find(
      (a) => a.assessmentId === assessmentId
    );

    const currentScore = assessment?.score;

    // Get edited value if exists (from import or manual edit)
    const editedValue = editedGrades
      .get(assessmentId)
      ?.get(record.studentId)?.score;
    const displayValue = editedValue !== undefined ? editedValue : currentScore;
    const hasChanged = editedValue !== undefined;

    const handleScoreChange = (e) => {
      const value = e.target.value;

      // Allow empty value
      if (value === '') {
        const newEditedGrades = new Map(editedGrades);
        if (newEditedGrades.has(assessmentId)) {
          newEditedGrades.get(assessmentId).delete(record.studentId);
          if (newEditedGrades.get(assessmentId).size === 0) {
            newEditedGrades.delete(assessmentId);
          }
        }
        setEditedGrades(newEditedGrades);
        return;
      }

      // Validate number
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;

      // Validate range 0-10
      if (numValue < 0 || numValue > 10) {
        setSnackbar({
          open: true,
          message: 'Điểm phải nằm trong khoảng 0-10',
          severity: 'error',
        });
        return;
      }

      // Only update if different from current score
      if (
        currentScore === undefined ||
        currentScore === null ||
        Math.abs(currentScore - numValue) > 0.001
      ) {
        const newEditedGrades = new Map(editedGrades);
        if (!newEditedGrades.has(assessmentId)) {
          newEditedGrades.set(assessmentId, new Map());
        }
        newEditedGrades.get(assessmentId).set(record.studentId, {
          score: numValue,
          gradeId: assessment?.gradeId || null,
        });
        setEditedGrades(newEditedGrades);
      } else {
        // If the new value is same as original, remove from editedGrades
        const newEditedGrades = new Map(editedGrades);
        if (newEditedGrades.has(assessmentId)) {
          newEditedGrades.get(assessmentId).delete(record.studentId);
          if (newEditedGrades.get(assessmentId).size === 0) {
            newEditedGrades.delete(assessmentId);
          }
        }
        setEditedGrades(newEditedGrades);
      }
    };

    return (
      <TextField
        type="number"
        size="small"
        value={
          displayValue !== null && displayValue !== undefined
            ? displayValue
            : ''
        }
        onChange={handleScoreChange}
        placeholder="-"
        disabled={!isSectionOpen}
        inputProps={{
          min: 0,
          max: 10,
          step: 0.01,
          style: {
            textAlign: 'center',
            padding: '6px 8px',
            fontSize: '14px',
            fontWeight: hasChanged ? 600 : 400,
            color: hasChanged ? '#d48806' : theme.palette.text.primary,
          },
        }}
        sx={{
          width: '80px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: hasChanged ? '#fffbe6' : 'transparent',
            '& fieldset': {
              borderColor: hasChanged ? '#ffd666' : theme.palette.divider,
              borderWidth: hasChanged ? '2px' : '1px',
            },
            '&:hover fieldset': {
              borderColor: hasChanged ? '#ffc53d' : theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-disabled': {
              backgroundColor: 'transparent',
              '& fieldset': {
                borderColor: alpha(theme.palette.text.primary, 0.3),
              },
            },
          },
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: theme.palette.text.primary,
            color: theme.palette.text.primary,
            opacity: 0.6,
          },
        }}
      />
    );
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
                      {section.displayName} - {section.className} (
                      {section.status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedSection && !isSectionOpen && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Lớp học phần này không ở trạng thái "Đang mở". Không thể cập
                  nhật hoặc import điểm.
                </Alert>
              )}
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
                  editedGrades.size === 0 ||
                  !isSectionOpen
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
                disabled={
                  !selectedSection || students.length === 0 || !isSectionOpen
                }
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
              scroll={{ x: 'max-content' }}
              size="middle"
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
