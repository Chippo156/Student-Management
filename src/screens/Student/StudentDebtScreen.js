import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
  Divider,
  DataTable,
  IconButton,
} from 'react-native-paper';
import { tuitionService } from '../../services/tuitionService';

const StudentDebtScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [debtData, setDebtData] = useState(null);

  useEffect(() => {
    fetchDebtData();
  }, []);

  const fetchDebtData = async () => {
    try {
      setLoading(true);
      const data = await tuitionService.getStudentDebt(null);
      setDebtData(data);
    } catch (error) {
      console.error('Error fetching debt data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!debtData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không có dữ liệu công nợ</Text>
      </View>
    );
  }

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return theme.colors.error;
    if (status === 2) return theme.colors.tertiary;
    return '#ff9800';
  };

  const getStatusText = (status, isOverdue) => {
    if (isOverdue) return 'Quá hạn';
    if (status === 0 || status === 1) return 'Chưa đóng';
    if (status === 2) return 'Đã đóng';
    if (status === 3) return 'Đóng 1 phần';
    return 'N/A';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="alert-circle" size={28} iconColor={theme.colors.error} />
            <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
              {formatCurrency(debtData.totalDebt)}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Tổng công nợ
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="check-circle" size={28} iconColor={theme.colors.tertiary} />
            <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
              {debtData.semesterDebts?.filter(s => s.status === 2).length || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Đã thanh toán
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Student Info */}
      <Card style={styles.card}>
        <Card.Title title="Thông tin sinh viên" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              MSSV:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {debtData.mssv}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Họ và tên:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {debtData.studentName}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Lớp:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {debtData.className}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Semester Debts */}
      {debtData.semesterDebts?.map((semester, index) => (
        <Card key={index} style={styles.card}>
          <Card.Title
            title={semester.semesterName}
            subtitle={formatCurrency(semester.totalAmount)}
            right={(props) => (
              <Chip
                mode="flat"
                style={{
                  backgroundColor: getStatusColor(semester.status, semester.isOverdue),
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#fff' }}>
                  {getStatusText(semester.status, semester.isOverdue)}
                </Text>
              </Chip>
            )}
          />
          <Card.Content>
            <View style={styles.semesterInfo}>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Mã học phí:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {semester.tuitionFeeCode || 'N/A'}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Đã thanh toán:
                </Text>
                <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.tertiary }]}>
                  {formatCurrency(semester.paidAmount)}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Còn lại:
                </Text>
                <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.error }]}>
                  {formatCurrency(semester.remainingAmount)}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Hạn thanh toán:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {semester.dueDate
                    ? new Date(semester.dueDate).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </Text>
              </View>
            </View>

            <Divider style={styles.sectionDivider} />

            {/* Course Details */}
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Danh sách môn học ({semester.courseDetails?.length || 0})
            </Text>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Mã lớp HP</DataTable.Title>
                <DataTable.Title>Tên môn</DataTable.Title>
                <DataTable.Title numeric>TC</DataTable.Title>
                <DataTable.Title numeric>Học phí</DataTable.Title>
              </DataTable.Header>

              {semester.courseDetails?.slice(0, 5).map((course, idx) => (
                <DataTable.Row key={idx}>
                  <DataTable.Cell>{course.sectionCode}</DataTable.Cell>
                  <DataTable.Cell numberOfLines={2}>
                    {course.courseName}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>{course.credits}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {formatCurrency(course.amount)}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            {semester.courseDetails && semester.courseDetails.length > 5 && (
              <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center', opacity: 0.7 }}>
                Và {semester.courseDetails.length - 5} môn khác...
              </Text>
            )}
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
    margin: 16,
    marginTop: 0,
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
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  sectionDivider: {
    marginVertical: 16,
  },
  semesterInfo: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
});

export default StudentDebtScreen;
