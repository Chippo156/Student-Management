import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  IconButton,
  Chip,
  Surface,
  Divider,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import reportService from '../../services/reportService';
import scheduleService from '../../services/scheduleService';
import { semesterService } from '../../services/semesterService';
import enrollmentService from '../../services/enrollmentService';

const { width } = Dimensions.get('window');

const getCurrentSemesterName = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month >= 1 && month <= 5) {
    return `HK2 ${year - 1}-${year}`;
  } else if (month >= 6 && month <= 8) {
    return `HK3 ${year - 1}-${year}`;
  } else {
    return `HK1 ${year}-${year + 1}`;
  }
};

const StudentDashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const account = useSelector((state) => state.user.account);

  const [semesterReport, setSemesterReport] = useState(null);
  const [creditsSummary, setCreditsSummary] = useState(null);
  const [enrollmentList, setEnrollmentList] = useState([]);
  const [scheduleCount, setScheduleCount] = useState({
    countScheduleOfWeek: 0,
    countTestOfWeek: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  const completedCredits = creditsSummary?.totalCreditCompleted ?? 0;
  const totalCredits =
    creditsSummary?.totalCreditRequired ?? account?.totalCreditsRequired ?? 0;
  const percentCompleted =
    totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemesterId) {
      fetchEnrollment();
      fetchSemesterReport();
    }
  }, [selectedSemesterId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reportRes, scheduleRes, creditsSummaryRes] = await Promise.all([
        reportService.getSemesterCredits('1'),
        scheduleService.countScheduleOfWeek(),
        reportService.getAllCreditsByStudent(),
      ]);
      setSemesterReport(reportRes.data);
      setScheduleCount(scheduleRes.data);
      setCreditsSummary(creditsSummaryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSemesterReport(null);
      setScheduleCount({ countScheduleOfWeek: 0, countTestOfWeek: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const data = await semesterService.getStudentSemesters();
      setSemesters(data);

      if (data.length > 0) {
        const activeSemester = data.find((sem) => sem.isSemesterActive === true);
        if (activeSemester) {
          setSelectedSemesterId(activeSemester.semesterId);
        } else {
          setSelectedSemesterId(data[data.length - 1].semesterId);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    }
  };

  const fetchEnrollment = async () => {
    if (selectedSemesterId) {
      try {
        const res = await enrollmentService.getEnrollmentBySemester(
          selectedSemesterId
        );
        setEnrollmentList(res || []);
      } catch (error) {
        console.error('Error fetching enrollment:', error);
        setEnrollmentList([]);
      }
    }
  };

  const fetchSemesterReport = async () => {
    if (selectedSemesterId) {
      try {
        const reportRes = await reportService.getSemesterCredits(
          selectedSemesterId.toString()
        );
        setSemesterReport(reportRes.data);
      } catch (error) {
        console.error('Error fetching semester report:', error);
        setSemesterReport(null);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAll(), fetchSemesters()]);
    setRefreshing(false);
  };

  const QuickStatCard = ({ icon, title, value, color, onPress }) => (
    <Surface style={[styles.statCard, { backgroundColor: color + '15' }]} elevation={1}>
      <Card.Content style={styles.statCardContent}>
        <IconButton icon={icon} size={32} iconColor={color} />
        <Text variant="headlineSmall" style={[styles.statValue, { color }]}>
          {value}
        </Text>
        <Text variant="bodySmall" style={styles.statTitle}>
          {title}
        </Text>
      </Card.Content>
    </Surface>
  );

  const QuickMenuButton = ({ icon, label, route }) => (
    <Surface
      style={styles.menuButton}
      elevation={1}
      onTouchEnd={() => navigation.navigate(route)}
    >
      <IconButton icon={icon} size={28} iconColor={theme.colors.primary} />
      <Text variant="bodySmall" style={styles.menuLabel} numberOfLines={2}>
        {label}
      </Text>
    </Surface>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Banner */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <Text variant="labelSmall" style={styles.bannerDate}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text variant="headlineMedium" style={styles.bannerTitle}>
          Chào mừng trở lại,{' '}
          {account?.fullName || account?.user?.fullName || 'Sinh viên'}!
        </Text>
        <Text variant="bodyMedium" style={styles.bannerSubtitle}>
          Hôm nay là một ngày tuyệt vời để học tập và phát triển
        </Text>
        <Surface style={styles.semesterBadge} elevation={0}>
          <Text variant="labelSmall" style={styles.semesterLabel}>
            Học kỳ hiện tại
          </Text>
          <Text variant="titleMedium" style={styles.semesterValue}>
            {getCurrentSemesterName()}
          </Text>
        </Surface>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <QuickStatCard
            icon="book-outline"
            title="Môn học đăng ký"
            value={enrollmentList.length || 0}
            color={theme.colors.primary}
          />
          <QuickStatCard
            icon="check-circle-outline"
            title="Tín chỉ hoàn thành"
            value={`${completedCredits}/${totalCredits}`}
            color={theme.colors.tertiary || '#4caf50'}
          />
        </View>
        <View style={styles.statsRow}>
          <QuickStatCard
            icon="calendar-outline"
            title="Lịch tuần này"
            value={scheduleCount.countScheduleOfWeek || 0}
            color={theme.colors.secondary}
          />
          <QuickStatCard
            icon="trophy-outline"
            title="Tiến độ (%)"
            value={`${percentCompleted}%`}
            color="#ff9800"
          />
        </View>
      </View>

      {/* Profile Card */}
      <Card style={styles.card}>
        <Card.Title
          title="Thông tin cá nhân"
          left={(props) => <IconButton {...props} icon="account-circle" />}
        />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Mã sinh viên:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {account?.studentCode || 'N/A'}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Email:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {account?.email || 'N/A'}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Lớp:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {account?.className || 'N/A'}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Chuyên ngành:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {account?.department?.departmentName || 'N/A'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Menu */}
      <Card style={styles.card}>
        <Card.Title
          title="Truy cập nhanh"
          left={(props) => <IconButton {...props} icon="menu" />}
        />
        <Card.Content>
          <View style={styles.quickMenu}>
            <QuickMenuButton
              icon="calendar-month"
              label="Lịch theo tuần"
              route="StudentSchedule"
            />
            <QuickMenuButton
              icon="chart-bar"
              label="Kết quả học tập"
              route="StudentGrades"
            />
            <QuickMenuButton
              icon="file-document-outline"
              label="Đăng ký học phần"
              route="RegisterCourses"
            />
            <QuickMenuButton
              icon="account-box"
              label="Hồ sơ điện tử"
              route="StudentInfo"
            />
            <QuickMenuButton
              icon="currency-usd"
              label="Tra cứu công nợ"
              route="StudentDebt"
            />
            <QuickMenuButton
              icon="bell-outline"
              label="Nhắc nhở"
              route="Notifications"
            />
          </View>
        </Card.Content>
      </Card>

      {/* Enrolled Classes */}
      {enrollmentList.length > 0 && (
        <Card style={styles.card}>
          <Card.Title
            title="Lớp học phần đã đăng ký"
            subtitle={`Học kỳ: ${getCurrentSemesterName()}`}
            left={(props) => <IconButton {...props} icon="school" />}
          />
          <Card.Content>
            {enrollmentList.slice(0, 5).map((enrollment, index) => (
              <View key={index}>
                <View style={styles.classItem}>
                  <View style={styles.classInfo}>
                    <Text variant="titleSmall" style={styles.className}>
                      {enrollment.section?.course?.courseName || 'N/A'}
                    </Text>
                    <Text variant="bodySmall" style={styles.classCode}>
                      {enrollment.section?.sectionCode || 'N/A'}
                    </Text>
                  </View>
                  <Chip mode="outlined" compact>
                    {enrollment.section?.course?.credits || 0} TC
                  </Chip>
                </View>
                {index < enrollmentList.length - 1 && enrollmentList.length > 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))}
            {enrollmentList.length > 5 && (
              <Text
                variant="bodySmall"
                style={[styles.infoLabel, { marginTop: 12, textAlign: 'center' }]}
              >
                Và {enrollmentList.length - 5} lớp khác...
              </Text>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Academic Progress */}
      <Card style={styles.card}>
        <Card.Title
          title="Tiến độ học tập"
          left={(props) => <IconButton {...props} icon="progress-check" />}
        />
        <Card.Content>
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text variant="headlineLarge" style={styles.progressPercent}>
                {percentCompleted}%
              </Text>
              <Text variant="bodyMedium" style={styles.progressLabel}>
                Đã hoàn thành
              </Text>
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressDetailRow}>
                <Text variant="bodyMedium">Tổng tín chỉ yêu cầu:</Text>
                <Text variant="titleMedium" style={styles.progressValue}>
                  {totalCredits}
                </Text>
              </View>
              <View style={styles.progressDetailRow}>
                <Text variant="bodyMedium">Đã hoàn thành:</Text>
                <Text
                  variant="titleMedium"
                  style={[styles.progressValue, { color: theme.colors.tertiary || '#4caf50' }]}
                >
                  {completedCredits}
                </Text>
              </View>
              <View style={styles.progressDetailRow}>
                <Text variant="bodyMedium">Còn lại:</Text>
                <Text
                  variant="titleMedium"
                  style={[styles.progressValue, { color: theme.colors.error }]}
                >
                  {totalCredits - completedCredits}
                </Text>
              </View>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    padding: 24,
    borderRadius: 16,
    margin: 16,
  },
  bannerDate: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
  },
  semesterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignSelf: 'flex-start',
  },
  semesterLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  semesterValue: {
    color: '#fff',
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  statCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontWeight: '700',
    marginVertical: 4,
  },
  statTitle: {
    textAlign: 'center',
    opacity: 0.7,
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
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  quickMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuButton: {
    width: (width - 32 - 24) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  menuLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontWeight: '600',
    marginBottom: 4,
  },
  classCode: {
    opacity: 0.7,
  },
  progressContainer: {
    padding: 12,
  },
  progressInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressPercent: {
    fontWeight: '700',
    fontSize: 48,
  },
  progressLabel: {
    opacity: 0.7,
  },
  progressDetails: {
    gap: 12,
  },
  progressDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressValue: {
    fontWeight: '700',
  },
});

export default StudentDashboardScreen;
