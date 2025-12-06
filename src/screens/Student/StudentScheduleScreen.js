import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
  IconButton,
  Button,
  Divider,
} from 'react-native-paper';
import scheduleService from '../../services/scheduleService';

const StudentScheduleScreen = ({ navigation }) => {
  const theme = useTheme();
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    fetchSchedule();
  }, [currentWeek]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const dateStr = currentWeek.toISOString().split('T')[0];
      const data = await scheduleService.getByDate(dateStr, 0);

      const mapped = data.map((item) => ({
        id: item.scheduleId.toString(),
        title: item.courseName,
        date: item.date,
        time: `${item.startTime?.slice(0, 5)} - ${item.endTime?.slice(0, 5)}`,
        location: item.room || 'Online',
        lecturer: item.lecturerName || '',
        courseCode: item.courseCode || '',
        dayOfWeek: item.dayOfWeek,
      }));

      setScheduleItems(mapped.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = () => {
    const grouped = {};
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    scheduleItems.forEach((item) => {
      const dayName = dayNames[item.dayOfWeek];
      if (!grouped[dayName]) {
        grouped[dayName] = [];
      }
      grouped[dayName].push(item);
    });

    return grouped;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const groupedSchedule = groupByDay();

  return (
    <View style={styles.container}>
      {/* Week Navigation */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.weekNav}>
            <IconButton icon="chevron-left" onPress={goToPreviousWeek} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text variant="titleMedium">
                Tuần {Math.ceil(currentWeek.getDate() / 7)}
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                {currentWeek.toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <IconButton icon="chevron-right" onPress={goToNextWeek} />
          </View>
          <Button mode="outlined" onPress={goToToday} style={{ marginTop: 8 }}>
            Hôm nay
          </Button>
        </Card.Content>
      </Card>

      {/* Schedule List */}
      <ScrollView>
        {Object.entries(groupedSchedule).map(([day, items]) => (
          <Card key={day} style={styles.card}>
            <Card.Title
              title={day}
              subtitle={`${items.length} lịch`}
              left={(props) => <IconButton {...props} icon="calendar" />}
            />
            <Card.Content>
              {items.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.scheduleItem}>
                    <View style={styles.timeIndicator}>
                      <Text variant="bodySmall" style={styles.timeText}>
                        {item.time}
                      </Text>
                    </View>
                    <View style={styles.scheduleContent}>
                      <Text variant="titleSmall" style={styles.courseTitle}>
                        {item.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.courseCode}>
                        {item.courseCode}
                      </Text>
                      <View style={styles.scheduleDetails}>
                        <Chip mode="outlined" compact icon="map-marker">
                          {item.location}
                        </Chip>
                        <Text variant="bodySmall" style={{ marginTop: 4 }}>
                          GV: {item.lecturer}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {index < items.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}

        {Object.keys(groupedSchedule).length === 0 && (
          <Card style={styles.card}>
            <Card.Content style={{ alignItems: 'center', padding: 32 }}>
              <IconButton icon="calendar-blank" size={48} />
              <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                Không có lịch học trong tuần này
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
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
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  timeIndicator: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  timeText: {
    fontWeight: '600',
    opacity: 0.7,
  },
  scheduleContent: {
    flex: 1,
  },
  courseTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  courseCode: {
    opacity: 0.7,
    marginBottom: 8,
  },
  scheduleDetails: {
    gap: 4,
  },
  divider: {
    marginVertical: 4,
  },
});

export default StudentScheduleScreen;
