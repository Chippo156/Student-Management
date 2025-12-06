import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
  IconButton,
  DataTable,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import academicProgramService from '../../services/academicProgramService';

const CurriculumScreen = ({ navigation }) => {
  const theme = useTheme();
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    setLoading(true);
    const data = await academicProgramService.getMyProgramCurriculum();
    setCurriculum(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!curriculum) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không có dữ liệu chương trình khung</Text>
      </View>
    );
  }

  const completedCredits = curriculum.studentTotalCompletedCredits || 0;
  const totalCredits = curriculum.totalCreditsRequired || 0;
  const completionRate = curriculum.studentCompletionRate || 0;

  return (
    <ScrollView style={styles.container}>
      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="book-outline" size={28} iconColor={theme.colors.primary} />
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {totalCredits}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              TC yêu cầu
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="check-circle" size={28} iconColor={theme.colors.tertiary} />
            <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
              {completedCredits}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              TC đã hoàn thành
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Progress */}
      <Card style={styles.card}>
        <Card.Title title="Tiến độ hoàn thành" />
        <Card.Content>
          <Text variant="headlineLarge" style={styles.progressPercent}>
            {completionRate}%
          </Text>
          <ProgressBar
            progress={completionRate / 100}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <View style={styles.progressInfo}>
            <Text variant="bodyMedium">
              Bắt buộc: {curriculum.studentCompletedRequiredCredits || 0}/
              {curriculum.totalRequiredCredits || 0}
            </Text>
            <Text variant="bodyMedium">
              Tự chọn: {curriculum.studentCompletedOptionalCredits || 0}/
              {curriculum.totalOptionalCredits || 0}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Program Info */}
      <Card style={styles.card}>
        <Card.Title title="Thông tin chương trình" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Chương trình:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {curriculum.programName}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Khoa:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {curriculum.facultyName}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Ngành:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {curriculum.departmentName}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Semester Courses */}
      {curriculum.semesterCourses?.map((semester, index) => (
        <Card key={index} style={styles.card}>
          <Card.Title
            title={semester.semesterName}
            subtitle={`${semester.totalCredits} TC - Bắt buộc: ${semester.requiredCredits}, Tự chọn: ${semester.optionalCredits}`}
          />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Mã HP</DataTable.Title>
                <DataTable.Title>Tên môn</DataTable.Title>
                <DataTable.Title numeric>TC</DataTable.Title>
                <DataTable.Title>Trạng thái</DataTable.Title>
              </DataTable.Header>

              {semester.courses.map((course, idx) => (
                <DataTable.Row key={idx}>
                  <DataTable.Cell>{course.courseCode}</DataTable.Cell>
                  <DataTable.Cell>{course.courseName}</DataTable.Cell>
                  <DataTable.Cell numeric>{course.totalCredits}</DataTable.Cell>
                  <DataTable.Cell>
                    {course.studentProgress?.isCompleted ? (
                      <Chip mode="flat" style={{ backgroundColor: theme.colors.tertiary }}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>Đạt</Text>
                      </Chip>
                    ) : course.studentProgress?.hasTaken ? (
                      <Chip mode="outlined" textStyle={{ fontSize: 10 }}>
                        Chưa đạt
                      </Chip>
                    ) : (
                      <Chip mode="outlined" textStyle={{ fontSize: 10 }}>
                        Chưa học
                      </Chip>
                    )}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  progressPercent: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  progressInfo: {
    marginTop: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontWeight: '600',
    opacity: 0.7,
    flex: 1,
  },
  infoValue: {
    flex: 1.5,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
});

export default CurriculumScreen;
