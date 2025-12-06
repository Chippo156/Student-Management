# Admin Portal React Native Conversion Guide

## Overview
This document provides a comprehensive guide for converting 18 Admin portal screens from React Web (Material-UI) to React Native (React Native Paper).

## Screens to Convert

### 1. Dashboard (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Dashboard\AdminDashboardScreen.js)
**Source:** `src/page/Admin/Dashboard.jsx`
**Complexity:** HIGH
**Key Features:**
- Multiple statistics cards
- 4 charts using Recharts (Bar, Pie, Line)
- Real-time data from 7 API endpoints
- User greeting banner
**Conversion Notes:**
- Replace Recharts with react-native-chart-kit or react-native-svg-charts
- Use Card components from React Native Paper
- Implement ScrollView for charts
- Replace Material-UI theme with React Native Paper theme

### 2. Send Notifications (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Notifications\SendNotificationsScreen.js)
**Source:** `src/page/Admin/SendNotifications.jsx`
**Complexity:** MEDIUM
**Key Features:**
- Form with multiple inputs (title, content, priority, type, target)
- File upload (documents and images)
- Preview dialog
- Target audience selection (All, Students, Lecturers, Academic Year)
**Conversion Notes:**
- Use react-native-document-picker for file uploads
- Replace Material-UI Select with SearchableAutocomplete
- Use Portal for preview modal
- Implement image preview with react-native-image-viewing

### 3. Student List (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Student\StudentListScreen.js)
**Source:** `src/page/Admin/StudentManagement/StudentList.jsx`
**Complexity:** MEDIUM-HIGH
**Key Features:**
- Searchable list with debounce (500ms)
- Multiple filters (department, class, year, status)
- Pagination
- Statistics cards
- Excel export
- Modals for view/edit/create
**Conversion Notes:**
- Use FlatList for student list
- Implement pull-to-refresh
- Use existing SearchableAutocomplete
- Replace Excel export with react-native-xlsx or share API

### 4. Student Detail (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Student\StudentDetailScreen.js)
**Source:** `src/page/Admin/StudentManagement/StudentInfo.jsx`
**Complexity:** MEDIUM
**Key Features:**
- Detailed student information view
- Academic information
- Contact information
- Emergency contact
**Conversion Notes:**
- Use Card/List components
- Implement as modal or separate screen
- Use ScrollView for long content

### 5. Student Profiles (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Student\StudentProfilesScreen.js)
**Source:** `src/page/Admin/StudentManagement/StudentProfiles.jsx`
**Complexity:** MEDIUM
**Key Features:**
- Student profile listing with filters
- Tabs for different information sections
- GPA display with color coding
**Conversion Notes:**
- Use react-native-paper Tabs
- Implement TabView for sections
- Use FlatList for profiles

### 6. Class List (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Class\ClassListScreen.js)
**Source:** `src/page/Admin/EducationManagement/Classes.jsx`
**Complexity:** MEDIUM
**Key Features:**
- Class list with program filter
- Statistics cards
- Action menu (View, Edit, Assign Adviser, Delete)
- Excel export
**Conversion Notes:**
- Use FlatList with renderItem
- Implement Menu from React Native Paper
- Use Portal for modals
- Similar pattern to TeacherListScreen

### 7. Section List (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Section\SectionListScreen.js)
**Source:** `src/page/Admin/EducationManagement/Sections.jsx`
**Complexity:** MEDIUM
**Key Features:**
- Section (lớp học phần) listing
- Enrollment progress bars
- Status badges
- Semester filter
**Conversion Notes:**
- Use ProgressBar from React Native Paper
- Implement color-coded status chips
- Use FlatList for sections

### 8. Grade Entry (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Grade\GradeEntryScreen.js)
**Source:** `src/page/Admin/GradeManagement/GradeEntry.jsx`
**Complexity:** HIGH
**Key Features:**
- Student search with autocomplete
- Nested accordion view (Semester → Course → Assessments)
- Inline grade editing
- Edit dialog for scores
**Conversion Notes:**
- Use SearchableAutocomplete for student search
- Implement Accordion/Collapsible from React Native Paper
- Use Portal for edit dialog
- Implement keyboard-aware scrolling

### 9. Grade Sheet (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Grade\GradeSheetScreen.js)
**Source:** `src/page/Admin/GradeManagement/GradeSheet.jsx`
**Complexity:** HIGH
**Key Features:**
- Student transcript view
- Detailed grade breakdown table
- Semester summary cards
- GPA calculations
- Excel export
**Conversion Notes:**
- Use ScrollView with horizontal scroll for tables
- Implement DataTable from React Native Paper
- Use color-coded grade chips
- Format numbers properly (toFixed)

### 10. Grade Statistics (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Grade\GradeStatisticsScreen.js)
**Source:** `src/page/Admin/GradeManagement/GradeStatistics.jsx`
**Complexity:** VERY HIGH
**Key Features:**
- Two tabs: Individual student stats, All students stats
- Multiple charts (Pie for grade distribution, Line for GPA trend, Bar for comparisons)
- Statistics cards with icons
- Semester statistics table
- Subject type statistics
- Department/Program filtering for all students view
**Conversion Notes:**
- Use react-native-chart-kit or react-native-svg-charts
- Implement TabView
- Use ScrollView for long content
- Color-code grades consistently
- Implement filters as bottom sheet or modal

