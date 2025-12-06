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
