#!/bin/bash

# Create all remaining Admin screens

# Student Detail Screen
cat > "src/screens/Admin/Student/StudentDetailScreen.js" << 'STUDENTDETAIL'
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
STUDENTDETAIL

# Class List Screen
cat > "src/screens/Admin/Class/ClassListScreen.js" << 'CLASSLIST'
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, FAB, Searchbar } from 'react-native-paper';
import { classService } from '../../../services/classService';

const ClassListScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await classService.getAllClasses({ pageNumber: 1, pageSize: 100 });
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Tìm kiếm lớp..." style={styles.search} />
      <FlatList
        data={classes}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.className}</Text>
              <Text>Khoa: {item.department?.departmentName}</Text>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item) => item.id?.toString()}
      />
      <FAB style={styles.fab} icon="plus" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  card: { margin: 16, marginTop: 0 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});

export default ClassListScreen;
CLASSLIST

# Section List Screen  
cat > "src/screens/Admin/Section/SectionListScreen.js" << 'SECTIONLIST'
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Chip, Searchbar } from 'react-native-paper';
import { sectionService } from '../../../services/sectionService';

const SectionListScreen = ({ navigation }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await sectionService.getAllSections({ pageNumber: 1, pageSize: 100 });
      setSections(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Tìm kiếm..." style={styles.search} />
      <FlatList
        data={sections}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('SectionDetail', { sectionId: item.id })}>
            <Card.Content>
              <Text variant="titleMedium">{item.course?.courseName}</Text>
              <Text>Mã: {item.sectionCode}</Text>
              <Chip>{item.semester?.semesterName}</Chip>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  card: { margin: 16, marginTop: 0 },
});

export default SectionListScreen;
SECTIONLIST

echo "Admin screens created successfully!"
