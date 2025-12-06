import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Student Screens
import StudentDashboardScreen from '../screens/Student/StudentDashboardScreen';
import StudentInfoScreen from '../screens/Student/StudentInfoScreen';
import StudentEditInfoScreen from '../screens/Student/StudentEditInfoScreen';
import BankInfoScreen from '../screens/Student/BankInfoScreen';
import BHYTScreen from '../screens/Student/BHYTScreen';
import StudentNotesScreen from '../screens/Student/StudentNotesScreen';
import CurriculumScreen from '../screens/Student/CurriculumScreen';
import RegisterCoursesScreen from '../screens/Student/RegisterCoursesScreen';
import StudentGradesScreen from '../screens/Student/StudentGradesScreen';
import StudentScheduleScreen from '../screens/Student/StudentScheduleScreen';
import GraduateScreen from '../screens/Student/GraduateScreen';
import StudentDebtScreen from '../screens/Student/StudentDebtScreen';
import SelfCheckInScreen from '../screens/Student/SelfCheckInScreen';

const Stack = createStackNavigator();

const StudentNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="StudentDashboard"
        component={StudentDashboardScreen}
        options={{ title: 'Trang chủ' }}
      />

      {/* General Information */}
      <Stack.Screen
        name="StudentInfo"
        component={StudentInfoScreen}
        options={{ title: 'Hồ sơ điện tử' }}
      />
      <Stack.Screen
        name="StudentEditInfo"
        component={StudentEditInfoScreen}
        options={{ title: 'Chỉnh sửa thông tin' }}
      />
      <Stack.Screen
        name="BankInfo"
        component={BankInfoScreen}
        options={{ title: 'Thông tin ngân hàng' }}
      />
      <Stack.Screen
        name="BHYT"
        component={BHYTScreen}
        options={{ title: 'Bảo hiểm y tế' }}
      />
      <Stack.Screen
        name="StudentNotes"
        component={StudentNotesScreen}
        options={{ title: 'Ghi chú' }}
      />

      {/* Registration */}
      <Stack.Screen
        name="Curriculum"
        component={CurriculumScreen}
        options={{ title: 'Chương trình đào tạo' }}
      />
      <Stack.Screen
        name="RegisterCourses"
        component={RegisterCoursesScreen}
        options={{ title: 'Đăng ký học phần' }}
      />

      {/* Study */}
      <Stack.Screen
        name="StudentGrades"
        component={StudentGradesScreen}
        options={{ title: 'Kết quả học tập' }}
      />
      <Stack.Screen
        name="StudentSchedule"
        component={StudentScheduleScreen}
        options={{ title: 'Lịch học theo tuần' }}
      />
      <Stack.Screen
        name="Graduate"
        component={GraduateScreen}
        options={{ title: 'Tốt nghiệp' }}
      />

      {/* Finance */}
      <Stack.Screen
        name="StudentDebt"
        component={StudentDebtScreen}
        options={{ title: 'Tra cứu công nợ' }}
      />

      {/* Attendance */}
      <Stack.Screen
        name="SelfCheckIn"
        component={SelfCheckInScreen}
        options={{ title: 'Điểm danh' }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;
