import { Alert } from 'react-native';

export const toast = {
  success: (message) => {
    Alert.alert('Thành công', message, [{ text: 'OK' }]);
  },
  error: (message) => {
    Alert.alert('Lỗi', message, [{ text: 'OK' }]);
  },
  warning: (message) => {
    Alert.alert('Cảnh báo', message, [{ text: 'OK' }]);
  },
  info: (message) => {
    Alert.alert('Thông báo', message, [{ text: 'OK' }]);
  },
};

// Optional: For non-blocking toasts, you can use react-native-paper Snackbar
// or a library like react-native-toast-message
