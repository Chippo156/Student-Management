import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Student Screens (Placeholder - to be implemented)
import StudentDashboardScreen from '../screens/Student/StudentDashboardScreen';

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
        options={{ title: 'Trang chủ Sinh viên' }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;
