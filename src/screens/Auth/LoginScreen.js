import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Checkbox,
  Portal,
  Dialog,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { loginUser, clearError, doLoginAction } from '../../redux/UserSlice';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [mssv, setMssv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, account } = useSelector(
    (state) => state.user
  );

  // Helper function to get dashboard by role
  const getDashboardByRole = (roleId) => {
    switch (roleId) {
      case 1: // Admin
        return 'AdminDashboard';
      case 2: // Student
        return 'StudentDashboard';
      case 3: // Teacher
        return 'TeacherDashboard';
      default:
        return 'Login';
    }
  };

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi đăng nhập', error, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    dispatch(clearError());

    try {
      const result = await dispatch(loginUser({ username, password }));
      if (result.meta.requestStatus === 'fulfilled') {
        const data = await userService.getUserInfo();
        if (data) {
          const token = await AsyncStorage.getItem('access_token');
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          dispatch(
            doLoginAction({
              token: { accessToken: token, refreshToken },
              user: data,
            })
          );
        }
        // Navigation will be handled by AppNavigator based on isAuthenticated state
      } else if (result.meta.requestStatus === 'rejected') {
        console.error('Login rejected:', result.payload);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi đăng nhập');
    }
  };

  const handleForgotPassword = async () => {
    if (!mssv.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã số sinh viên');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.forgotPasswordByMSSV(mssv);
      if (result) {
        setOpenForgotPassword(false);
        setMssv('');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="headlineMedium" style={styles.title}>
                Đăng nhập
              </Text>

              <TextInput
                label="Tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                disabled={isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                disabled={isLoading}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <View style={styles.checkboxContainer}>
                <Checkbox.Item
                  label="Ghi nhớ đăng nhập"
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={isLoading}
                  labelStyle={styles.checkboxLabel}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                loading={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>

              <Button
                mode="text"
                onPress={() => setOpenForgotPassword(true)}
                style={styles.forgotButton}
              >
                Quên mật khẩu?
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Dialog */}
      <Portal>
        <Dialog
          visible={openForgotPassword}
          onDismiss={() => !isSubmitting && setOpenForgotPassword(false)}
        >
          <Dialog.Title>Quên mật khẩu</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Nhập mã số sinh viên của bạn. Mật khẩu mới sẽ được gửi đến email đã
              đăng ký.
            </Text>
            <TextInput
              label="Mã số sinh viên (MSSV)"
              value={mssv}
              onChangeText={setMssv}
              mode="outlined"
              disabled={isSubmitting}
              autoCapitalize="characters"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setOpenForgotPassword(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onPress={handleForgotPassword}
              disabled={isSubmitting || !mssv.trim()}
              loading={isSubmitting}
            >
              Gửi yêu cầu
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    elevation: 8,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    marginBottom: 16,
    marginLeft: -8,
  },
  checkboxLabel: {
    textAlign: 'left',
  },
  loginButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  dialogText: {
    marginBottom: 16,
  },
});

export default LoginScreen;
