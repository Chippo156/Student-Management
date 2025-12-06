import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Card, Text, useTheme, IconButton, Surface, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import statisticsService from '../../../services/statisticsService';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overviewData, setOverviewData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getOverview();
      setOverviewData(data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Surface style={[styles.statCard, { backgroundColor: color + '15' }]} elevation={1}>
      <Card.Content>
        <IconButton icon={icon} size={32} iconColor={color} />
        <Text variant="headlineMedium" style={[styles.statValue, { color }]}>
          {value || 0}
        </Text>
        <Text variant="bodyMedium" style={styles.statTitle}>{title}</Text>
      </Card.Content>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.banner}
      >
        <Text variant="headlineMedium" style={styles.bannerTitle}>
          Bảng điều khiển quản trị
        </Text>
        <Text variant="bodyMedium" style={styles.bannerSubtitle}>
          Tổng quan hệ thống
        </Text>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            icon="account-group"
            title="Sinh viên"
            value={overviewData?.totalStudents}
            color={theme.colors.primary}
          />
          <StatCard
            icon="account-tie"
            title="Giảng viên"
            value={overviewData?.totalTeachers}
            color={theme.colors.secondary}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon="book-open-variant"
            title="Môn học"
            value={overviewData?.totalCourses}
            color="#4caf50"
          />
          <StatCard
            icon="school"
            title="Lớp học phần"
            value={overviewData?.totalSections}
            color="#ff9800"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: { padding: 24, margin: 16, borderRadius: 16 },
  bannerTitle: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)' },
  statsGrid: { padding: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 12, gap: 12 },
  statCard: { flex: 1, borderRadius: 12 },
  statValue: { fontWeight: '700', textAlign: 'center', marginVertical: 8 },
  statTitle: { textAlign: 'center', opacity: 0.7 },
});

export default AdminDashboardScreen;
