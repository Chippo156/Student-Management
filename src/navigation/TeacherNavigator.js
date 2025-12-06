import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Teacher Screens (Placeholder - to be implemented)
import TeacherDashboardScreen from '../screens/Teacher/TeacherDashboardScreen';

const Stack = createStackNavigator();

const TeacherNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="TeacherDashboard"
        component={TeacherDashboardScreen}
        options={{ title: 'Trang chủ Giảng viên' }}
      />
    </Stack.Navigator>
  );
};

export default TeacherNavigator;
