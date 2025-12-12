import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Fade,
  Grow,
  Snackbar,
  Alert,
  TextField,
  Tooltip,
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
  Lock,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { sectionService, gradeService } from '../../../service';
import { exportGradesExcel } from '../../../until/exportGradesExcel';
import SearchableAutocomplete from '../../Common/SearchableAutocomplete';

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

  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
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
  const [editedGrades, setEditedGrades] = useState(new Map());

  const fileInputRef = useRef(null);

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  const isSectionOpen = useMemo(() => {
    if (!selectedSection) return false;
    const section = sections.find((s) => s.sectionId === selectedSection);
    return section?.status === 'Đang mở';
  }, [selectedSection, sections]);

  // Fetch semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await sectionService.getSemesterDropdown();
        const transformedSemesters = (data || []).map((semester) => ({
          id: semester.id,
          name:
            semester.name ||
            `${semester.year || ''} - ${semester.term || ''}`.trim() ||
            `Học kỳ ${semester.id}`,
          year: semester.year,
          term: semester.term,
        }));
        setSemesters(transformedSemesters);

        // Auto-select first semester if available
        if (transformedSemesters.length > 0) {
          setSelectedSemester(transformedSemesters[0]);
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        setSemesters([]);
      }
    };

    fetchSemesters();
  }, []);

  // Fetch sections when semester changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedSemester) {
        setSections([]);
        setSelectedSection('');
        return;
      }

      try {
        setLoading(true);
        const response = await sectionService.getSectionDropdownForLecturer(
          selectedSemester.id
        );
        if (response) {
          setSections(response || []);

          // Handle navigation from other pages
          if (location.state?.selectedSection) {
            const navSection = location.state.selectedSection;
            const sectionExists = response.find(
              (s) => s.sectionId === navSection.sectionId
            );
            if (sectionExists) {
              setSelectedSection(navSection.sectionId);
            } else {
              setSelectedSection('');
            }
          } else {
            setSelectedSection('');
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
  }, [lecturerId, selectedSemester, location.state]);

  useEffect(() => {
    const fetchStudentsAndGrades = async () => {
      if (!selectedSection) return;

      setLoading(true);
      setLoadingGrades(true);
      try {
        const gradesResponse =
          await gradeService.getAllStudentGradesBySection(selectedSection);

        // Debug: Log raw response to check for duplicates from backend
        if (gradesResponse?.studentGrades) {
          const studentIds = gradesResponse.studentGrades.map(s => s.studentId);
          const uniqueIds = [...new Set(studentIds)];
          if (studentIds.length !== uniqueIds.length) {
            console.error('⚠️ BACKEND BUG: API trả về duplicate students!');
            console.error('Tổng số students từ API:', studentIds.length);
            console.error('Số students unique:', uniqueIds.length);
            console.error('Số students bị duplicate:', studentIds.length - uniqueIds.length);
            console.error('API endpoint:', `/api/Grade/GetAllStudentGradesBySection/${selectedSection}`);
          }
        }

        if (!gradesResponse || !gradesResponse.studentGrades) {
          setStudents([]);
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
                  canEdit: grade.canEdit ?? true,
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

        // Remove duplicates based on studentId
        const uniqueStudents = studentsWithGrades.reduce((acc, current) => {
          const exists = acc.find(item => item.studentId === current.studentId);
          if (!exists) {
            acc.push(current);
          } else {
            console.warn('Duplicate student found:', current.studentId, current.fullName);
          }
          return acc;
        }, []);

        if (uniqueStudents.length !== studentsWithGrades.length) {
          console.warn(`Removed ${studentsWithGrades.length - uniqueStudents.length} duplicate students`);
        }

        setStudents(uniqueStudents);
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
      setEditedGrades(new Map());
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
                  canEdit: grade.canEdit ?? true,
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

        // Remove duplicates based on studentId
        const uniqueStudents = studentsWithGrades.reduce((acc, current) => {
          const exists = acc.find(item => item.studentId === current.studentId);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setStudents(uniqueStudents);
        setAssessmentHeaders(gradesResponse.assessmentHeaders || []);
      }
    } else {
      setSnackbar({
        open: true,
        message:
          'Lưu hoàn tất: ' +
          successCount +
          ' thành công, ' +
          failCount +
          ' thất bại',
        severity: 'warning',
      });
    }
  };

  const handleExportTemplate = async () => {
    if (students.length === 0) {
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

    const result = await exportGradesExcel(
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

        if (jsonData.length < 13) {
          setSnackbar({
            open: true,
            message: 'File Excel không hợp lệ hoặc không có dữ liệu sinh viên',
            severity: 'error',
          });
          return;
        }

        const dataRows = jsonData.slice(12);

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

        for (let i = 0; i < validDataRows.length; i++) {
          const row = validDataRows[i];
          const expectedSTT = i + 1;
          const actualSTT = row[0];
          const studentCode = row[1]?.toString().trim();
          const lastName = row[2]?.toString().trim() || '';
          const firstName = row[3]?.toString().trim() || '';
          const fullName = `${lastName} ${firstName}`.trim();

          if (actualSTT !== expectedSTT) {
            setSnackbar({
              open: true,
              message: `Lỗi tại dòng ${i + 13}: STT không đúng. Mong đợi ${expectedSTT}, nhận được ${actualSTT}`,
              severity: 'error',
            });
            return;
          }

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

          if (fullName && systemStudent.fullName !== fullName) {
            console.warn(
              `Warning: Name mismatch at row ${i + 13}. System: "${systemStudent.fullName}", Excel: "${fullName}"`
            );
          }
        }

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

        const columnMapping = [];
        let currentCol = 5;

        ltAssessments.forEach((assessment, index) => {
          columnMapping.push({
            col: currentCol++,
            assessmentId: assessment.assessmentId,
            name: `LT ${index + 1}`,
            type: 'LT',
          });
        });

        thAssessments.forEach((assessment, index) => {
          columnMapping.push({
            col: currentCol++,
            assessmentId: assessment.assessmentId,
            name: `TH ${index + 1}`,
            type: 'TH',
          });
        });

        if (giuaKyAssessment) {
          columnMapping.push({
            col: currentCol++,
            assessmentId: giuaKyAssessment.assessmentId,
            name: 'Giữa kỳ',
            type: 'GK',
          });
        }

        if (cuoiKyAssessment) {
          columnMapping.push({
            col: currentCol++,
            assessmentId: cuoiKyAssessment.assessmentId,
            name: 'Cuối kỳ',
            type: 'CK',
          });
        }

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

        // Validate prerequisites: Check nếu import GK thì phải có đủ LT, TH
        // Check nếu import CK thì phải có đủ LT, TH, GK
        for (let i = 0; i < validDataRows.length; i++) {
          const row = validDataRows[i];
          const studentCode = row[1]?.toString().trim();
          const student = students.find((s) => s.studentCode === studentCode);
          if (!student) continue;

          // Build map of grades being imported for this student
          const importedGrades = new Map();
          for (const colInfo of columnMapping) {
            const value = row[colInfo.col];
            if (value !== undefined && value !== '' && value !== null) {
              importedGrades.set(colInfo.assessmentId, parseFloat(value));
            }
          }

          // Check each imported grade for prerequisites
          for (const colInfo of columnMapping) {
            const value = row[colInfo.col];
            if (value === undefined || value === '' || value === null) continue;

            const assessment = assessmentHeaders.find(a => a.assessmentId === colInfo.assessmentId);
            if (!assessment) continue;

            const assessmentTypeId = assessment.assessmentTypeId;

            // Giữa kỳ: cần đủ LT và TH
            if (assessmentTypeId === 3) {
              const allLTFilled = ltAssessments.every(ltAss => {
                const existingGrade = student.assessmentGrades?.find(g => g.assessmentId === ltAss.assessmentId);
                const hasExisting = existingGrade?.score !== null && existingGrade?.score !== undefined;
                const hasImported = importedGrades.has(ltAss.assessmentId);
                return hasExisting || hasImported;
              });

              const allTHFilled = thAssessments.every(thAss => {
                const existingGrade = student.assessmentGrades?.find(g => g.assessmentId === thAss.assessmentId);
                const hasExisting = existingGrade?.score !== null && existingGrade?.score !== undefined;
                const hasImported = importedGrades.has(thAss.assessmentId);
                return hasExisting || hasImported;
              });

              if (!allLTFilled || !allTHFilled) {
                setSnackbar({
                  open: true,
                  message: `Lỗi tại dòng ${i + 13} (${studentCode}): Không thể import điểm Giữa kỳ vì chưa có đủ điểm Lý thuyết và Thực hành`,
                  severity: 'error',
                });
                return;
              }
            }

            // Cuối kỳ: cần đủ LT, TH và GK
            if (assessmentTypeId === 4) {
              const allLTFilled = ltAssessments.every(ltAss => {
                const existingGrade = student.assessmentGrades?.find(g => g.assessmentId === ltAss.assessmentId);
                const hasExisting = existingGrade?.score !== null && existingGrade?.score !== undefined;
                const hasImported = importedGrades.has(ltAss.assessmentId);
                return hasExisting || hasImported;
              });

              const allTHFilled = thAssessments.every(thAss => {
                const existingGrade = student.assessmentGrades?.find(g => g.assessmentId === thAss.assessmentId);
                const hasExisting = existingGrade?.score !== null && existingGrade?.score !== undefined;
                const hasImported = importedGrades.has(thAss.assessmentId);
                return hasExisting || hasImported;
              });

              let hasGKScore = true;
              if (giuaKyAssessment) {
                const existingGK = student.assessmentGrades?.find(g => g.assessmentId === giuaKyAssessment.assessmentId);
                const hasExistingGK = existingGK?.score !== null && existingGK?.score !== undefined;
                const hasImportedGK = importedGrades.has(giuaKyAssessment.assessmentId);
                hasGKScore = hasExistingGK || hasImportedGK;
              }

              if (!allLTFilled || !allTHFilled || !hasGKScore) {
                setSnackbar({
                  open: true,
                  message: `Lỗi tại dòng ${i + 13} (${studentCode}): Không thể import điểm Cuối kỳ vì chưa có đủ điểm Lý thuyết, Thực hành và Giữa kỳ`,
                  severity: 'error',
                });
                return;
              }
            }
          }
        }

        // Track locked cells for warning (không chặn import, chỉ cảnh báo)
        const lockedCells = [];
        for (const row of validDataRows) {
          const studentCode = row[1]?.toString().trim();
          const student = students.find((s) => s.studentCode === studentCode);
          if (!student) continue;

          const studentGradeData = student.assessmentGrades || [];

          for (const colInfo of columnMapping) {
            const value = row[colInfo.col];
            if (value !== undefined && value !== '' && value !== null) {
              const assessmentId = colInfo.assessmentId;
              const existingGrade = studentGradeData.find(
                (g) => g.assessmentId === assessmentId
              );
              if (!existingGrade?.canEdit) {
                lockedCells.push({
                  studentCode,
                  assessmentName: colInfo.name,
                });
              }
            }
          }
        }

        const newEditedGrades = new Map(editedGrades);
        let importedGradeCount = 0;
        let skippedGradeCount = 0;

        validDataRows.forEach((row) => {
          const studentCode = row[1]?.toString().trim();
          const student = students.find((s) => s.studentCode === studentCode);
          if (!student) return;

          const studentGradeData = student.assessmentGrades || [];

          for (const colInfo of columnMapping) {
            const value = row[colInfo.col];
            if (value !== undefined && value !== '' && value !== null) {
              const assessmentId = colInfo.assessmentId;
              const existingGrade = studentGradeData.find(
                (g) => g.assessmentId === assessmentId
              );

              // Skip nếu canEdit = false (điểm đã bị khóa)
              if (!existingGrade?.canEdit) {
                skippedGradeCount++;
                continue;
              }

              const newScore = parseFloat(value);
              const currentScore = existingGrade?.score;

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

        setEditedGrades(newEditedGrades);

        // Hiển thị message với thông tin về số điểm bị skip
        let message = `Import thành công ${importedGradeCount} điểm từ file Excel.`;
        if (skippedGradeCount > 0) {
          message += ` Đã bỏ qua ${skippedGradeCount} điểm không thể chỉnh sửa (đã khóa hoặc quá hạn).`;
        }
        message += ' Vui lòng nhấn "Lưu Điểm" để lưu vào hệ thống.';

        setSnackbar({
          open: true,
          message: message,
          severity: skippedGradeCount > 0 ? 'warning' : 'success',
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

  // Tính số lượng ô điểm bị khóa
  const lockedGradesCount = useMemo(() => {
    let count = 0;
    students.forEach((student) => {
      student.assessmentGrades?.forEach((grade) => {
        if (!grade.canEdit && grade.score !== null && grade.score !== undefined) {
          count++;
        }
      });
    });
    return count;
  }, [students]);

  // Helper function to check if prerequisites are met for entering grades
  const checkPrerequisites = (record, assessmentId) => {
    const assessment = assessmentHeaders.find(a => a.assessmentId === assessmentId);
    if (!assessment) return { canEnter: true, reason: '' };

    const assessmentTypeId = assessment.assessmentTypeId;

    // Lấy tất cả assessments theo loại
    const ltAssessments = assessmentHeaders.filter(a => a.assessmentTypeId === 1);
    const thAssessments = assessmentHeaders.filter(a => a.assessmentTypeId === 2);
    const giuaKyAssessment = assessmentHeaders.find(a => a.assessmentTypeId === 3);

    // Nếu là Giữa kỳ (typeId = 3): cần có đủ điểm LT và TH (nếu có)
    if (assessmentTypeId === 3) {
      // Chỉ check nếu có assessments LT hoặc TH
      const allLTScores = ltAssessments.length === 0 || ltAssessments.every(ltAss => {
        const grade = record.assessmentGrades?.find(g => g.assessmentId === ltAss.assessmentId);
        const editedScore = editedGrades.get(ltAss.assessmentId)?.get(record.studentId)?.score;
        return (editedScore !== undefined && editedScore !== '') ||
               (grade?.score !== null && grade?.score !== undefined);
      });

      const allTHScores = thAssessments.length === 0 || thAssessments.every(thAss => {
        const grade = record.assessmentGrades?.find(g => g.assessmentId === thAss.assessmentId);
        const editedScore = editedGrades.get(thAss.assessmentId)?.get(record.studentId)?.score;
        return (editedScore !== undefined && editedScore !== '') ||
               (grade?.score !== null && grade?.score !== undefined);
      });

      if (!allLTScores || !allTHScores) {
        return {
          canEnter: false,
          reason: 'Cần nhập đủ điểm Lý thuyết và Thực hành trước khi nhập điểm Giữa kỳ'
        };
      }
    }

    // Nếu là Cuối kỳ (typeId = 4): cần có đủ điểm LT, TH VÀ Giữa kỳ (nếu có)
    if (assessmentTypeId === 4) {
      const allLTScores = ltAssessments.length === 0 || ltAssessments.every(ltAss => {
        const grade = record.assessmentGrades?.find(g => g.assessmentId === ltAss.assessmentId);
        const editedScore = editedGrades.get(ltAss.assessmentId)?.get(record.studentId)?.score;
        return (editedScore !== undefined && editedScore !== '') ||
               (grade?.score !== null && grade?.score !== undefined);
      });

      const allTHScores = thAssessments.length === 0 || thAssessments.every(thAss => {
        const grade = record.assessmentGrades?.find(g => g.assessmentId === thAss.assessmentId);
        const editedScore = editedGrades.get(thAss.assessmentId)?.get(record.studentId)?.score;
        return (editedScore !== undefined && editedScore !== '') ||
               (grade?.score !== null && grade?.score !== undefined);
      });

      let hasGiuaKyScore = true;
      if (giuaKyAssessment) {
        const gkGrade = record.assessmentGrades?.find(g => g.assessmentId === giuaKyAssessment.assessmentId);
        const gkEditedScore = editedGrades.get(giuaKyAssessment.assessmentId)?.get(record.studentId)?.score;
        hasGiuaKyScore = (gkEditedScore !== undefined && gkEditedScore !== '') ||
                        (gkGrade?.score !== null && gkGrade?.score !== undefined);
      }

      if (!allLTScores || !allTHScores || !hasGiuaKyScore) {
        return {
          canEnter: false,
          reason: 'Cần nhập đủ điểm Lý thuyết, Thực hành và Giữa kỳ trước khi nhập điểm Cuối kỳ'
        };
      }
    }

    return { canEnter: true, reason: '' };
  };

  const renderScoreCell = (record, assessmentId) => {
    const assessment = record.assessmentGrades?.find(
      (a) => a.assessmentId === assessmentId
    );

    const currentScore = assessment?.score;

    const editedData = editedGrades.get(assessmentId)?.get(record.studentId);
    const editedValue = editedData?.score;

    const displayValue = editedValue !== undefined ? editedValue : currentScore;
    const hasChanged = editedValue !== undefined && editedValue !== '';

    // Check prerequisites first
    const prerequisiteCheck = checkPrerequisites(record, assessmentId);

    if (!assessment?.canEdit) {
      // Không cho phép chỉnh sửa - Hiển thị với icon khóa (màu xám)
      return (
        <Tooltip
          title="Ô điểm này đã bị khóa. Không thể chỉnh sửa vì điểm đã được xác nhận hoặc đã quá hạn nhập điểm."
          arrow
          placement="top"
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 600,
              color: '#5c6570',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '8px',
              padding: '6px 12px',
              minWidth: 60,
              justifyContent: 'center',
              fontSize: '14px',
              border: '1.5px solid #cbd5e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              cursor: 'not-allowed',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Lock sx={{ fontSize: 14, color: '#8b95a1' }} />
            <span>
              {displayValue !== null &&
              displayValue !== undefined &&
              displayValue !== ''
                ? displayValue
                : '-'}
            </span>
          </Box>
        </Tooltip>
      );
    }

    // Kiểm tra điều kiện tiên quyết - chưa đủ điều kiện (màu xám nhẹ minimalist)
    if (!prerequisiteCheck.canEnter) {
      return (
        <Tooltip
          title={prerequisiteCheck.reason}
          arrow
          placement="top"
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 600,
              color: '#64748b',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '8px',
              padding: '6px 12px',
              minWidth: 60,
              justifyContent: 'center',
              fontSize: '14px',
              border: '1.5px dashed #cbd5e1',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              cursor: 'not-allowed',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Warning sx={{ fontSize: 14, color: '#94a3b8' }} />
            <span>
              {displayValue !== null &&
              displayValue !== undefined &&
              displayValue !== ''
                ? displayValue
                : '-'}
            </span>
          </Box>
        </Tooltip>
      );
    }

    const handleScoreChange = (e) => {
      const value = e.target.value;

      if (value === '') {
        const newEditedGrades = new Map(editedGrades);
        if (!newEditedGrades.has(assessmentId)) {
          newEditedGrades.set(assessmentId, new Map());
        }
        newEditedGrades.get(assessmentId).set(record.studentId, {
          score: '',
          gradeId: assessment?.gradeId || null,
        });
        setEditedGrades(newEditedGrades);
        return;
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return;
      }

      if (numValue < 0 || numValue > 10) {
        setSnackbar({
          open: true,
          message: 'Điểm phải nằm trong khoảng 0-10',
          severity: 'error',
        });
        return;
      }

      const newEditedGrades = new Map(editedGrades);

      if (
        currentScore !== null &&
        currentScore !== undefined &&
        Math.abs(currentScore - numValue) < 0.001
      ) {
        if (newEditedGrades.has(assessmentId)) {
          newEditedGrades.get(assessmentId).delete(record.studentId);
          if (newEditedGrades.get(assessmentId).size === 0) {
            newEditedGrades.delete(assessmentId);
          }
        }
      } else {
        if (!newEditedGrades.has(assessmentId)) {
          newEditedGrades.set(assessmentId, new Map());
        }
        newEditedGrades.get(assessmentId).set(record.studentId, {
          score: numValue,
          gradeId: assessment?.gradeId || null,
        });
      }

      setEditedGrades(newEditedGrades);
    };

    const handleBlur = () => {
      // When blur, if value is empty, remove from editedGrades (revert to original)
      if (editedValue === '') {
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
          displayValue !== null &&
          displayValue !== undefined &&
          displayValue !== ''
            ? displayValue
            : ''
        }
        onChange={handleScoreChange}
        onBlur={handleBlur}
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

  const getAssessmentColumns = () => {
    if (!assessmentHeaders || assessmentHeaders.length === 0) return [];

    const columns = [];

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

    if (ltAssessments.length > 0 || thAssessments.length > 0) {
      const thuongXuyenChildren = [];

      if (ltAssessments.length > 0) {
        thuongXuyenChildren.push({
          title: 'Lý thuyết',
          key: 'thuongky_lt_group',
          align: 'center',
          children: ltAssessments.map((assessment, index) => ({
            title: `LT ${index + 1}`,
            key: `lt_${assessment.assessmentId}_${index}`,
            width: 100,
            align: 'center',
            render: (_, record) =>
              renderScoreCell(record, assessment.assessmentId),
          })),
        });
      }

      if (thAssessments.length > 0) {
        thuongXuyenChildren.push({
          title: 'Thực hành',
          key: 'thuongky_th_group',
          align: 'center',
          children: thAssessments.map((assessment, index) => ({
            title: `TH ${index + 1}`,
            key: `th_${assessment.assessmentId}_${index}`,
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

      <Grid container className="equal-height-cards" spacing={3} sx={{ mb: 4 }}>
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

      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="flex-start">
            {/* Phần chọn học kỳ */}
            <Grid item xs={12} sm={6} lg={2.5}>
              <SearchableAutocomplete
                options={semesters}
                value={selectedSemester}
                onChange={(newValue) => {
                  setSelectedSemester(newValue);
                  setSelectedSection('');
                  setStudents([]);
                  setAssessmentHeaders([]);
                  setEditedGrades(new Map());
                }}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                label="Chọn học kỳ"
                placeholder="Tìm kiếm học kỳ..."
                disabled={loading}
                showSearchIcon={false}
              />
            </Grid>

            {/* Phần chọn lớp học phần */}
            <Grid item xs={12} sm={6} lg={3.5}>
              <SearchableAutocomplete
                options={sections}
                value={
                  sections.find((s) => s.sectionId === selectedSection) || null
                }
                onChange={(newValue) => {
                  setSelectedSection(newValue?.sectionId || '');
                }}
                getOptionLabel={(option) =>
                  `${option.displayName} - ${option.className} (${option.status})`
                }
                isOptionEqualToValue={(option, value) =>
                  option.sectionId === value?.sectionId
                }
                label="Chọn lớp học phần"
                placeholder="Tìm kiếm lớp học phần..."
                disabled={loading || !selectedSemester}
                showSearchIcon={false}
              />
            </Grid>

            {/* Phần buttons */}
            <Grid
              item
              xs={12}
              lg={6}
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: { xs: 'flex-start', lg: 'flex-end' },
              }}
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
                sx={{
                  minWidth: { xs: 'calc(50% - 6px)', sm: 'auto' },
                  flex: { xs: '1 1 calc(50% - 6px)', sm: '0 1 auto' },
                }}
              >
                Lưu Điểm ({editedGrades.size})
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleExportTemplate}
                disabled={!selectedSection || students.length === 0}
                sx={{
                  minWidth: { xs: 'calc(50% - 6px)', sm: 'auto' },
                  flex: { xs: '1 1 calc(50% - 6px)', sm: '0 1 auto' },
                }}
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
                sx={{
                  minWidth: { xs: '100%', sm: 'auto' },
                  flex: { xs: '1 1 100%', sm: '0 1 auto' },
                }}
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

            {/* Alerts - Full width */}
            {(selectedSection && !isSectionOpen) ||
            (selectedSection && lockedGradesCount > 0) ? (
              <Grid item xs={12}>
                {selectedSection && !isSectionOpen && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Lớp học phần này không ở trạng thái "Đang mở". Không thể cập
                    nhật hoặc import điểm.
                  </Alert>
                )}
                {selectedSection && lockedGradesCount > 0 && (
                  <Alert
                    severity="info"
                    icon={<Lock />}
                    sx={{
                      background:
                        'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      border: '1px solid #90caf9',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Có {lockedGradesCount} ô điểm đã bị khóa
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        (các ô điểm này đã được xác nhận hoặc quá hạn chỉnh sửa)
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </Grid>
            ) : null}
          </Grid>
        </Card>
      </Fade>

      {selectedSection ? (
        <Fade in={true} timeout={1200}>
          <Card>
            <Table
              columns={columns}
              dataSource={students}
              loading={loading || loadingGrades}
              rowKey="studentId"
              pagination={false}
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