### 11. Grade Management (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Grade\GradeManagementScreen.js)
**Source:** `src/page/Admin/GradeManagement/GradeManagement.jsx`
**Complexity:** MEDIUM
- **TODO: Read this file to determine features**

### 12. Registration Period (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Registration\RegistrationPeriodScreen.js)
**Source:** `src/page/Admin/EducationManagement/RegistrationPeriod.jsx`
**Complexity:** MEDIUM
- **TODO: Read this file to determine features**

### 13. Tuition Fees (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Tuition\TuitionFeesScreen.js)
**Source:** `src/page/Admin/TuitionManagement/TuitionFees.jsx`
**Complexity:** MEDIUM
- **TODO: Read this file to determine features**

### 14. Course Management (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Course\CourseManagementScreen.js)
**Source:** `src/page/Admin/CourseManagement/index.jsx`
**Complexity:** MEDIUM
- **TODO: Read this file to determine features**

### 15. Curriculum (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\Education\CurriculumScreen.js)
**Source:** `src/page/Admin/EducationManagement/Curriculum.jsx`
**Complexity:** MEDIUM
- **TODO: Read this file to determine features**

### 16. System Settings (d:\study\hk1 nam 5\Khóa luận\fe\Student-Management\src\screens\Admin\System\SystemSettingsScreen.js)
**Source:** `src/page/Admin/SystemSettings/SystemSettings.jsx`
**Complexity:** LOW-MEDIUM
- **TODO: Read this file to determine features**

## Common Conversion Patterns

### 1. Material-UI to React Native Paper Component Mapping

| Material-UI | React Native Paper |
|-------------|-------------------|
| `Box` | `View` |
| `Typography` | `Text` |
| `Button` | `Button` |
| `TextField` | `TextInput` |
| `Card` + `CardContent` | `Card` + `Card.Content` |
| `Chip` | `Chip` |
| `CircularProgress` | `ActivityIndicator` |
| `LinearProgress` | `ProgressBar` |
| `Dialog` | `Portal` + `Dialog` |
| `Menu` | `Menu` |
| `Table` | `DataTable` or `FlatList` |
| `Grid` | `View` with flexbox |
| `Paper` | `Surface` or `Card` |
| `Autocomplete` | `SearchableAutocomplete` (custom) |
| `Tabs` | `SegmentedButtons` or custom TabView |

### 2. Import Replacements

```javascript
// OLD (Material-UI)
import { Box, Typography, Button, Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// NEW (React Native Paper)
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
```

### 3. Styling

```javascript
// OLD (Material-UI inline styles)
<Box sx={{ p: 3, mb: 2, bgcolor: 'primary.main' }}>

// NEW (StyleSheet)
<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
```

### 4. Navigation

```javascript
// OLD (React Router)
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/admin/students');

// NEW (React Navigation)
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();
navigation.navigate('StudentDetail', { studentId: id });
```

### 5. Charts

```javascript
// OLD (Recharts)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <Bar dataKey="value" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>

// NEW (react-native-chart-kit)
import { BarChart } from 'react-native-chart-kit';
<BarChart
  data={{
    labels: data.map(d => d.label),
    datasets: [{ data: data.map(d => d.value) }]
  }}
  width={Dimensions.get('window').width - 32}
  height={220}
  chartConfig={{
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  }}
/>
```

### 6. Tables to FlatList

```javascript
// OLD (Material-UI Table)
<TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map(row => (
        <TableRow key={row.id}>
          <TableCell>{row.name}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

// NEW (FlatList)
<FlatList
  data={data}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text>{item.name}</Text>
      </Card.Content>
    </Card>
  )}
/>
```

### 7. File Uploads

```javascript
// OLD (Web)
<input
  ref={fileInputRef}
  type="file"
  hidden
  onChange={handleFileUpload}
/>

// NEW (React Native)
import DocumentPicker from 'react-native-document-picker';

const handleFileUpload = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    // Handle result
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled
    }
  }
};
```

## Dependencies to Add

Add these to `package.json`:

```json
{
  "dependencies": {
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "^13.14.0",
    "react-native-document-picker": "^9.1.1",
    "react-native-image-picker": "^7.0.0",
    "react-native-image-viewing": "^0.2.2",
    "react-native-xlsx": "^0.1.0",
    "react-native-fs": "^2.20.0",
    "react-native-share": "^10.0.0"
  }
}
```

## Testing Checklist

For each converted screen:

- [ ] All API calls work correctly
- [ ] Filters apply properly
- [ ] Pagination works (if applicable)
- [ ] Search with debounce works
- [ ] Modals/dialogs open and close
- [ ] Forms validate inputs
- [ ] Data displays correctly
- [ ] Navigation works
- [ ] Pull-to-refresh works
- [ ] Loading states show properly
- [ ] Error handling works
- [ ] Charts render (if applicable)
- [ ] Excel export works (if applicable)
- [ ] File uploads work (if applicable)
- [ ] Theme/styling matches design
- [ ] Responsive on different screen sizes
- [ ] Performance is acceptable

## Next Steps

1. Install required dependencies
2. Convert screens one by one starting with Dashboard
3. Test each screen thoroughly
4. Update navigation routes
5. Ensure consistency across all screens
