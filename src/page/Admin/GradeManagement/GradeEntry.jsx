import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Fade,
  Grow,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FileDownload,
  FileUpload,
  Grade,
  CheckCircle,
  Warning,
  TrendingUp,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { Table, Tag } from 'antd';
import gradeService from '../../../service/gradeService';
import { studentServices } from '../../../service/studentServices';
import { exportGradesExcel } from '../../../until/exportGradesExcel';
import * as XLSX from 'xlsx';

const GradeEntry = () => {
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

  // Original state for single student view
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [editScore, setEditScore] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // New state for section-based view (like teacher)
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [sectionStudents, setSectionStudents] = useState([]);
  const [assessmentHeaders, setAssessmentHeaders] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [editedGrades, setEditedGrades] = useState(new Map());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // View mode: 'single' for single student, 'section' for section-based
  const [viewMode, setViewMode] = useState('single');

  const fileInputRef = useRef(null);

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
    fetchSections();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const result = await studentServices.getAllStudents(1, 1000);
      if (result?.items) {
        setStudents(result.items);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const result = await gradeService.getAllSections();
      if (result) {
        setSections(result || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải danh sách học phần',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Original single student functions
  const handleStudentChange = async (event, value) => {
    setSelectedStudent(value);
    if (value?.mssv) {
      await handleSearch(value.mssv);
    } else {
      setStudentData(null);
    }
  };

  const handleSearch = async (mssv) => {
    if (!mssv) return;

    setLoading(true);
    try {
      const result = await gradeService.getAllGradesByStudentCode(mssv);
      if (result) {
        setStudentData(result);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (grade, assessment) => {
    setEditingGrade({ grade, assessment });
    setEditScore(assessment.score || '');
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingGrade || !editScore) return;

    const { grade, assessment } = editingGrade;
    const score = parseFloat(editScore);

    if (isNaN(score) || score < 0 || score > 10) {
      alert('Điểm phải từ 0 đến 10');
      return;
    }

    try {
      const result = await gradeService.updateGrade(assessment.gradeId, {
        studentId: studentData.studentId,
        assessmentId: assessment.assessmentId,
        score,
      });

      if (result) {
        // Refresh data
        if (selectedStudent?.mssv) {
          await handleSearch(selectedStudent.mssv);
        }
        setOpenEditDialog(false);
        setEditingGrade(null);
        setEditScore('');
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancelEdit = () => {
    setOpenEditDialog(false);
    setEditingGrade(null);
    setEditScore('');
  };

  // Section-based functions (like teacher)
  useEffect(() => {
    const fetchStudentsAndGrades = async () => {
      if (!selectedSection) return;

      setLoading(true);
      setLoadingGrades(true);
      try {
        const gradesResponse = await gradeService.getAllStudentGradesBySection(selectedSection);

        if (!gradesResponse || !gradesResponse.studentGrades) {
          setSectionStudents([]);
          setAssessmentHeaders([]);
          setLoading(false);
          setLoadingGrades(false);
          return;
        }

        setAssessmentHeaders(gradesResponse.assessmentHeaders || []);

        const assessmentMap = new Map();
        gradesResponse.assessmentHeaders?.forEach((header) => {
          assessmentMap.set(header.assessmentId, header);
        });

        const studentsWithGrades = gradesResponse.studentGrades.map((student) => {
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
        });

        setSectionStudents(studentsWithGrades);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải dữ liệu',
          severity: 'error',
        });
        setSectionStudents([]);
        setAssessmentHeaders([]);
      } finally {
        setLoading(false);
        setLoadingGrades(false);
      }
    };

    if (viewMode === 'section' && selectedSection) {
      fetchStudentsAndGrades();
    }
  }, [selectedSection, viewMode]);

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

      const result = await gradeService.createBulkGrades(assessmentId, studentGrades);
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
      setEditedGrades(new Map());
      // Refresh data
      if (selectedSection) {
        const gradesResponse = await gradeService.getAllStudentGradesBySection(selectedSection);
        if (gradesResponse && gradesResponse.studentGrades) {
          const assessmentMap = new Map();
          gradesResponse.assessmentHeaders?.forEach((header) => {
            assessmentMap.set(header.assessmentId, header);
          });

          const studentsWithGrades = gradesResponse.studentGrades.map((student) => {
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
          });

          setSectionStudents(studentsWithGrades);
          setAssessmentHeaders(gradesResponse.assessmentHeaders || []);
        }
      }
    } else {
      setSnackbar({
        open: true,
        message: `Lưu hoàn tất: ${successCount} thành công, ${failCount} thất bại`,
        severity: 'warning',
      });
    }
  };

  // Export Excel
  const handleExportTemplate = () => {
    if (sectionStudents.length === 0) {
      setSnackbar({
        open: true,
        message: 'Không có dữ liệu sinh viên để xuất',
        severity: 'warning',
      });
      return;
    }

    const section = sections.find((s) => s.sectionId === selectedSection);

    const sectionData = {
      courseName: section?.courseName || 'Tên môn học',
      sectionCode: section?.sectionCode || section?.displayName || 'Mã lớp',
      className: section?.className || '',
      semester: 'HK1',
      academicYear: '2025-2026',
    };

    const studentsWithNames = sectionStudents.map((student) => {
      const nameParts = (student.fullName || '').trim().split(' ');
      const firstName = nameParts.pop() || '';
      const lastName = nameParts.join(' ') || '';

      return {
        ...student,
        firstName,
        lastName,
      };
    });

    const result = exportGradesExcel(sectionData, assessmentHeaders, studentsWithNames);

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

        // New format has 3 header rows (rows 9, 10, 11 = index 9, 10, 11)
        // Data starts at row 12 (index 12)
        // Row 9: Main headers (STT, Mã số, Họ đệm, Tên, Lớp học, Điểm GKTH, ...)
        // Row 10: Sub-headers (Lý thuyết, Thực hành)
        // Row 11: Assessment numbers (1, 2, 3...)

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
          const systemStudent = sectionStudents.find(
            (s) => s.studentCode === studentCode
          );
          if (!systemStudent) {
            setSnackbar({
              open: true,
              message: `Lỗi tại dòng ${i + 13}: Không tìm thấy sinh viên ${studentCode} trong học phần này`,
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
          const student = sectionStudents.find((s) => s.studentCode === studentCode);
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
    event.target.value = '';
  };

  const getGradeColor = (gradeLetter) => {
    switch (gradeLetter) {
      case 'A':
        return theme.palette.success.main;
      case 'B+':
      case 'B':
        return theme.palette.info.main;
      case 'C+':
      case 'C':
        return theme.palette.warning.main;
      case 'D+':
      case 'D':
        return theme.palette.error.light;
      case 'F':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    if (trend.trendDirection === 'Improving') {
      return <TrendingUp color="success" />;
    } else if (trend.trendDirection === 'Declining') {
      return <TrendingUp color="error" sx={{ transform: 'rotate(180deg)' }} />;
    } else {
      return <TrendingUp color="action" sx={{ transform: 'rotate(90deg)' }} />;
    }
  };

  const getGradeColorAntd = (gradeLetter) => {
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

  // Helper function for inline editing (similar to teacher component)
  const renderScoreCell = (record, assessmentId) => {
    const assessment = record.assessmentGrades?.find((a) => a.assessmentId === assessmentId);
    const currentScore = assessment?.score;
    const editedValue = editedGrades.get(assessmentId)?.get(record.studentId)?.score;
    const displayValue = editedValue !== undefined ? editedValue : currentScore;
    const hasChanged = editedValue !== undefined;

    const handleScoreChange = (e) => {
      const value = e.target.value;

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

      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;

      if (numValue < 0 || numValue > 10) {
        setSnackbar({
          open: true,
          message: 'Điểm phải nằm trong khoảng 0-10',
          severity: 'error',
        });
        return;
      }

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
      }
    };

    return (
      <TextField
        type="number"
        size="small"
        value={displayValue !== null && displayValue !== undefined ? displayValue : ''}
        onChange={handleScoreChange}
        placeholder="-"
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
          },
        }}
      />
    );
  };

  // Dynamic columns for section view
  const getAssessmentColumns = () => {
    if (!assessmentHeaders || assessmentHeaders.length === 0) return [];

    const columns = [];
    const ltAssessments = assessmentHeaders.filter((a) => a.assessmentTypeId === 1);
    const thAssessments = assessmentHeaders.filter((a) => a.assessmentTypeId === 2);
    const giuaKyAssessment = assessmentHeaders.find((a) => a.assessmentTypeId === 3);
    const cuoiKyAssessment = assessmentHeaders.find((a) => a.assessmentTypeId === 4);

    if (ltAssessments.length > 0 || thAssessments.length > 0) {
      const thuongXuyenChildren = [];

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
            render: (_, record) => renderScoreCell(record, assessment.assessmentId),
          })),
        });
      }

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
            render: (_, record) => renderScoreCell(record, assessment.assessmentId),
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

    if (giuaKyAssessment) {
      columns.push({
        title: 'Giữa kỳ',
        key: 'giuaky',
        width: 120,
        align: 'center',
        render: (_, record) => renderScoreCell(record, giuaKyAssessment.assessmentId),
      });
    }

    if (cuoiKyAssessment) {
      columns.push({
        title: 'Cuối kỳ',
        key: 'cuoiky',
        width: 120,
        align: 'center',
        render: (_, record) => renderScoreCell(record, cuoiKyAssessment.assessmentId),
      });
    }

    return columns;
  };

  const sectionColumns = [
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
      title: 'Xếp loại',
      dataIndex: 'gradeLetter',
      key: 'gradeLetter',
      width: 100,
      align: 'center',
      render: (gradeLetter) => {
        if (!gradeLetter) return <Tag>-</Tag>;
        return <Tag color={getGradeColorAntd(gradeLetter)}>{gradeLetter}</Tag>;
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Nhập điểm sinh viên
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý điểm sinh viên theo cá nhân hoặc theo học phần
        </Typography>
      </Box>

      {/* View Mode Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Chế độ xem</InputLabel>
              <Select
                value={viewMode}
                label="Chế độ xem"
                onChange={(e) => {
                  setViewMode(e.target.value);
                  if (e.target.value === 'single') {
                    setSelectedSection('');
                    setSectionStudents([]);
                    setAssessmentHeaders([]);
                    setEditedGrades(new Map());
                  } else {
                    setSelectedStudent(null);
                    setStudentData(null);
                  }
                }}
              >
                <MenuItem value="single">Theo sinh viên</MenuItem>
                <MenuItem value="section">Theo học phần</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {viewMode === 'single' ? (
        <>
          {/* Single Student Search */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Autocomplete
              options={students}
              getOptionLabel={(option) =>
                `${option.mssv} - ${option.user?.fullName || ''}`
              }
              value={selectedStudent}
              onChange={handleStudentChange}
              loading={loadingStudents}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn sinh viên"
                  placeholder="Tìm theo MSSV hoặc tên..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon
                          sx={{ ml: 1, mr: -0.5, color: 'action.active' }}
                        />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingStudents ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">{option.mssv}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.user?.fullName || ''}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </Paper>

          {/* Single Student Results */}
          {studentData && (
            <>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Mã số sinh viên
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {studentData.mssv}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {studentData.studentName}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {studentData.semesterGrades?.map((semester) => (
                <Accordion
                  key={semester.semesterId}
                  defaultExpanded={semester.semesterId === studentData.semesterGrades[0]?.semesterId}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {semester.semesterName}
                      </Typography>
                      <Chip label={`GPA: ${semester.semesterGPA10.toFixed(2)}`} color="primary" size="small" />
                      <Chip
                        label={semester.semesterRank}
                        color={
                          semester.semesterRank === 'Giỏi'
                            ? 'success'
                            : semester.semesterRank === 'Khá'
                            ? 'info'
                            : 'default'
                        }
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {semester.courseGrades?.map((course) => (
                      <Box key={course.sectionId} sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            p: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderRadius: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {course.courseCode} - {course.courseName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.credits} tín chỉ
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight={700}>
                              {course.finalScore.toFixed(2)}
                            </Typography>
                            <Chip
                              label={course.gradeLetter}
                              size="small"
                              sx={{
                                bgcolor: alpha(getGradeColor(course.gradeLetter), 0.2),
                                color: getGradeColor(course.gradeLetter),
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        </Box>

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Loại điểm</TableCell>
                                <TableCell>Tên bài đánh giá</TableCell>
                                <TableCell align="center">Điểm</TableCell>
                                <TableCell align="center">Thao tác</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {course.assessments?.map((assessment) => (
                                <React.Fragment key={assessment.assessmentId}>
                                  {assessment.regularPointsDetails ? (
                                    assessment.regularPointsDetails.map((detail) => (
                                      <TableRow key={detail.gradeId}>
                                        <TableCell>{assessment.assessmentType}</TableCell>
                                        <TableCell>{detail.assessmentName}</TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={detail.score.toFixed(1)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleEditClick(course, detail)}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell>{assessment.assessmentType}</TableCell>
                                      <TableCell>{assessment.assessmentName}</TableCell>
                                      <TableCell align="center">
                                        <Chip
                                          label={assessment.score.toFixed(1)}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell align="center">
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={() => handleEditClick(course, assessment)}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          )}

          {!studentData && !loading && (
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chọn sinh viên để xem và chỉnh sửa điểm
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Sử dụng dropdown phía trên để tìm kiếm sinh viên
              </Typography>
            </Paper>
          )}
        </>
      ) : (
        <>
          {/* Section-based View */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Chọn học phần</InputLabel>
                  <Select
                    value={selectedSection}
                    label="Chọn học phần"
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={loading}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section.sectionId} value={section.sectionId}>
                        {section.displayName} - {section.className} ({section.status})
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
                  disabled={!selectedSection || sectionStudents.length === 0 || editedGrades.size === 0}
                >
                  Lưu Điểm ({editedGrades.size})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExportTemplate}
                  disabled={!selectedSection || sectionStudents.length === 0}
                >
                  Xuất Template
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FileUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedSection || sectionStudents.length === 0}
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
          </Paper>

          {selectedSection ? (
            <Card>
              <Table
                columns={sectionColumns}
                dataSource={sectionStudents}
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
          ) : (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Vui lòng chọn học phần để xem điểm
              </Typography>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCancelEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Chỉnh sửa điểm</DialogTitle>
        <DialogContent>
          {editingGrade && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bài đánh giá
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {editingGrade.assessment.assessmentName}
              </Typography>
              <TextField
                fullWidth
                label="Điểm số"
                type="number"
                value={editScore}
                onChange={(e) => setEditScore(e.target.value)}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                helperText="Nhập điểm từ 0 đến 10"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GradeEntry;