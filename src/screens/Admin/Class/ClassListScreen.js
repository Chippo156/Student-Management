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
