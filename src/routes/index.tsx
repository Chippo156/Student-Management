import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

// Import components
import ProtectedRoute from '../component/ProtectedRoute';
import AuthLoader from '../component/AuthLoader';

// Import pages
import Home from '../page/Home';
import Login from '../page/Login';
import Register from '../page/Register';
import Forgot from '../page/Forgot';

// Admin pages
import AdminDashboard from '../page/Admin';
import AdminUsers from '../page/Admin/usersInfor';

// Placeholder components
const AdminBookingTour = () => <div>Admin Booking Tour - Coming Soon</div>;
const AdminBookingHotel = () => <div>Admin Booking Hotel - Coming Soon</div>;
const AdminTour = () => <div>Admin Tour - Coming Soon</div>;
const AdminHotel = () => <div>Admin Hotel - Coming Soon</div>;

// Student pages
import StudentDashboard from '../component/Student/Dashboard';
import StudentInfo from '../component/Student/Pages/StudentInfoPage';
import BHYTPage from '../component/Student/Pages/BHYTPage';
import GraduatePage from '../component/Student/Pages/GraduatePage';
import StudentNotes from '../component/Student/Components/StudentNotes';
import BankInfo from '../component/Student/Components/BankInfo';
import StudentGrades from '../component/Student/Components/StudentGrades';
import StudentSchedule from '../component/Student/Components/StudentSchedule';

// Teacher pages
import TeacherDashboard from '../component/Teacher/Dashboard';
import TeacherCourses from '../component/Teacher/Pages/CoursesPage';
import TeacherSchedule from '../component/Teacher/Pages/SchedulePage';

// Layout components
import LayoutUser from '../component/LayoutUser/LayoutUser';
import LayoutAdmin from '../component/LayoutAdmin/LayoutAdmin';
import LayoutStudent from '../component/LayoutStudent/LayoutStudent';
import LayoutTeacher from '../component/LayoutTeacher/LayoutTeacher';

// Placeholder components for unfinished features
const CurriculumPage = () => (
  <div style={{ padding: "24px" }}>
    <h2>Chương trình khung</h2>
    <p>Component chương trình khung đang được phát triển...</p>
  </div>
);

const RegisterCoursePage = () => (
  <div style={{ padding: "24px" }}>
    <h2>Đăng ký học phần</h2>
    <p>Component đăng ký học phần đang được phát triển...</p>
  </div>
);

const DebtPage = () => (
  <div style={{ padding: "24px" }}>
    <h2>Tra cứu công nợ</h2>
    <p>Component tra cứu công nợ đang được phát triển...</p>
  </div>
);

const PaymentPage = () => (
  <div style={{ padding: "24px" }}>
    <h2>Thanh toán trực tuyến</h2>
    <p>Component thanh toán đang được phát triển...</p>
  </div>
);

const TimelinePage = () => (
  <div style={{ padding: "24px" }}>
    <h2>Lịch theo tiến độ</h2>
    <p>Component lịch theo tiến độ đang được phát triển...</p>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, account } = useAppSelector((state) => state.user);

  const getDashboardByRole = () => {
    if (!account || !account.role) {
      return '/login';
    }
    const userRoleId = account.role.roleId;
    switch (userRoleId) {
      case 1: // Admin
        return '/admin';
      case 2: // Teacher
        return '/teacher';
      case 3: // Student
        return '/student';
      default:
        return '/login';
    }
  };

  // Component để handle trang mặc định với role check
  const HomePageHandler = () => {
    if (isAuthenticated && account) {
      // Nếu đã đăng nhập, redirect về dashboard tương ứng
      return <Navigate to={getDashboardByRole()} replace />;
    }
    // Nếu chưa đăng nhập, hiển thị trang Home
    return <Home />;
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
            element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardByRole()} replace />} 
          />
          <Route 
            path="register" 
            element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardByRole()} replace />} 
          />
          <Route 
            path="forgot" 
            element={!isAuthenticated ? <Forgot /> : <Navigate to={getDashboardByRole()} replace />} 
          />
        </Route>

        {/* Admin routes - Role ID 1 */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={[1]}>
            <LayoutAdmin />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="booking-tour" element={<AdminBookingTour />} />
          <Route path="booking-hotel" element={<AdminBookingHotel />} />
          <Route path="tour" element={<AdminTour />} />
          <Route path="hotel" element={<AdminHotel />} />
        </Route>

        {/* Teacher routes - Role ID 2 */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LayoutTeacher />
          </ProtectedRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="schedule" element={<TeacherSchedule />} />
        </Route>

        {/* Student routes - Role ID 3 */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={[3]}>
            <LayoutStudent />
          </ProtectedRoute>
        }>
          {/* Dashboard mặc định */}
          <Route index element={<StudentDashboard />} />
          
          {/* Thông tin chung */}
          <Route path="info" element={<StudentInfo />} />
          <Route path="notes" element={<StudentNotes />} />
          <Route path="bank" element={<BankInfo />} />
          <Route path="bhyt" element={<BHYTPage />} />
          <Route path="graduate" element={<GraduatePage />} />
          
          {/* Học tập */}
          <Route path="grades" element={<StudentGrades />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="timeline" element={<TimelinePage />} />
          
          {/* Đăng ký học phần */}
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="register-courses" element={<RegisterCoursePage />} />
          
          {/* Học phí */}
          <Route path="debt" element={<DebtPage />} />
          <Route path="payment" element={<PaymentPage />} />
        </Route>

        {/* Redirect authenticated users to appropriate dashboard */}
        <Route path="/dashboard" element={
          isAuthenticated ? 
          <Navigate to={getDashboardByRole()} replace /> : 
          <Navigate to="/login" replace />
        } />

        {/* 404 route - redirect based on authentication status */}
        <Route path="*" element={
          isAuthenticated ? 
          <Navigate to={getDashboardByRole()} replace /> : 
          <Navigate to="/login" replace />
        } />
      </Routes>
    </AuthLoader>
  );
};

export default AppRoutes;