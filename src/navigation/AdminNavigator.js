import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Admin Screens
import DashboardScreen from '../screens/Admin/DashboardScreen';
import TeacherListScreen from '../screens/Admin/Teacher/TeacherListScreen';
import TeacherDetailScreen from '../screens/Admin/Teacher/TeacherDetailScreen';
import StudentListScreen from '../screens/Admin/Student/StudentListScreen';
import StudentDetailScreen from '../screens/Admin/Student/StudentDetailScreen';
import ClassListScreen from '../screens/Admin/Class/ClassListScreen';
import SectionListScreen from '../screens/Admin/Section/SectionListScreen';
import SectionDetailScreen from '../screens/Admin/Section/SectionDetailScreen';
import GradeEntryScreen from '../screens/Admin/Grade/GradeEntryScreen';
import GradeSheetScreen from '../screens/Admin/Grade/GradeSheetScreen';
import GradeStatisticsScreen from '../screens/Admin/Grade/GradeStatisticsScreen';
import RegistrationPeriodScreen from '../screens/Admin/Registration/RegistrationPeriodScreen';
import TuitionFeesScreen from '../screens/Admin/Tuition/TuitionFeesScreen';
import CurriculumScreen from '../screens/Admin/Education/CurriculumScreen';

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
        component={DashboardScreen}
        options={{ title: 'Bảng điều khiển' }}
      />

      {/* Teacher Management */}
      <Stack.Screen
        name="TeacherList"
        component={TeacherListScreen}
        options={{ title: 'Quản lý Giảng viên' }}
      />
      <Stack.Screen
        name="TeacherDetail"
        component={TeacherDetailScreen}
        options={{ title: 'Chi tiết Giảng viên' }}
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
      <Stack.Screen
        name="SectionDetail"
        component={SectionDetailScreen}
        options={{ title: 'Chi tiết Lớp học phần' }}
      />

      {/* Grade Management */}
      <Stack.Screen
        name="GradeEntry"
        component={GradeEntryScreen}
        options={{ title: 'Nhập điểm' }}
      />
      <Stack.Screen
        name="GradeSheet"
        component={GradeSheetScreen}
        options={{ title: 'Bảng điểm' }}
      />
      <Stack.Screen
        name="GradeStatistics"
        component={GradeStatisticsScreen}
        options={{ title: 'Thống kê điểm' }}
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

      {/* Curriculum */}
      <Stack.Screen
        name="Curriculum"
        component={CurriculumScreen}
        options={{ title: 'Chương trình đào tạo' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
