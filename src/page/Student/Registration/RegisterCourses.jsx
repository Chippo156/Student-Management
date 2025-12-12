import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, Typography, Tour, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useRegistration } from '../../../component/Student/Registration/RegisterCourses/useRegistration';
import SemesterFilter from '../../../component/Student/Registration/RegisterCourses/SemesterFilter';
import CoursesTable from '../../../component/Student/Registration/RegisterCourses/CoursesTable';
import SectionsTable from '../../../component/Student/Registration/RegisterCourses/SectionsTable';
import ScheduleDetail from '../../../component/Student/Registration/RegisterCourses/ScheduleDetail';
import EnrolledTable from '../../../component/Student/Registration/RegisterCourses/EnrolledTable';

const { Title } = Typography;

const RegisterCourses = () => {
  const theme = useTheme();
  const [showOnlyNonConflict, setShowOnlyNonConflict] = useState(false);
  const [openTour, setOpenTour] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Cache lại steps để không bị tạo lại khi re-render
  const allStepsRef = useRef([]);

  // Refs for tour targets
  const semesterFilterRef = useRef(null);
  const semesterSelectRef = useRef(null);
  const registerTypeRef = useRef(null);
  const coursesTableRef = useRef(null);
  const suggestedCourseBadgeRef = useRef(null);
  const prerequisiteColumnRef = useRef(null);
  const sectionsTableRef = useRef(null);
  const scheduleDetailRef = useRef(null);
  const practiceGroupSelectRef = useRef(null);
  const enrollButtonRef = useRef(null);
  const enrolledTableRef = useRef(null);
  const actionColumnRef = useRef(null);

  const {
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
  } = useRegistration();

  // Theo dõi khi nào data đã load xong
  useEffect(() => {
    if (!loading && semesters.length > 0) {
      // Đợi một chút để components được render hoàn tất
      const timer = setTimeout(() => {
        setIsDataLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, semesters]);

  // Hàm để kiểm tra component có đang hiển thị và có data không
  const isComponentVisible = useCallback(
    (componentType) => {
      if (!isDataLoaded) return false;

      switch (componentType) {
        case 'semesterSelect':
        case 'registerType':
          return semesters.length > 0; // Luôn hiển thị khi có data
        case 'coursesTable':
          return courses.length > 0; // Hiển thị khi có môn học
        case 'suggestedCourseBadge':
        case 'prerequisiteColumn':
          return courses.length > 0; // Hiển thị khi có môn học
        case 'sectionsTable':
          return selectedCourse !== null && sections.length > 0; // Hiển thị khi đã chọn môn học
        case 'scheduleDetail':
        case 'practiceGroupSelect':
        case 'enrollButton':
          return selectedSection !== null; // Hiển thị khi đã chọn lớp học phần
        case 'enrolledTable':
          return true; // Luôn hiển thị vì component luôn được mount
        case 'actionColumn':
          return enrolledSections.length > 0; // Chỉ hiển thị khi có môn đã đăng ký
        default:
          return false;
      }
    },
    [
      isDataLoaded,
      semesters,
      courses,
      selectedCourse,
      sections,
      selectedSection,
      schedule,
      enrolledSections,
    ]
  );

  // Đảm bảo ref đã mount trước khi trả về element
  const getTargetElement = (ref, componentType) => {
    return () => {
      const element = ref.current;
      const isVisible = isComponentVisible(componentType);

      // Nếu đang scroll, trả về null để Tour không hiển thị
      if (isScrolling) {
        return null;
      }

      // Nếu component không visible hoặc element không tồn tại, trả về null
      if (!isVisible || !element) {
        return null;
      }

      return element;
    };
  };
  // Helper to check if there are any suggested courses
  const hasSuggestedCourses = useCallback(() => {
    if (!curriculumData || !curriculumData.semesterCourses || courses.length === 0) {
      console.log('🔍 hasSuggestedCourses: No data available', {
        hasCurriculum: !!curriculumData,
        coursesCount: courses.length,
        currentSemesterNumber
      });
      return false;
    }

    const suggestedCourses = [];
    courses.forEach(course => {
      for (const semesterData of curriculumData.semesterCourses) {
        const foundCourse = semesterData.courses.find(c => c.courseCode === course.courseCode);
        if (foundCourse &&
            foundCourse.isRequired &&
            foundCourse.semesterSuggested === currentSemesterNumber &&
            !foundCourse.studentProgress?.isCompleted) {
          suggestedCourses.push({
            code: course.courseCode,
            name: course.courseName,
            semesterSuggested: foundCourse.semesterSuggested,
            completed: foundCourse.studentProgress?.isCompleted
          });
        }
      }
    });

    console.log(`🎯 Suggested courses for HK${currentSemesterNumber}:`, suggestedCourses);
    console.log(`   Total courses: ${courses.length} | Suggested: ${suggestedCourses.length}`);

    return suggestedCourses.length > 0;
  }, [curriculumData, courses, currentSemesterNumber]);

  // Helper to check if there are any courses with prerequisites
  const hasCoursesWithPrerequisites = useCallback(() => {
    const hasPrereqs = courses.some(course => course.prerequisites && course.prerequisites.length > 0);
    console.log('🔍 hasCoursesWithPrerequisites:', hasPrereqs);
    return hasPrereqs;
  }, [courses]);

  // Tạo các steps động - sử dụng useMemo để regenerate khi dependencies thay đổi
  const allSteps = useMemo(() => {
    console.log('🔄 Regenerating Tour steps...', {
      currentSemesterNumber,
      coursesCount: courses.length,
      hasCurriculum: !!curriculumData
    });

    const baseSteps = [
    {
      title: '1️⃣ Chọn Đợt đăng ký',
      description:
        'Click dropdown để chọn học kỳ (VD: HK1 (2026), HK2 (2026)...).\n\n💡 Hệ thống sẽ tự động gợi ý các môn bắt buộc của học kỳ đó!',
      target: getTargetElement(semesterSelectRef, 'semesterSelect'),
      placement: 'bottom',
    },
    {
      title: '2️⃣ Chọn Loại đăng ký',
      description:
        'Chọn 1 trong 3 loại:\n\n🔘 HỌC MỚI - Học lần đầu\n🔘 HỌC LẠI - Điểm F, cần học lại\n🔘 HỌC CẢI THIỆN - Đã qua môn, muốn cải thiện điểm',
      target: getTargetElement(registerTypeRef, 'registerType'),
      placement: 'bottom',
    },
    {
      title: '3️⃣ Bảng môn học',
      description:
        'Danh sách môn học có thể đăng ký.\n\n📌 Chú ý:\n• ✅/❌ = Bắt buộc/Tự chọn\n• Học phần tiên quyết = Môn phải học trước\n• Ghi chú màu đỏ = Điều kiện đặc biệt',
      target: getTargetElement(coursesTableRef, 'coursesTable'),
      placement: 'top',
    },
  ];

  // Conditionally add step 3a if there are suggested courses
  if (hasSuggestedCourses()) {
    baseSteps.push({
      title: '3a. Môn ĐỀ XUẤT ⭐',
      description:
        '⭐ Các môn có nhãn "★ Đề xuất HK' + currentSemesterNumber + '" và viền trái xanh lá:\n\n• Là môn BẮT BUỘC của HK' + currentSemesterNumber + '\n• Bạn CHƯA hoàn thành\n• NÊN ƯU TIÊN đăng ký trước!',
      target: getTargetElement(suggestedCourseBadgeRef, 'suggestedCourseBadge'),
      placement: 'bottom',
    });
  }

  // Conditionally add step 3b if there are courses with prerequisites
  if (hasCoursesWithPrerequisites()) {
    baseSteps.push({
      title: '3b. Học phần TIÊN QUYẾT',
      description:
        '📋 Cột "Học phần tiên quyết" hiển thị môn phải ĐẠT trước.\n\n⚠️ Nếu cột TRỐNG → Đăng ký tự do\n⚠️ Nếu có môn → PHẢI đạt TẤT CẢ mới được đăng ký',
      target: getTargetElement(prerequisiteColumnRef, 'prerequisiteColumn'),
      placement: 'bottom',
    });
  }

  // Add step 3c (always show)
  baseSteps.push({
      title: '3c. Chọn môn học',
      description:
        '🎯 Click vào dòng để chọn môn:\n\n1. Ưu tiên môn có "★ Đề xuất"\n2. Kiểm tra tiên quyết\n3. Click radio hoặc dòng → Nền vàng = đã chọn',
      target: getTargetElement(coursesTableRef, 'coursesTable'),
      placement: 'top',
    });

  // Add remaining steps
  baseSteps.push(
    {
      title: '4️⃣ Danh sách Lớp học phần',
      description:
        'Sau khi chọn môn → Bảng lớp học phần hiện ra.\n\n📋 Xem:\n• Mã lớp, Giảng viên, Sĩ số\n• Trạng thái: ✅ Còn chỗ | ❌ Đầy | ⚠️ Trùng lịch\n\n👉 Click dòng để xem lịch chi tiết',
      target: getTargetElement(sectionsTableRef, 'sectionsTable'),
      placement: 'top',
    },
    {
      title: '5️⃣ Chi tiết Lịch học',
      description:
        'Xem lịch học chi tiết:\n\n🔵 Nền XANH = Lý thuyết\n🟡 Nền VÀNG = Thực hành\n\n⚠️ Kiểm tra không trùng lịch!',
      target: getTargetElement(scheduleDetailRef, 'scheduleDetail'),
      placement: 'top',
    },
    {
      title: '6️⃣ Chọn Nhóm thực hành',
      description:
        '⚠️ Nếu có thực hành → BẮT BUỘC chọn nhóm!\n\nClick dropdown góc phải → Chọn nhóm còn chỗ và phù hợp lịch.\n\n⚠️ Không chọn → Nút đăng ký bị vô hiệu hóa!',
      target: getTargetElement(practiceGroupSelectRef, 'practiceGroupSelect'),
      placement: 'bottom',
    },
    {
      title: '7️⃣ Hoàn tất Đăng ký',
      description:
        '✅ Sau khi:\n• Xem kỹ lịch học\n• Chọn nhóm TH (nếu có)\n• Kiểm tra không trùng lịch\n\n👉 Click nút "Đăng ký môn học" xanh',
      target: getTargetElement(enrollButtonRef, 'enrollButton'),
      placement: 'top',
    },
    {
      title: '8️⃣ Môn đã đăng ký',
      description:
        'Xem danh sách tất cả môn đã đăng ký thành công.\n\n📌 Bao gồm:\n• Mã lớp, Tên môn, Tín chỉ\n• Nhóm TH, Học phí, Hạn nộp\n• Trạng thái đăng ký',
      target: getTargetElement(enrolledTableRef, 'enrolledTable'),
      placement: 'top',
    },
    {
      title: '9️⃣ Xem chi tiết / Hủy đăng ký',
      description:
        'Click nút "Thao tác" 📋 để:\n\n• 📋 Xem chi tiết lịch học\n• 🗑️ Hủy đăng ký (màu đỏ)\n\n⚠️ Chỉ được hủy trong thời gian quy định!',
      target: getTargetElement(actionColumnRef, 'actionColumn'),
      placement: 'right',
    }
  );

    // Return the final steps array
    return baseSteps;
  }, [curriculumData, courses, currentSemesterNumber, hasSuggestedCourses, hasCoursesWithPrerequisites, getTargetElement, semesterSelectRef, registerTypeRef, coursesTableRef, suggestedCourseBadgeRef, prerequisiteColumnRef, sectionsTableRef, scheduleDetailRef, practiceGroupSelectRef, enrollButtonRef, enrolledTableRef, actionColumnRef]);

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: '100vh',
        p: { xs: 2, sm: 2, md: 3 },
        width: '100%',
      }}
    >
      <style>
        {`
        .register-courses .ant-table {
          background: ${theme.palette.background.paper} !important;
          color: ${theme.palette.text.primary} !important;
        }
        .register-courses .ant-table-thead > tr > th {
          background: ${theme.palette.mode === 'dark' ? theme.palette.background.paper : alpha(theme.palette.primary.light, 0.15)} !important;
          color: ${theme.palette.text.primary} !important;
          font-weight: 600;
          text-align: center;
          border-color: ${theme.palette.divider} !important;
        }
        .register-courses .ant-table-tbody > tr > td {
          border-color: ${theme.palette.divider} !important;
          color: ${theme.palette.text.primary} !important;
        }
        .register-courses .ant-table-row:hover > td {
          background: ${theme.palette.action.hover} !important;
        }
        .register-courses .table-row-light { background: ${theme.palette.background.paper}; }
        .register-courses .table-row-dark { background: ${alpha(theme.palette.background.paper, 0.5)}; }
        .register-courses .table-row-selected { background: ${alpha(theme.palette.warning.main, 0.15)} !important; }
        .register-courses .schedule-row-lythuyet { background: ${alpha(theme.palette.primary.main, 0.1)} !important; }
        .register-courses .schedule-row-thuchanh-active { background: ${alpha(theme.palette.warning.main, 0.12)} !important; }
        .register-courses .schedule-row-thuchanh { background: ${theme.palette.background.paper} !important; }
        .register-courses .ant-select-selector { background: ${theme.palette.background.paper} !important; color: ${theme.palette.text.primary} !important; border-color: ${theme.palette.divider} !important; }
        .register-courses .ant-radio-wrapper { color: ${theme.palette.text.primary}; }
        .register-courses .ant-btn { border-color: ${theme.palette.divider} !important; }
        .register-courses .ant-card {
          background: ${theme.palette.background.paper} !important;
          border-color: ${theme.palette.divider} !important;
          color: ${theme.palette.text.primary} !important;
        }

        /* Tour responsive styles - Fix overflow on mobile */
        .ant-tour {
          max-width: 100vw !important;
        }

        .ant-tour .ant-tour-inner {
          max-width: calc(100vw - 32px) !important;
          width: auto !important;
          box-sizing: border-box !important;
        }

        .ant-tour-content {
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
        }

        @media (max-width: 600px) {
          .ant-tour {
            left: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
            max-width: 100vw !important;
            padding: 0 12px !important;
          }

          .ant-tour .ant-tour-inner {
            max-width: 100% !important;
            padding: 12px !important;
            margin: 0 !important;
          }

          .ant-tour-title {
            font-size: 15px !important;
            line-height: 1.4 !important;
            margin-bottom: 8px !important;
          }

          .ant-tour-description {
            font-size: 12px !important;
            line-height: 1.5 !important;
            margin-bottom: 12px !important;
          }

          .ant-tour-footer {
            gap: 6px !important;
            flex-wrap: wrap !important;
          }

          .ant-tour-footer .ant-btn {
            font-size: 12px !important;
            padding: 4px 10px !important;
            height: auto !important;
            min-height: 28px !important;
          }

          .ant-tour-indicators {
            gap: 4px !important;
            margin-top: 8px !important;
          }

          .ant-tour-indicator {
            width: 6px !important;
            height: 6px !important;
          }

          .ant-tour-arrow {
            display: none !important;
          }
        }

        @media (min-width: 601px) and (max-width: 960px) {
          .ant-tour .ant-tour-inner {
            max-width: calc(100vw - 48px) !important;
          }

          .ant-tour-title {
            font-size: 17px !important;
          }

          .ant-tour-description {
            font-size: 14px !important;
          }
        }
        `}
      </style>
      <Card
        className="register-courses"
        style={{
          borderRadius: 12,
          background: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 2px 12px rgba(0,0,0,0.3)'
              : '0 2px 12px rgba(0,0,0,0.08)',
        }}
        bodyStyle={{
          padding:
            window.innerWidth < 600 ? 16 : window.innerWidth < 960 ? 24 : 32,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: 3.5,
          }}
        >
          <Title
            level={3}
            style={{
              color: theme.palette.primary.main,
              margin: 0,
              fontWeight: 700,
              fontSize: window.innerWidth < 600 ? '1.25rem' : '1.5rem',
            }}
          >
            ĐĂNG KÝ HỌC PHẦN
          </Title>
          <Button
            type="primary"
            icon={<QuestionCircleOutlined />}
            onClick={() => {
              if (isDataLoaded) {
                // Reset về step 0 khi bắt đầu tour mới
                setCurrentStep(0);
                setIsScrolling(false);
                // Đợi thêm một chút nữa để đảm bảo tất cả refs đã được gán
                setTimeout(() => setOpenTour(true), 100);
              } else {
                console.log('Data is still loading, please wait...');
              }
            }}
            style={{
              borderRadius: 8,
              fontWeight: 500,
              width: window.innerWidth < 600 ? '100%' : 'auto',
            }}
          >
            Hướng dẫn sử dụng
          </Button>
        </Box>

        <SemesterFilter
          ref={semesterFilterRef}
          semesterSelectRef={semesterSelectRef}
          registerTypeRef={registerTypeRef}
          theme={theme}
          semesters={semesters}
          semester={semester}
          setSemester={setSemester}
          registerType={registerType}
          setRegisterType={setRegisterType}
        />

        <CoursesTable
          ref={coursesTableRef}
          theme={theme}
          courses={courses}
          selectedCourse={selectedCourse}
          handleCourseSelect={handleCourseSelect}
          loading={loading}
          currentSemesterNumber={currentSemesterNumber}
          curriculumData={curriculumData}
          suggestedCourseBadgeRef={suggestedCourseBadgeRef}
          prerequisiteColumnRef={prerequisiteColumnRef}
        />

        <SectionsTable
          ref={sectionsTableRef}
          theme={theme}
          sections={sections}
          selectedSection={selectedSection}
          handleSectionSelect={handleSectionSelect}
          loading={loading}
          selectedCourse={selectedCourse}
          showOnlyNonConflict={showOnlyNonConflict}
          setShowOnlyNonConflict={setShowOnlyNonConflict}
        />

        <ScheduleDetail
          ref={scheduleDetailRef}
          enrollButtonRef={enrollButtonRef}
          practiceGroupSelectRef={practiceGroupSelectRef}
          theme={theme}
          selectedSection={selectedSection}
          schedule={schedule}
          practiceGroups={practiceGroups}
          selectedPracticeGroup={selectedPracticeGroup}
          setSelectedPracticeGroup={setSelectedPracticeGroup}
          handleEnroll={handleEnroll}
        />

        <EnrolledTable
          ref={enrolledTableRef}
          actionColumnRef={actionColumnRef}
          theme={theme}
          enrolledSections={enrolledSections}
          handleDropEnrollment={handleDropEnrollment}
          loading={loading}
        />
      </Card>

      <Tour
        open={openTour && !isScrolling}
        onClose={() => {
          setOpenTour(false);
          setCurrentStep(0); // Reset step khi đóng tour
        }}
        steps={allSteps}
        current={currentStep}
        onChange={(current) => {
          setCurrentStep(current); // Cập nhật current step ngay lập tức

          const step = allSteps[current];
          const target = step?.target?.();

          if (!target) {
            return;
          }

          const beforeRect = target.getBoundingClientRect();
          const beforeAbsoluteY = beforeRect.top + window.scrollY;

          // Scroll nếu target không ở trong khoảng 80-150px từ đầu viewport
          const idealTop = 100; // Vị trí lý tưởng

          if (beforeRect.top < 80 || beforeRect.top > 150) {
            // Ẩn Tour trong khi scroll
            setIsScrolling(true);

            setTimeout(() => {
              // Tính toán scroll để target nằm ở vị trí idealTop
              const targetScrollY = beforeAbsoluteY - idealTop;

              window.scrollTo({
                top: targetScrollY,
                behavior: 'smooth',
              });

              // Đợi scroll xong (800ms) rồi hiện Tour lại
              setTimeout(() => {
                const afterRect = target.getBoundingClientRect();
                const afterAbsoluteY = afterRect.top + window.scrollY;

                setIsScrolling(false);
              }, 800);
            }, 100);
          } else {
            console.log('Target already in good position, no scroll needed');
          }
        }}
        scrollIntoViewOptions={false}
        mask={true}
        type="default"
        placement="bottom"
      />
    </Box>
  );
};

export default RegisterCourses;
