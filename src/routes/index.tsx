import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

// Teacher pages (cần tạo)
import TeacherDashboard from '../component/Teacher/Dashboard';
import TeacherCourses from '../component/Teacher/Pages/CoursesPage';
import TeacherSchedule from '../component/Teacher/Pages/SchedulePage';

// Layout components
import LayoutUser from '../component/LayoutUser/LayoutUser';
import LayoutAdmin from '../component/LayoutAdmin/LayoutAdmin';

const AppRoutes = () => {
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
  const userRole = useSelector((state: any) => state.user.account.role);

  const getDashboardByRole = () => {
    switch (parseInt(userRole)) {
      case 1: // Admin
        return '/admin';
      case 2: // Giảng viên
        return '/teacher';
      case 3: // Sinh viên
        return '/student';
      default:
        return '/';
    }
  };

  return (
    <AuthLoader>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LayoutUser />}>
          <Route index element={<Home />} />
          <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardByRole()} />} />
          <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardByRole()} />} />
          <Route path="forgot" element={!isAuthenticated ? <Forgot /> : <Navigate to={getDashboardByRole()} />} />
        </Route>

        {/* Admin routes - Role 1 */}
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

        {/* Teacher routes - Role 2 */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LayoutAdmin />
          </ProtectedRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="schedule" element={<TeacherSchedule />} />
        </Route>

        {/* Student routes - Role 3 */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={[3]}>
            <LayoutAdmin />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="info" element={<StudentInfo />} />
          <Route path="bhyt" element={<BHYTPage />} />
          <Route path="graduate" element={<GraduatePage />} />
        </Route>

        {/* Redirect authenticated users to appropriate dashboard */}
        <Route path="/dashboard" element={
          isAuthenticated ? 
          <Navigate to={getDashboardByRole()} /> : 
          <Navigate to="/login" />
        } />

        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthLoader>
  );
};

export default AppRoutes;