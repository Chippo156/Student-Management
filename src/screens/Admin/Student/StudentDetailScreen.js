import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { studentService } from '../../../services/studentServices';

const StudentDetailScreen = ({ route, navigation }) => {
  const { studentId } = route.params;
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      const data = await studentService.getStudentById(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Thông tin sinh viên" />
        <Card.Content>
          <Text>Tên: {student?.fullName}</Text>
          <Text>MSSV: {student?.studentCode}</Text>
          <Text>Email: {student?.email}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 16 },
});

export default StudentDetailScreen;
