import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  Chip,
  IconButton,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { showToast } from '../../utils/toast';

const StudentNotesScreen = ({ navigation }) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Nộp bài tập lớn môn Cấu trúc dữ liệu',
      content: 'Hoàn thành project về cây AVL',
      priority: 'high',
      dueDate: '2025-10-15',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Đăng ký học phần kỳ 2',
      content: 'Chuẩn bị danh sách môn học',
      priority: 'medium',
      dueDate: '2025-11-30',
      status: 'pending',
    },
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return '#ff9800';
      case 'low':
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };

  const handleAdd = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setPriority('medium');
    setDueDate('');
    setModalVisible(true);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setPriority(note.priority);
    setDueDate(note.dueDate);
    setModalVisible(true);
  };

  const handleSave = () => {
    const newNote = {
      id: editingNote ? editingNote.id : Date.now().toString(),
      title,
      content,
      priority,
      dueDate,
      status: editingNote ? editingNote.status : 'pending',
    };

    if (editingNote) {
      setNotes(notes.map((n) => (n.id === editingNote.id ? newNote : n)));
      showToast('Cập nhật ghi chú thành công!', 'success');
    } else {
      setNotes([...notes, newNote]);
      showToast('Thêm ghi chú thành công!', 'success');
    }

    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa ghi chú này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setNotes(notes.filter((n) => n.id !== id));
          showToast('Xóa ghi chú thành công!', 'success');
        },
      },
    ]);
  };

  const handleToggleStatus = (id) => {
    setNotes(
      notes.map((n) =>
        n.id === id
          ? {
              ...n,
              status: n.status === 'pending' ? 'completed' : 'pending',
            }
          : n
      )
    );
  };

  const pendingNotes = notes.filter((n) => n.status === 'pending');
  const completedNotes = notes.filter((n) => n.status === 'completed');

  const renderNote = ({ item }) => (
    <Card style={styles.noteCard}>
      <Card.Content>
        <View style={styles.noteHeader}>
          <View style={{ flex: 1 }}>
            <Text
              variant="titleMedium"
              style={[
                styles.noteTitle,
                item.status === 'completed' && styles.completedText,
              ]}
            >
              {item.title}
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.noteContent,
                item.status === 'completed' && styles.completedText,
              ]}
            >
              {item.content}
            </Text>
            <View style={styles.noteMeta}>
              <Chip
                mode="outlined"
                compact
                textStyle={{ color: getPriorityColor(item.priority) }}
              >
                {item.priority === 'high'
                  ? 'Cao'
                  : item.priority === 'medium'
                    ? 'Trung bình'
                    : 'Thấp'}
              </Chip>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
          <View>
            <IconButton
              icon={
                item.status === 'completed' ? 'check-circle' : 'circle-outline'
              }
              iconColor={
                item.status === 'completed' ? theme.colors.tertiary : undefined
              }
              onPress={() => handleToggleStatus(item.id)}
            />
            <IconButton
              icon="pencil"
              onPress={() => handleEdit(item)}
            />
            <IconButton
              icon="delete"
              iconColor={theme.colors.error}
              onPress={() => handleDelete(item.id)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={{ color: '#ff9800' }}>
                {pendingNotes.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Đang chờ
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                {completedNotes.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Hoàn thành
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Pending Notes */}
        {pendingNotes.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Ghi chú đang chờ
            </Text>
            <FlatList
              data={pendingNotes}
              renderItem={renderNote}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        {/* Completed Notes */}
        {completedNotes.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Ghi chú đã hoàn thành
            </Text>
            <FlatList
              data={completedNotes}
              renderItem={renderNote}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAdd}
      />

      {/* Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {editingNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
            </Text>

            <TextInput
              label="Tiêu đề"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Nội dung"
              value={content}
              onChangeText={setContent}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            <Text variant="labelLarge" style={styles.label}>
              Mức độ ưu tiên
            </Text>
            <SegmentedButtons
              value={priority}
              onValueChange={setPriority}
              buttons={[
                { value: 'low', label: 'Thấp' },
                { value: 'medium', label: 'TB' },
                { value: 'high', label: 'Cao' },
              ]}
              style={styles.input}
            />

            <TextInput
              label="Hạn hoàn thành (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.modalButton}
              >
                Lưu
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  sectionTitle: {
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  noteCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  noteContent: {
    marginBottom: 12,
    opacity: 0.8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  noteMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
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

export default StudentNotesScreen;
