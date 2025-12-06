# Student Management - React Native Mobile App

Ứng dụng di động quản lý sinh viên được chuyển đổi từ React Web sang React Native sử dụng Expo.

## 📱 Công nghệ sử dụng

- **React Native** với **Expo** ~50.0.0
- **React Navigation** 6.x - Navigation cho mobile
- **React Native Paper** 5.x - UI Framework (tương tự Material-UI)
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **AsyncStorage** - Local storage thay thế localStorage
- **React Native Chart Kit** - Biểu đồ thay thế Recharts

## 🚀 Cài đặt

### Yêu cầu hệ thống

- Node.js >= 16
- npm hoặc yarn
- Expo CLI (sẽ tự động cài khi chạy npm start)
- Expo Go app trên điện thoại (tải trên App Store/Play Store)

### Bước 1: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### Bước 2: Cấu hình API URL

Mở file `src/utils/customize-axios.js` và cập nhật `baseURL`:

```javascript
const baseURL = 'https://api.yourdomain.com'; // Thay bằng URL API của bạn
```

### Bước 3: Chạy ứng dụng

```bash
# Chạy development server
npm start

# Chạy trên Android emulator
npm run android

# Chạy trên iOS simulator (chỉ trên macOS)
npm run ios

# Chạy trên web
npm run web
```

### Bước 4: Quét QR code

1. Mở Expo Go app trên điện thoại
2. Quét QR code hiển thị trong terminal
3. Ứng dụng sẽ tự động load trên điện thoại

## 📂 Cấu trúc Project

```
src/
├── components/          # Reusable components
│   └── Common/
│       └── SearchableAutocomplete.js  # Dropdown component
├── hooks/              # Custom hooks
│   └── useTheme.js    # Theme hook
├── navigation/         # Navigation structure
│   ├── AppNavigator.js
│   ├── AdminNavigator.js
│   ├── StudentNavigator.js
│   └── TeacherNavigator.js
├── redux/             # Redux store
├── screens/           # Screen components
│   ├── Auth/
│   │   └── LoginScreen.js
│   ├── Admin/
│   │   ├── Teacher/
│   │   │   └── TeacherListScreen.js
│   │   ├── Student/
│   │   ├── Grade/
│   │   └── ...
│   ├── Student/
│   └── Teacher/
├── services/          # API services
│   ├── authService.js
│   ├── teacherService.js
│   └── ...
└── utils/            # Utility functions
    ├── customize-axios.js
    └── toast.js
```

## 🔄 Migration từ Web sang Mobile

### Thay đổi chính:

1. **UI Framework**: Material-UI → React Native Paper
   ```jsx
   // Web (MUI)
   <TextField label="Name" />

   // Mobile (Paper)
   <TextInput label="Name" mode="outlined" />
   ```

2. **Navigation**: React Router → React Navigation
   ```jsx
   // Web
   navigate('/teacher')

   // Mobile
   navigation.navigate('TeacherList')
   ```

3. **Storage**: localStorage → AsyncStorage
   ```jsx
   // Web
   localStorage.getItem('token')

   // Mobile
   await AsyncStorage.getItem('token')
   ```

4. **Layout**: CSS → StyleSheet
   ```jsx
   // Web
   <Box sx={{ padding: 2 }}>

   // Mobile
   <View style={styles.container}>

   const styles = StyleSheet.create({
     container: { padding: 16 }
   })
   ```

5. **Toast/Alert**: antd message → React Native Alert
   ```jsx
   // Web
   message.success('Success')

   // Mobile
   Alert.alert('Thành công', 'Success')
   ```

## 🎨 Components đã chuyển đổi

### ✅ Hoàn thành
- [x] Login Screen
- [x] SearchableAutocomplete Component
- [x] TeacherList Screen
- [x] Navigation Structure
- [x] Theme System
- [x] Service Layer với AsyncStorage

### ⏳ Đang làm
- [ ] Register Screen
- [ ] Forgot Password Screen
- [ ] Dashboard Screens

### 📋 Cần làm
- [ ] Student Management Screens
- [ ] Grade Management Screens
- [ ] Section Management Screens
- [ ] Registration Period Screens
- [ ] Tuition Management Screens
- [ ] Statistics/Charts
- [ ] Profile Screens
- [ ] Settings Screens

## 🔧 Các service đã có sẵn

Tất cả service từ web version đã được chuyển đổi và sẵn sàng sử dụng:

- authService
- teacherService
- studentService
- classService
- sectionService
- gradeService
- semesterService
- departmentService
- courseService
- ...và nhiều service khác

## 🎯 Lưu ý khi develop

1. **AsyncStorage là async**: Luôn dùng `await` khi gọi AsyncStorage
2. **Navigation**: Dùng `navigation.navigate()` thay vì `useNavigate()`
3. **Styling**: Mobile không support CSS, chỉ dùng StyleSheet
4. **Icons**: Dùng MaterialCommunityIcons từ react-native-paper
5. **Forms**: Validation nên dùng react-hook-form hoặc formik
6. **Lists**: FlatList cho performance tốt hơn map()

## 🐛 Troubleshooting

### Expo Go không connect được
```bash
# Thử clear cache
expo start -c
```

### Dependencies conflict
```bash
# Xóa node_modules và reinstall
rm -rf node_modules
npm install
```

### Metro bundler error
```bash
# Reset metro cache
npx expo start --clear
```

## 📱 Build Production

### Android APK
```bash
# Build APK
eas build -p android --profile preview
```

### iOS IPA (cần macOS)
```bash
# Build IPA
eas build -p ios --profile preview
```

### Publish to Store
```bash
# Android
eas submit -p android

# iOS
eas submit -p ios
```

## 👥 Vai trò người dùng

App hỗ trợ 3 loại người dùng:
- **Admin**: Quản lý toàn bộ hệ thống
- **Teacher**: Xem lớp, nhập điểm, quản lý lịch dạy
- **Student**: Xem điểm, đăng ký môn học, xem lịch học

## 📄 License

[Your License]

## 👨‍💻 Developer

Phát triển bởi [Your Name]
