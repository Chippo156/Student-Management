import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import sectionService from '../../../../service/sectionService';
import enrollmentService from '../../../../service/enrollmentService';
import { semesterService } from '../../../../service/semesterService';
import curriculumCourseService from '../../../../service/curriculumCourseService';
import academicProgramService from '../../../../service/academicProgramService';
import { userService } from '../../../../service/userService';
import { FILTER_TYPE_MAP } from './constants';

export const useRegistration = () => {
  const [semesters, setSemesters] = useState([]);
  const [semester, setSemester] = useState(null);
  const [registerType, setRegisterType] = useState('new');
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolledSections, setEnrolledSections] = useState([]);
  const [practiceGroups, setPracticeGroups] = useState([]);
  const [selectedPracticeGroup, setSelectedPracticeGroup] = useState(null);
  const [curriculumData, setCurriculumData] = useState(null);
  const [currentSemesterNumber, setCurrentSemesterNumber] = useState(1);
  const [yearOfAdmission, setYearOfAdmission] = useState(null);

  // Load student info to get year of admission
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const data = await userService.getUserInfo();
        if (data && data.yearOfAdmission) {
          setYearOfAdmission(data.yearOfAdmission);
          console.log('👨‍🎓 Student year of admission:', data.yearOfAdmission);
        }
      } catch (error) {
        console.error('Error fetching student info:', error);
      }
    };
    fetchStudentInfo();
  }, []);

  // Load curriculum data
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const data = await academicProgramService.getMyProgramCurriculum();
        if (data && data.semesterCourses) {
          setCurriculumData(data);

          // 🔍 LOG for debugging - Check curriculum data
          console.log('=== CURRICULUM DATA DEBUG ===');
          console.log('📚 Full curriculum data:', data);
          console.log('📝 Semester courses:', data.semesterCourses);

          // Log courses by semester with completion status
          data.semesterCourses.forEach((sem) => {
            console.log(`\n🎓 Học kỳ ${sem.semesterNumber} (${sem.semesterName}):`);
            console.log(`   - Total credits: ${sem.totalCredits}`);
            console.log(`   - Student completed: ${sem.studentCompletedCredits}/${sem.totalCredits} credits`);
            console.log(`   - Courses:`);
            sem.courses.forEach((course) => {
              const status = course.studentProgress?.isCompleted ? '✅ Completed' : '❌ Not completed';
              const required = course.isRequired ? '(Bắt buộc)' : '(Tự chọn)';
              console.log(`      ${course.courseCode} - ${course.courseName} ${required}: ${status}`);
              if (course.studentProgress) {
                console.log(`         Score: ${course.studentProgress.finalScore} | Grade: ${course.studentProgress.gradeLetter}`);
              }
            });
          });
          console.log('\n=== END CURRICULUM DEBUG ===\n');
        }
      } catch (error) {
        console.error('Error fetching curriculum:', error);
      }
    };
    fetchCurriculum();
  }, []);

  // Load semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        const res =
          await semesterService.getSemesterByStudentAndAcceptRegister();
        if (res && Array.isArray(res)) {
          const mapped = res.map((s) => ({
            label: `${s.term} (${s.year})`,
            value: s.semesterId,
            term: s.term, // Keep term for parsing
            year: s.year,
          }));
          setSemesters(mapped);
          setSemester(mapped[0]?.value || null);

          // Parse semester number from first semester - wait for yearOfAdmission
          if (mapped[0] && yearOfAdmission) {
            const parsedSemesterNumber = parseSemesterNumber(
              mapped[0].term,
              mapped[0].year,
              yearOfAdmission
            );
            setCurrentSemesterNumber(parsedSemesterNumber);
            console.log('📊 Initial semester selected:', mapped[0].term, mapped[0].year, '→ Semester number:', parsedSemesterNumber);
          }
        }
      } catch {
        message.error('Không thể tải danh sách học kỳ!');
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, [yearOfAdmission]);

  // Update currentSemesterNumber when semester changes
  useEffect(() => {
    if (semester && semesters.length > 0 && yearOfAdmission) {
      const selectedSemester = semesters.find(s => s.value === semester);
      if (selectedSemester) {
        const parsedSemesterNumber = parseSemesterNumber(
          selectedSemester.term,
          selectedSemester.year,
          yearOfAdmission
        );
        setCurrentSemesterNumber(parsedSemesterNumber);
        console.log('📊 Semester changed to:', selectedSemester.term, selectedSemester.year, '→ Semester number:', parsedSemesterNumber);
      }
    }
  }, [semester, semesters, yearOfAdmission]);

  // Helper function to calculate actual semester number in student's education journey
  // Example: Student admitted 2023, registering for HK2 2025 → Semester 6
  // Formula: (currentYear - yearOfAdmission) * 2 + (1 for HK1 or 2 for HK2)
  const parseSemesterNumber = (term, year, admissionYear) => {
    if (!term || !year || !admissionYear) return 1;

    // Parse "HK1", "HK2", etc.
    const match = term.match(/HK\s*(\d+)/i);
    if (!match) return 1;

    const semesterInYear = parseInt(match[1], 10); // 1 for HK1, 2 for HK2
    const yearsPassed = year - admissionYear;
    const calculatedSemester = yearsPassed * 2 + semesterInYear;

    console.log(`🧮 Calculation: Year ${year} - Admission ${admissionYear} = ${yearsPassed} years`);
    console.log(`   → ${yearsPassed} * 2 + ${semesterInYear} = Semester ${calculatedSemester}`);

    return calculatedSemester;
  };

  // Fetch courses
  const fetchCourses = useCallback(
    async (currentSemester = semester, currentRegisterType = registerType) => {
      if (!currentSemester) return;
      try {
        setLoading(true);
        const filterType = FILTER_TYPE_MAP[currentRegisterType];
        const res = await curriculumCourseService.getCoursesByStudentDepartment(
          currentSemester,
          filterType
        );
        if (res && Array.isArray(res)) {
          setCourses(
            res.map((c) => ({
              ...c,
              prerequisites: c.prerequisites || [],
              registrationNote: c.registrationNote || '',
            }))
          );
        } else {
          message.warning('Không có môn học nào cho học kỳ này!');
          setCourses([]);
        }
      } catch (err) {
        message.error(err.message || 'Lỗi tải môn học!');
      } finally {
        setLoading(false);
      }
    },
    [semester, registerType]
  );

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Load enrolled sections
  useEffect(() => {
    const fetchEnrolledSections = async () => {
      if (!semester) return;
      try {
        setLoading(true);
        const res = await enrollmentService.getEnrolledByStudent(semester);
        setEnrolledSections(res || []);
      } catch {
        setEnrolledSections([]);
        message.error('Không thể tải lớp học phần đã đăng ký!');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledSections();
  }, [semester]);

  // Reset on semester/type change
  useEffect(() => {
    setSelectedCourse(null);
    setSelectedSection(null);
    setSections([]);
    setSchedule([]);
    setPracticeGroups([]);
    setSelectedPracticeGroup(null);
  }, [semester, registerType]);

  // Select course
  const handleCourseSelect = async (record) => {
    setSelectedCourse(record);
    setSelectedSection(null);
    setSchedule([]);
    try {
      setLoading(true);
      const data =
        await sectionService.getSectionsByCurriculumCourseAndSemester(
          record.curriculumCourseId,
          semester
        );
      if (data && data.length > 0) {
        setSections(data);
      } else {
        message.warning('Không tìm thấy lớp học phần!');
        setSections([]);
      }
    } catch (err) {
      message.error(err.message || 'Lỗi tải lớp học phần!');
    } finally {
      setLoading(false);
    }
  };

  // Select section
  const handleSectionSelect = async (record) => {
    setSelectedSection(record);
    try {
      setLoading(true);
      const data = await sectionService.getSectionScheduleWithRegistration(
        record.sectionId
      );
      if (data && data.schedules) {
        setSchedule(data.schedules);
        setPracticeGroups(data.practiceGroups || []);
        if (data.practiceGroups && data.practiceGroups.length === 1) {
          setSelectedPracticeGroup(data.practiceGroups[0].practiceGroupId);
        } else {
          setSelectedPracticeGroup(data.studentCurrentPracticeGroup || null);
        }
      } else {
        message.warning('Không tìm thấy lịch học!');
        setSchedule([]);
        setPracticeGroups([]);
        setSelectedPracticeGroup(null);
      }
    } catch (err) {
      message.error(err.message || 'Lỗi tải lịch học!');
    } finally {
      setLoading(false);
    }
  };

  // Enroll
  const handleEnroll = async () => {
    if (!selectedSection) return message.warning('Vui lòng chọn lớp học phần!');
    try {
      setLoading(true);
      await enrollmentService.enrollInCourse({
        sectionId: selectedSection.sectionId,
        practiceGroupId:
          practiceGroups.length > 0 ? selectedPracticeGroup : null,
      });
      message.success('Đăng ký học phần thành công!');
      const res = await enrollmentService.getEnrolledByStudent(semester);
      setEnrolledSections(res || []);
      await fetchCourses();
      setSelectedCourse(null);
      setSelectedSection(null);
      setSections([]);
      setSchedule([]);
      setPracticeGroups([]);
      setSelectedPracticeGroup(null);
    } catch (err) {
      message.error(err.message || 'Đăng ký học phần thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Drop enrollment
  const handleDropEnrollment = async (sectionId) => {
    try {
      setLoading(true);
      await enrollmentService.dropEnrollmentStudent(sectionId);
      message.success('Hủy đăng ký học phần thành công!');
      const res = await enrollmentService.getEnrolledByStudent(semester);
      setEnrolledSections(res || []);
      await fetchCourses();
      setSelectedCourse(null);
      setSelectedSection(null);
      setSections([]);
      setSchedule([]);
      setPracticeGroups([]);
      setSelectedPracticeGroup(null);
    } catch (err) {
      message.error(err.message || 'Hủy đăng ký học phần thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return {
    semesters,
    semester,
    setSemester,
    registerType,
    setRegisterType,
    courses,
    sections,
    selectedCourse,
    selectedSection,
    schedule,
    loading,
    enrolledSections,
    practiceGroups,
    selectedPracticeGroup,
    setSelectedPracticeGroup,
    handleCourseSelect,
    handleSectionSelect,
    handleEnroll,
    handleDropEnrollment,
    curriculumData,
    currentSemesterNumber,
  };
};
