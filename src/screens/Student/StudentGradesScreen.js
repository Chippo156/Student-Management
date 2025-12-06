import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
  DataTable,
  Divider,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import gradeService from '../../services/gradeService';
import reportService from '../../services/reportService';

const StudentGradesScreen = ({ navigation }) => {
  const theme = useTheme();
  const user = useSelector((state) => state.user.account);
  const [summary, setSummary] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, gradesRes] = await Promise.all([
        reportService.getAcademicSummaryBySemester(0),
        gradeService.getMyAllGrades(),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (gradesRes) setGradeData(gradesRes);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Statistics */}
      <Card style={styles.card}>
        <Card.Title title="Tổng quan học tập" />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {summary?.cumulativeGPA10?.toFixed(2) || '0.00'}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                GPA (Hệ 10)
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                {summary?.cumulativeGPA4?.toFixed(2) || '0.00'}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                GPA (Hệ 4)
              </Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Tổng TC đã đăng ký:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {summary?.totalCreditsRegistered || 0}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              TC đã đạt:
            </Text>
            <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.tertiary }]}>
              {summary?.totalCreditsEarned || 0}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Xếp loại:
            </Text>
            <Chip mode="flat" style={{ backgroundColor: theme.colors.primary }}>
              <Text style={{ color: '#fff' }}>{summary?.cumulativeRank || 'N/A'}</Text>
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Grades by Semester */}
      {gradeData?.semesterGrades?.map((semester, index) => (
        <Card key={index} style={styles.card}>
          <Card.Title
            title={semester.semesterName}
            subtitle={`GPA: ${semester.semesterGPA10?.toFixed(2)} (Hệ 10)`}
          />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Mã HP</DataTable.Title>
                <DataTable.Title>Tên môn</DataTable.Title>
                <DataTable.Title numeric>Điểm</DataTable.Title>
                <DataTable.Title>Chữ</DataTable.Title>
              </DataTable.Header>

              {semester.courseGrades?.map((course, idx) => (
                <DataTable.Row key={idx}>
                  <DataTable.Cell>{course.courseCode}</DataTable.Cell>
                  <DataTable.Cell numberOfLines={2}>
                    {course.courseName}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {course.finalGrade?.toFixed(1) || 'N/A'}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="outlined"
                      compact
                      textStyle={{
                        color:
                          course.letterGrade === 'A+' || course.letterGrade === 'A'
                            ? theme.colors.tertiary
                            : course.letterGrade === 'F'
                              ? theme.colors.error
                              : theme.colors.primary,
                      }}
                    >
                      {course.letterGrade || 'N/A'}
                    </Chip>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            <Divider style={styles.sectionDivider} />

            <View style={styles.semesterSummary}>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  GPA học kỳ (Hệ 10):
                </Text>
                <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.primary }]}>
                  {semester.semesterGPA10?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  GPA tích lũy (Hệ 10):
                </Text>
                <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.secondary }]}>
                  {semester.cumulativeGPA10?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Xếp loại:
                </Text>
                <Chip mode="outlined">
                  {semester.semesterRank || 'N/A'}
                </Chip>
              </View>
            </View>
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
  card: {
    margin: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: '600',
    opacity: 0.7,
    flex: 1,
  },
  infoValue: {
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  sectionDivider: {
    marginVertical: 16,
  },
  semesterSummary: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 12,
    borderRadius: 8,
  },
});

export default StudentGradesScreen;
