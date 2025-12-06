import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, Searchbar, ActivityIndicator, Portal, Modal, Chip } from 'react-native-paper';
import SearchableAutocomplete from '../../../components/Common/SearchableAutocomplete';
import { gradeService } from '../../../services/gradeService';
import { sectionService } from '../../../services/sectionService';
import { toast } from '../../../utils/toast';

const GradeEntryScreen = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await sectionService.getAllSections({ pageNumber: 1, pageSize: 100 });
      setSections(response.data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const loadStudents = async (sectionId) => {
    setLoading(true);
    try {
      const response = await gradeService.getStudentsBySection(sectionId);
      setStudents(response || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    if (section?.id) {
      loadStudents(section.id);
    }
  };

  const handleGradeChange = (studentId, value) => {
    setGrades(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveGrades = async () => {
    try {
      await gradeService.updateGrades(grades);
      toast.success('Lưu điểm thành công');
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Lưu điểm thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.filterCard}>
        <Card.Content>
          <SearchableAutocomplete
            options={sections}
            value={selectedSection}
            onChange={handleSectionSelect}
            getOptionLabel={(option) => `${option.sectionCode} - ${option.course?.courseName}`}
            label="Chọn lớp học phần"
            placeholder="Tìm lớp học phần..."
          />
        </Card.Content>
      </Card>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.fullName}</Text>
                <Text variant="bodySmall">MSSV: {item.studentCode}</Text>
                <TextInput
                  label="Điểm"
                  mode="outlined"
                  keyboardType="numeric"
                  value={grades[item.id]?.toString() || ''}
                  onChangeText={(text) => handleGradeChange(item.id, text)}
                  style={styles.input}
                />
              </Card.Content>
            </Card>
          )}
          keyExtractor={(item) => item.id?.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>Chọn lớp học phần để nhập điểm</Text>
            </View>
          }
        />
      )}

      {students.length > 0 && (
        <Button mode="contained" onPress={handleSaveGrades} style={styles.button}>
          Lưu điểm
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterCard: { margin: 16, marginBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 12 },
  input: { marginTop: 8 },
  button: { margin: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { padding: 32, alignItems: 'center' },
});

export default GradeEntryScreen;
