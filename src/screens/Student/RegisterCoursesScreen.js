import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  RadioButton,
  DataTable,
  SegmentedButtons,
} from 'react-native-paper';
import { showToast } from '../../utils/toast';

const RegisterCoursesScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [registerType, setRegisterType] = useState('new');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [enrolledSections, setEnrolledSections] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // Mock available courses
    setCourses([
      {
        courseId: 1,
        courseCode: 'CS101',
        courseName: 'Lập trình cơ bản',
        credits: 3,
        isRequired: true,
      },
      {
        courseId: 2,
        courseCode: 'CS102',
        courseName: 'Cấu trúc dữ liệu',
        credits: 3,
        isRequired: true,
      },
    ]);

    // Mock enrolled sections
    setEnrolledSections([
      {
        enrollmentId: 1,
        section: {
          sectionCode: 'CS100-01',
          course: { courseName: 'Nhập môn CNTT', credits: 3 },
        },
      },
    ]);
  }, []);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    // Mock sections for selected course
    setSections([
      {
        sectionId: 1,
        sectionCode: `${course.courseCode}-01`,
        maxStudents: 50,
        currentStudents: 30,
        lecturer: 'TS. Nguyễn Văn A',
        schedule: 'Thứ 2, 7-10',
        room: 'A101',
      },
      {
        sectionId: 2,
        sectionCode: `${course.courseCode}-02`,
        maxStudents: 50,
        currentStudents: 45,
        lecturer: 'TS. Trần Thị B',
        schedule: 'Thứ 3, 13-16',
        room: 'B202',
      },
    ]);
  };

  const handleEnroll = async () => {
    if (!selectedSection) {
      showToast('Vui lòng chọn lớp học phần!', 'error');
      return;
    }

    Alert.alert('Xác nhận đăng ký', 'Bạn có chắc chắn muốn đăng ký lớp này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng ký',
        onPress: () => {
          // Mock enrollment
          const newEnrollment = {
            enrollmentId: enrolledSections.length + 1,
            section: {
              sectionCode: selectedSection.sectionCode,
              course: {
                courseName: selectedCourse.courseName,
                credits: selectedCourse.credits,
              },
            },
          };
          setEnrolledSections([...enrolledSections, newEnrollment]);
          showToast('Đăng ký thành công!', 'success');
          setSelectedSection(null);
        },
      },
    ]);
  };

  const handleDropEnrollment = (enrollmentId) => {
    Alert.alert('Xác nhận hủy', 'Bạn có chắc chắn muốn hủy đăng ký?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        style: 'destructive',
        onPress: () => {
          setEnrolledSections(
            enrolledSections.filter((e) => e.enrollmentId !== enrollmentId)
          );
          showToast('Hủy đăng ký thành công!', 'success');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Register Type */}
      <Card style={styles.card}>
        <Card.Title title="Loại đăng ký" />
        <Card.Content>
          <SegmentedButtons
            value={registerType}
            onValueChange={setRegisterType}
            buttons={[
              { value: 'new', label: 'Đăng ký mới' },
              { value: 'add', label: 'Đăng ký bổ sung' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Available Courses */}
      <Card style={styles.card}>
        <Card.Title title="Chọn môn học" subtitle={`${courses.length} môn`} />
        <Card.Content>
          <RadioButton.Group
            onValueChange={(value) => {
              const course = courses.find((c) => c.courseId.toString() === value);
              handleCourseSelect(course);
            }}
            value={selectedCourse?.courseId?.toString()}
          >
            {courses.map((course) => (
              <View key={course.courseId}>
                <RadioButton.Item
                  label={`${course.courseCode} - ${course.courseName} (${course.credits} TC)`}
                  value={course.courseId.toString()}
                  status={
                    selectedCourse?.courseId === course.courseId
                      ? 'checked'
                      : 'unchecked'
                  }
                />
                <Divider />
              </View>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Sections */}
      {selectedCourse && sections.length > 0 && (
        <Card style={styles.card}>
          <Card.Title
            title="Chọn lớp học phần"
            subtitle={`${sections.length} lớp`}
          />
          <Card.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                const section = sections.find((s) => s.sectionId.toString() === value);
                setSelectedSection(section);
              }}
              value={selectedSection?.sectionId?.toString()}
            >
              {sections.map((section) => (
                <View key={section.sectionId}>
                  <RadioButton.Item
                    label={section.sectionCode}
                    value={section.sectionId.toString()}
                    status={
                      selectedSection?.sectionId === section.sectionId
                        ? 'checked'
                        : 'unchecked'
                    }
                  />
                  <View style={styles.sectionInfo}>
                    <Text variant="bodySmall">GV: {section.lecturer}</Text>
                    <Text variant="bodySmall">Lịch: {section.schedule}</Text>
                    <Text variant="bodySmall">Phòng: {section.room}</Text>
                    <Text variant="bodySmall">
                      Sĩ số: {section.currentStudents}/{section.maxStudents}
                    </Text>
                  </View>
                  <Divider />
                </View>
              ))}
            </RadioButton.Group>

            {selectedSection && (
              <Button
                mode="contained"
                onPress={handleEnroll}
                style={styles.enrollButton}
              >
                Đăng ký lớp này
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Enrolled Sections */}
      <Card style={styles.card}>
        <Card.Title
          title="Môn đã đăng ký"
          subtitle={`${enrolledSections.length} môn`}
        />
        <Card.Content>
          {enrolledSections.map((enrollment) => (
            <View key={enrollment.enrollmentId} style={styles.enrolledItem}>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall">
                  {enrollment.section.course.courseName}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {enrollment.section.sectionCode} -{' '}
                  {enrollment.section.course.credits} TC
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => handleDropEnrollment(enrollment.enrollmentId)}
                textColor={theme.colors.error}
              >
                Hủy
              </Button>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  sectionInfo: {
    paddingLeft: 56,
    paddingBottom: 12,
    gap: 4,
  },
  enrollButton: {
    marginTop: 16,
  },
  enrolledItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

export default RegisterCoursesScreen;
