import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  ProgressBar,
  Chip,
  Divider,
  IconButton,
} from 'react-native-paper';
import graduationService from '../../services/graduationService';

const GraduateScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [graduationData, setGraduationData] = useState(null);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    fetchGraduationData();
  }, []);

  const fetchGraduationData = async () => {
    try {
      setLoading(true);
      const data = await graduationService.calculateGraduationProgress();
      if (data) {
        setGraduationData(data);
        setRequirements(data.requirements || []);
      }
    } catch (error) {
      console.error('Error fetching graduation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Đang tải tiến độ tốt nghiệp...</Text>
      </View>
    );
  }

  const overallProgress = graduationData?.overallProgress || 0;
  const totalCompleted = graduationData?.totalCreditsCompleted || 0;
  const totalRequired = graduationData?.totalCreditsRequired || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.colors.tertiary;
      case 'in-progress':
        return '#ff9800';
      case 'not-started':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'not-started':
        return 'Chưa thực hiện';
      default:
        return 'N/A';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Overall Progress */}
      <Card style={styles.card}>
        <Card.Title
          title="Tiến độ tốt nghiệp"
          left={(props) => <IconButton {...props} icon="trophy" />}
        />
        <Card.Content>
          <Text variant="displaySmall" style={styles.progressPercent}>
            {overallProgress}%
          </Text>
          <ProgressBar
            progress={overallProgress / 100}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <View style={styles.progressInfo}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                TC đã hoàn thành:
              </Text>
              <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.tertiary }]}>
                {totalCompleted}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                TC yêu cầu:
              </Text>
              <Text variant="titleMedium" style={styles.infoValue}>
                {totalRequired}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Còn lại:
              </Text>
              <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.error }]}>
                {totalRequired - totalCompleted}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Requirements */}
      <Card style={styles.card}>
        <Card.Title
          title="Yêu cầu tốt nghiệp"
          subtitle={`${requirements.filter(r => r.status === 'completed').length}/${requirements.length} hoàn thành`}
          left={(props) => <IconButton {...props} icon="clipboard-list" />}
        />
      </Card>

      {requirements.map((req, index) => (
        <Card key={req.id || index} style={styles.requirementCard}>
          <Card.Content>
            <View style={styles.requirementHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={styles.requirementTitle}>
                  {req.requirement}
                </Text>
                <Text variant="bodySmall" style={styles.requirementCategory}>
                  {req.category}
                </Text>
              </View>
              <Chip
                mode="flat"
                style={{ backgroundColor: getStatusColor(req.status) }}
              >
                <Text style={{ color: '#fff' }}>{getStatusText(req.status)}</Text>
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.requirementProgress}>
              <View style={styles.progressRow}>
                <Text variant="bodyMedium">
                  Tiến độ: {req.completed}/{req.total}
                </Text>
                <Text variant="bodyMedium">
                  {Math.round((req.completed / req.total) * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={req.completed / req.total}
                color={getStatusColor(req.status)}
                style={styles.requirementProgressBar}
              />
            </View>

            {req.description && (
              <>
                <Divider style={styles.divider} />
                <Text variant="bodySmall" style={styles.requirementDescription}>
                  {req.description}
                </Text>
              </>
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
  card: {
    margin: 16,
  },
  requirementCard: {
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
    marginTop: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: '600',
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: '700',
  },
  requirementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requirementTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementCategory: {
    opacity: 0.7,
  },
  divider: {
    marginVertical: 12,
  },
  requirementProgress: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requirementProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  requirementDescription: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default GraduateScreen;
