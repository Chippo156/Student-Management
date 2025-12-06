import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  IconButton,
  Chip,
  Divider,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { studentServices } from '../../services/studentServices';
import { showToast } from '../../utils/toast';

const SelfCheckInScreen = ({ navigation }) => {
  const theme = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [checkInCode, setCheckInCode] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await studentServices.getAvailableCheckInSessions();
      if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const handleOpenCheckInDialog = (session) => {
    setSelectedSession(session);
    setCheckInCode('');
    setNote('');
    setModalVisible(true);
  };

  const handleCheckIn = async () => {
    if (!selectedSession) return;

    try {
      setSubmitting(true);
      const result = await studentServices.selfCheckIn(
        selectedSession.attendanceSessionId,
        checkInCode,
        note || null
      );

      if (result) {
        setModalVisible(false);
        showToast('Điểm danh thành công!', 'success');
        await fetchSessions();
      }
    } catch (error) {
      console.error('Check-in error:', error);
      showToast('Điểm danh thất bại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (session) => {
    if (session.hasCheckedIn) {
      return (
        <Chip
          mode="flat"
          icon="check-circle"
          style={{ backgroundColor: theme.colors.tertiary }}
        >
          <Text style={{ color: '#fff' }}>Đã điểm danh</Text>
        </Chip>
      );
    }

    if (session.isCheckInActive) {
      return (
        <Chip
          mode="flat"
          icon="clock"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <Text style={{ color: '#fff' }}>Đang mở</Text>
        </Chip>
      );
    }

    if (session.minutesUntilStart > 0) {
      return (
        <Chip mode="outlined" icon="clock-outline">
          Còn {session.minutesUntilStart} phút
        </Chip>
      );
    }

    return <Chip mode="outlined">Đã đóng</Chip>;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sessions.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content style={{ alignItems: 'center', padding: 32 }}>
              <IconButton icon="calendar-blank" size={64} />
              <Text variant="titleMedium" style={{ marginTop: 16 }}>
                Không có phiên điểm danh nào
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 8, opacity: 0.7 }}>
                Hiện tại chưa có phiên điểm danh nào khả dụng
              </Text>
            </Card.Content>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.attendanceSessionId} style={styles.card}>
              <Card.Title
                title={session.sessionName}
                subtitle={session.sectionCode}
                right={(props) => getStatusChip(session)}
              />
              <Card.Content>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.infoLabel}>
                    Môn học:
                  </Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {session.courseCode} - {session.courseName}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.infoLabel}>
                    Giảng viên:
                  </Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {session.lecturerName}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.infoLabel}>
                    Buổi học:
                  </Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.infoLabel}>
                    Điểm danh:
                  </Text>
                  <Text variant="bodySmall" style={styles.infoValue}>
                    {formatDateTime(session.selfCheckInStartTime)}
                    {' - '}
                    {formatDateTime(session.selfCheckInEndTime)}
                  </Text>
                </View>
                {session.room && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text variant="bodyMedium" style={styles.infoLabel}>
                        Phòng:
                      </Text>
                      <Text variant="bodyMedium" style={styles.infoValue}>
                        {session.room}
                      </Text>
                    </View>
                  </>
                )}

                {session.hasCheckedIn && session.checkedInAt && (
                  <Card.Content
                    style={{
                      backgroundColor: theme.colors.tertiary + '20',
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <Text variant="bodySmall" style={{ color: theme.colors.tertiary }}>
                      Đã điểm danh lúc: {formatDateTime(session.checkedInAt)}
                    </Text>
                  </Card.Content>
                )}
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  disabled={
                    session.hasCheckedIn || !session.isCheckInActive || submitting
                  }
                  onPress={() => handleOpenCheckInDialog(session)}
                  icon={session.hasCheckedIn ? 'check-circle' : 'gesture-tap'}
                >
                  {session.hasCheckedIn
                    ? 'Đã điểm danh'
                    : session.isCheckInActive
                      ? 'Điểm danh ngay'
                      : 'Chưa đến giờ'}
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Check-in Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Xác nhận điểm danh
          </Text>

          {selectedSession && (
            <>
              <Card.Content
                style={{
                  backgroundColor: theme.colors.primary + '20',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {selectedSession.courseName}
                </Text>
                <Text variant="bodySmall">Phiên: {selectedSession.sessionName}</Text>
                <Text variant="bodySmall">
                  Thời gian: {formatDateTime(selectedSession.selfCheckInStartTime)} -{' '}
                  {formatDateTime(selectedSession.selfCheckInEndTime)}
                </Text>
              </Card.Content>

              <TextInput
                label="Mã điểm danh (nếu có)"
                value={checkInCode}
                onChangeText={setCheckInCode}
                mode="outlined"
                placeholder="Nhập mã điểm danh do giảng viên cung cấp"
                style={styles.input}
              />

              <TextInput
                label="Ghi chú (tùy chọn)"
                value={note}
                onChangeText={setNote}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Ghi chú của bạn..."
                style={styles.input}
              />
            </>
          )}

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              disabled={submitting}
              style={styles.modalButton}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleCheckIn}
              disabled={submitting}
              loading={submitting}
              style={styles.modalButton}
            >
              {submitting ? 'Đang điểm danh...' : 'Xác nhận'}
            </Button>
          </View>
        </Modal>
      </Portal>
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default SelfCheckInScreen;
