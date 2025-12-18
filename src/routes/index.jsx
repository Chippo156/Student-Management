import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

// Import components
import ProtectedRoute from '../component/ProtectedRoute';
import AuthLoader from '../component/AuthLoader';

// Import pages
import Home from '../page/Home';
import Login from '../page/Login';
import NotificationHistory from '../page/NotificationHistory';

// Admin pages
import AdminDashboard from '../page/Admin/Dashboard';
import UserManagement from '../page/Admin/UserManagement';
import CreateUser from '../page/Admin/UserManagement/CreateUser';
import Classes from '../page/Admin/EducationManagement/Classes';
import TuitionFees from '../page/Admin/TuitionManagement/TuitionFees';
import SendNotifications from '../page/Admin/SendNotifications';
import Curriculum from '../page/Admin/EducationManagement/Curriculum';
import Sections from '../page/Admin/EducationManagement/Sections';
import RegistrationPeriod from '../page/Admin/EducationManagement/RegistrationPeriod';

// Admin management pages
import StudentList from '../page/Admin/StudentManagement/StudentList';
import TeacherList from '../page/Admin/EducationManagement/TeacherList';

// Grade management pages
import GradeEntry from '../page/Admin/GradeManagement/GradeEntry';
import GradeSheet from '../page/Admin/GradeManagement/GradeSheet';
import GradeStatistics from '../page/Admin/GradeManagement/GradeStatistics';

// Student pages
import StudentDashboard from '../page/Student/Dashboard';
import StudentInfoPage from '../page/Student/General information/StudentInfoPage';
import BHYTPage from '../page/Student/General information/BHYTPage';
import GraduatePage from '../page/Student/Study/GraduatePage';
import BankInfo from '../page/Student/General information/BankInfo';
import StudentGrades from '../page/Student/Study/StudentGrades';
import StudentSchedule from '../page/Student/Study/StudentSchedule';
import StudentEditInfoPage from '../page/Student/General information/StudentEditInfoPage';
import RegisterCourses from '../page/Student/Registration/RegisterCourses';
import CurriculumPage from '../page/Student/Registration/CurriculumPage';
import DebtPageComponent from '../page/Student/Finance/DebtPage';
import SelfCheckIn from '../page/Student/Attendance/SelfCheckIn';
// Teacher pages
import TeacherDashboard from '../component/Teacher/Dashboard';
import TeacherCourses from '../component/Teacher/Pages/CoursesPage';
import TeacherSchedule from '../component/Teacher/Pages/SchedulePage';
import TeacherStudents from '../component/Teacher/Pages/StudentsPage';
import TeacherStudentsByClass from '../component/Teacher/Pages/TeacherStudentsPage';
import TeacherGrades from '../component/Teacher/Pages/GradesPage';
import TeacherAttendance from '../component/Teacher/Pages/AttendancePage';
import TeacherAssignments from '../component/Teacher/Pages/AssignmentsPage';
import TeacherMaterials from '../component/Teacher/Pages/MaterialsPage';
import TeacherSettings from '../component/Teacher/Pages/SettingsPage';

// Layout components
import LayoutUser from '../component/LayoutUser/LayoutUser';
import LayoutAdmin from '../component/LayoutAdmin/LayoutAdmin';
import LayoutStudent from '../component/LayoutStudent/LayoutStudent';
import LayoutTeacher from '../component/LayoutTeacher/LayoutTeacher';
import CourseManagement from '~/page/Admin/CourseManagement';
import SystemSettings from '~/page/Admin/SystemSettings';

const RegisterCoursePage = () => (
  <div style={{ padding: '24px' }}>
    <h2>Đăng ký học phần</h2>
    <p>Component đăng ký học phần đang được phát triển...</p>
  </div>
);


const PaymentPage = () => (
  <div style={{ padding: '24px' }}>
    <h2>Thanh toán trực tuyến</h2>
    <p>Component thanh toán đang được phát triển...</p>
  </div>
);

