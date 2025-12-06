import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  FAB,
  Searchbar,
  Chip,
  useTheme,
  Portal,
  Modal,
  Button,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { teacherService } from '../../../services/teacherService';
import { departmentService } from '../../../services/departmentService';
import SearchableAutocomplete from '../../../components/Common/SearchableAutocomplete';
import { toast } from '../../../utils/toast';

const TeacherListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // State
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterPosition, setFilterPosition] = useState(null);
  const [filterAcademicTitle, setFilterAcademicTitle] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const [departments, setDepartments] = useState([]);
  const [positions] = useState([
    { id: 'Lecturer', name: 'Giảng viên' },
    { id: 'SeniorLecturer', name: 'Giảng viên chính' },
    { id: 'AssociateProfessor', name: 'Phó giáo sư' },
    { id: 'Professor', name: 'Giáo sư' },
  ]);
  const [academicTitles] = useState([
    { id: 'Bachelor', name: 'Cử nhân' },
    { id: 'Master', name: 'Thạc sĩ' },
    { id: 'Doctor', name: 'Tiến sĩ' },
  ]);
  const [statusOptions] = useState([
    { id: true, name: 'Hoạt động' },
    { id: false, name: 'Không hoạt động' },
  ]);

  // Load initial data
  useEffect(() => {
    loadDepartments();
    loadTeachers();
  }, [page, rowsPerPage, filterDepartment, filterPosition, filterAcademicTitle, filterStatus]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getAllDepartments({
        pageNumber: 1,
        pageSize: 100,
      });
      if (response?.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getAllTeachers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        departmentId: filterDepartment?.id || null,
        position: filterPosition?.id || null,
        academicTitle: filterAcademicTitle?.id || null,
        isActive: filterStatus?.id ?? null,
        searchQuery: searchQuery || null,
      });

      if (response?.data) {
        setTeachers(response.data);
        setTotalRecords(response.totalRecords || 0);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Không thể tải danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeachers();
    setRefreshing(false);
  };

  const handleSearch = () => {
    setPage(0);
    loadTeachers();
  };

  const clearFilters = () => {
    setFilterDepartment(null);
    setFilterPosition(null);
    setFilterAcademicTitle(null);
    setFilterStatus(null);
    setSearchQuery('');
    setPage(0);
  };

  const renderTeacherCard = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('TeacherDetail', { teacherId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.teacherName}>
            {item.fullName}
          </Text>
          <Chip
            mode="outlined"
            compact
            style={[
              styles.statusChip,
              item.isActive
                ? { backgroundColor: theme.colors.primaryContainer }
                : { backgroundColor: theme.colors.errorContainer },
            ]}
          >
            {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Chip>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Mã GV:
          </Text>
          <Text variant="bodyMedium">{item.teacherCode || 'N/A'}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Email:
          </Text>
          <Text variant="bodyMedium">{item.email || 'N/A'}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Chuyên ngành:
          </Text>
          <Text variant="bodyMedium">
            {item.department?.departmentName || 'N/A'}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Chức vụ:
          </Text>
          <Text variant="bodyMedium">{item.position || 'N/A'}</Text>
        </View>

        {item.academicTitle && (
          <View style={styles.cardRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Học hàm:
            </Text>
            <Text variant="bodyMedium">{item.academicTitle}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Quản lý Giảng viên" />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setShowFilters(true)}
        />
      </Appbar.Header>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm theo tên, mã GV..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Active Filters */}
      {(filterDepartment || filterPosition || filterAcademicTitle || filterStatus) && (
        <View style={styles.activeFilters}>
          {filterDepartment && (
            <Chip
              onClose={() => {
                setFilterDepartment(null);
                setPage(0);
              }}
              style={styles.filterChip}
            >
              {filterDepartment.departmentName}
            </Chip>
          )}
          {filterPosition && (
            <Chip
              onClose={() => {
                setFilterPosition(null);
                setPage(0);
              }}
              style={styles.filterChip}
            >
              {filterPosition.name}
            </Chip>
          )}
          {filterAcademicTitle && (
            <Chip
              onClose={() => {
                setFilterAcademicTitle(null);
                setPage(0);
              }}
              style={styles.filterChip}
            >
              {filterAcademicTitle.name}
            </Chip>
          )}
          {filterStatus && (
            <Chip
              onClose={() => {
                setFilterStatus(null);
                setPage(0);
              }}
              style={styles.filterChip}
            >
              {filterStatus.name}
            </Chip>
          )}
          <Button mode="text" onPress={clearFilters} compact>
            Xóa bộ lọc
          </Button>
        </View>
      )}

      {/* Teachers List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={teachers}
          renderItem={renderTeacherCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge">Không có giảng viên nào</Text>
            </View>
          }
          onEndReached={() => {
            if (teachers.length < totalRecords) {
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* FAB - Add Teacher */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('TeacherAdd')}
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Bộ lọc
          </Text>

          <SearchableAutocomplete
            options={departments}
            value={filterDepartment}
            onChange={(newValue) => {
              setFilterDepartment(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) => option.departmentName}
            label="Chuyên ngành"
            placeholder="Tìm chuyên ngành..."
          />

          <SearchableAutocomplete
            options={positions}
            value={filterPosition}
            onChange={(newValue) => {
              setFilterPosition(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) => option.name}
            label="Chức vụ"
            placeholder="Tìm chức vụ..."
          />

          <SearchableAutocomplete
            options={academicTitles}
            value={filterAcademicTitle}
            onChange={(newValue) => {
              setFilterAcademicTitle(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) => option.name}
            label="Học hàm"
            placeholder="Tìm học hàm..."
          />

          <SearchableAutocomplete
            options={statusOptions}
            value={filterStatus}
            onChange={(newValue) => {
              setFilterStatus(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) => option.name}
            label="Trạng thái"
            placeholder="Chọn trạng thái..."
          />

          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={clearFilters} style={styles.modalButton}>
              Xóa bộ lọc
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFilters(false)}
              style={styles.modalButton}
            >
              Áp dụng
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 2,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teacherName: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    marginLeft: 8,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    width: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default TeacherListScreen;
