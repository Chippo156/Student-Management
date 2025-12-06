import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';

// Admin Navigators
import AdminNavigator from './AdminNavigator';
import StudentNavigator from './StudentNavigator';
import TeacherNavigator from './TeacherNavigator';

// Custom Drawer
import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();

const MainNavigator = () => {
  const { user } = useSelector((state) => state.auth);

  // Determine which navigator to show based on user role
  const getNavigatorForRole = () => {
    if (!user || !user.role) {
      return null;
    }

    switch (user.role.toLowerCase()) {
      case 'admin':
        return AdminNavigator;
      case 'student':
        return StudentNavigator;
      case 'teacher':
      case 'lecturer':
        return TeacherNavigator;
      default:
        return null;
    }
  };

  const Navigator = getNavigatorForRole();

  if (!Navigator) {
    return null;
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Navigator}
        options={{ title: 'Trang chủ' }}
      />
    </Drawer.Navigator>
  );
};

export default MainNavigator;
