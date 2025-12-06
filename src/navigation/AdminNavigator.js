import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Admin Screens
import AdminDashboardScreen from '../screens/Admin/Dashboard/AdminDashboardScreen';
import TeacherListScreen from '../screens/Admin/Teacher/TeacherListScreen';
import StudentListScreen from '../screens/Admin/Student/StudentListScreen';
import StudentDetailScreen from '../screens/Admin/Student/StudentDetailScreen';
import ClassListScreen from '../screens/Admin/Class/ClassListScreen';
import SectionListScreen from '../screens/Admin/Section/SectionListScreen';
import GradeEntryScreen from '../screens/Admin/Grade/GradeEntryScreen';
import RegistrationPeriodScreen from '../screens/Admin/Registration/RegistrationPeriodScreen';
import TuitionFeesScreen from '../screens/Admin/Tuition/TuitionFeesScreen';
import CourseManagementScreen from '../screens/Admin/Course/CourseManagementScreen';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Bảng điều khiển' }}
      />

      {/* Teacher Management */}
      <Stack.Screen
        name="TeacherList"
        component={TeacherListScreen}
        options={{ title: 'Quản lý Giảng viên' }}
      />

      {/* Student Management */}
      <Stack.Screen
        name="StudentList"
        component={StudentListScreen}
        options={{ title: 'Quản lý Sinh viên' }}
      />
      <Stack.Screen
        name="StudentDetail"
        component={StudentDetailScreen}
        options={{ title: 'Chi tiết Sinh viên' }}
      />

      {/* Class Management */}
      <Stack.Screen
        name="ClassList"
        component={ClassListScreen}
        options={{ title: 'Quản lý Lớp học' }}
      />

      {/* Section Management */}
      <Stack.Screen
        name="SectionList"
        component={SectionListScreen}
        options={{ title: 'Quản lý Lớp học phần' }}
      />

      {/* Grade Management */}
      <Stack.Screen
        name="GradeEntry"
        component={GradeEntryScreen}
        options={{ title: 'Nhập điểm' }}
      />

      {/* Registration Period */}
      <Stack.Screen
        name="RegistrationPeriod"
        component={RegistrationPeriodScreen}
        options={{ title: 'Đợt đăng ký' }}
      />

      {/* Tuition */}
      <Stack.Screen
        name="TuitionFees"
        component={TuitionFeesScreen}
        options={{ title: 'Học phí' }}
      />

      {/* Course Management */}
      <Stack.Screen
        name="CourseManagement"
        component={CourseManagementScreen}
        options={{ title: 'Quản lý Môn học' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