const TimelinePage = () => (
  <div style={{ padding: '24px' }}>
    <h2>Lịch theo tiến độ</h2>
    <p>Component lịch theo tiến độ đang được phát triển...</p>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, account } = useAppSelector((state) => state.user);
  const location = useLocation();
  const getDashboardByRole = () => {
    const role = localStorage.getItem('role');
    if (!account || !role) {
      return '/login';
    }
    switch (role * 1) {
      case 1:
        return '/admin';
      case 2:
        return '/student';
      case 3:
        return '/teacher';
      default:
        return '/login';
    }
  };

  // Component để handle trang mặc định với role check
  const HomePageHandler = () => {
    if (!isAuthenticated && location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
    if (isAuthenticated) {
      return <Navigate to={getDashboardByRole()} replace />;
    }
    return null;
  };

  return (
    <AuthLoader>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LayoutUser />}>
          {/* Trang mặc định - check role và redirect */}
          <Route index element={<HomePageHandler />} />

          {/* Auth routes - chỉ hiển thị khi chưa đăng nhập */}
          <Route
            path="login"
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to={getDashboardByRole()} replace />
              )
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            // <ProtectedRoute allowedRole={1}>
            <LayoutAdmin />
            // </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          {/* Quản lý Tài khoản */}
          <Route path="users" element={<UserManagement />} />
          <Route path="create-user" element={<CreateUser />} />

          {/* Quản lý Hồ sơ Sinh viên */}
          <Route path="students" element={<StudentList />} />

          {/* Quản lý Đào tạo */}
          <Route path="courses" element={<CourseManagement />} />
          <Route path="classes" element={<Classes />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="sections" element={<Sections />} />
          <Route path="registration-period" element={<RegistrationPeriod />} />
          {/* Thêm router quản lý giảng viên */}
          <Route path="teacher" element={<TeacherList />} />

          {/* Phân quyền */}
          <Route
            path="roles"
            element={<div>Quản lý vai trò - Coming Soon</div>}
          />
          <Route
            path="user-permissions"
            element={<div>Phân quyền người dùng - Coming Soon</div>}
          />
          <Route
            path="security-settings"
            element={<div>Cài đặt bảo mật - Coming Soon</div>}
          />

          {/* Quản lý Học phí */}
          <Route path="tuition-list" element={<TuitionFees />} />
          <Route
            path="payments"
            element={<div>Thanh toán - Coming Soon</div>}
          />
          <Route
            path="financial-reports"
            element={<div>Báo cáo tài chính - Coming Soon</div>}
          />

          {/* Quản lý Điểm số */}
          <Route path="grades" element={<GradeEntry />} />
          <Route path="grade-sheets" element={<GradeSheet />} />
          <Route path="grade-statistics" element={<GradeStatistics />} />

          {/* Quản lý Thông báo */}
          <Route path="send-notifications" element={<SendNotifications />} />
          <Route
            path="notification-history"
            element={<NotificationHistory />}
          />
          <Route
            path="email-settings"
            element={<div>Cài đặt email - Coming Soon</div>}
          />

          {/* Cài đặt hệ thống */}
          {/* <Route path="settings" element={<SystemSettings />} /> */}
        </Route>

        {/* Teacher routes - Role ID 2 */}
        <Route
          path="/teacher"
          element={
            // <ProtectedRoute allowedRole={3}>
            <LayoutTeacher />
            // </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="students-by-class" element={<TeacherStudentsByClass />} />
          <Route path="grades" element={<TeacherGrades />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="materials" element={<TeacherMaterials />} />
          <Route path="settings" element={<TeacherSettings />} />

          {/* Thông báo */}
          <Route path="notifications" element={<NotificationHistory />} />
        </Route>

        {/* Student routes - Role ID 3 */}
        <Route
          path="/student"
          element={
            // <ProtectedRoute allowedRole={2}>
            <LayoutStudent />
            // </ProtectedRoute>
          }
        >
          {/* Dashboard mặc định */}
          <Route index element={<StudentDashboard />} />

          {/* Thông tin chung */}
          <Route path="info" element={<StudentInfoPage />} />
          <Route path="bank" element={<BankInfo />} />
          <Route path="bhyt" element={<BHYTPage />} />
          <Route path="graduate" element={<GraduatePage />} />
          <Route path="edit-info" element={<StudentEditInfoPage />} />
          {/* Học tập */}
          <Route path="grades" element={<StudentGrades />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="attendance" element={<SelfCheckIn />} />

          {/* Đăng ký học phần */}
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="register-courses" element={<RegisterCourses />} />

          {/* Học phí */}
          <Route path="debt" element={<DebtPageComponent />} />
          <Route path="payment" element={<PaymentPage />} />

          {/* Thông báo */}
          <Route path="notifications" element={<NotificationHistory />} />
        </Route>

        {/* Redirect authenticated users to appropriate dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardByRole()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 route - redirect based on authentication status */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardByRole()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </AuthLoader>
  );
};

export default AppRoutes;
