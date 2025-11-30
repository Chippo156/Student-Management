import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const coursesTableRef = useRef(null);
  const sectionsTableRef = useRef(null);
  const scheduleDetailRef = useRef(null);
  const enrolledTableRef = useRef(null);

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
        case 'semesterFilter':
          return semesters.length > 0; // Luôn hiển thị khi có data
        case 'coursesTable':
          return courses.length > 0; // Hiển thị khi có môn học
        case 'sectionsTable':
          return selectedCourse !== null && sections.length > 0; // Hiển thị khi đã chọn môn học
        case 'scheduleDetail':
          return selectedSection !== null; // Hiển thị khi đã chọn lớp học phần
        case 'enrolledTable':
          return true; // Luôn hiển thị vì component luôn được mount
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

      console.log(`getTargetElement for ${componentType}:`, {
        element,
        isVisible,
        isScrolling,
        'element.getBoundingClientRect()': element?.getBoundingClientRect(),
        'window.scrollY': window.scrollY,
      });

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
  // Tạo các steps động nhưng chỉ update khi cần thiết
  const allSteps = [
    {
      title: '1️⃣ Chọn học kỳ',
      description:
        'Đầu tiên, hãy chọn học kỳ và loại đăng ký (Đăng ký mới hoặc Đăng ký bổ sung) để xem danh sách môn học có thể đăng ký.',
      target: getTargetElement(semesterFilterRef, 'semesterFilter'),
      placement: 'bottom',
    },
    {
      title: '2️⃣ Chọn môn học',
      description:
        'Click vào môn học bạn muốn đăng ký. Hệ thống sẽ hiển thị danh sách các lớp học phần của môn đó.',
      target: getTargetElement(coursesTableRef, 'coursesTable'),
      placement: 'top',
    },
    {
      title: '3️⃣ Chọn lớp học phần',
      description:
        'Chọn lớp học phần phù hợp. Bạn có thể bật "Chỉ hiển thị lớp không trùng lịch" để lọc các lớp không bị xung đột với lịch hiện tại.',
      target: getTargetElement(sectionsTableRef, 'sectionsTable'),
      placement: 'top',
    },
    {
      title: '4️⃣ Xem lịch học và đăng ký',
      description:
        'Kiểm tra lịch học chi tiết của lớp. Nếu môn có thực hành, hãy chọn nhóm thực hành. Sau đó click nút "Đăng ký" để hoàn tất.',
      target: getTargetElement(scheduleDetailRef, 'scheduleDetail'),
      placement: 'top',
    },
    {
      title: '5️⃣ Quản lý môn đã đăng ký',
      description:
        'Xem danh sách các môn đã đăng ký thành công. Bạn có thể hủy đăng ký nếu cần thiết trong thời gian cho phép.',
      target: getTargetElement(enrolledTableRef, 'enrolledTable'),
      placement: 'top',
    },
  ];

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
        bodyStyle={{ padding: 32 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3.5,
          }}
        >
          <Title
            level={3}
            style={{
              color: theme.palette.primary.main,
              margin: 0,
              fontWeight: 700,
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
            }}
          >
            Hướng dẫn sử dụng
          </Button>
        </Box>

        <SemesterFilter
          ref={semesterFilterRef}
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
          console.log(`Tour onChange: step ${current}`);
          setCurrentStep(current); // Cập nhật current step ngay lập tức

          const step = allSteps[current];
          const target = step?.target?.();

          if (!target) {
            console.log('No target found for step', current);
            return;
          }

          const beforeRect = target.getBoundingClientRect();
          const beforeAbsoluteY = beforeRect.top + window.scrollY;

          console.log(`Step ${current + 1} - BEFORE scroll:`, {
            'window.scrollY': window.scrollY,
            'target.top (viewport)': beforeRect.top,
            'target absolute Y': beforeAbsoluteY,
            'target.height': beforeRect.height,
          });

          // Scroll nếu target không ở trong khoảng 80-150px từ đầu viewport
          const idealTop = 100; // Vị trí lý tưởng

          if (beforeRect.top < 80 || beforeRect.top > 150) {
            console.log('Scrolling to adjust target position');
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

                console.log(`Step ${current + 1} - AFTER scroll:`, {
                  'window.scrollY': window.scrollY,
                  'target.top (viewport)': afterRect.top,
                  'target absolute Y': afterAbsoluteY,
                  'chênh lệch viewport top': afterRect.top - beforeRect.top,
                  'chênh lệch absolute Y': afterAbsoluteY - beforeAbsoluteY,
                });

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
