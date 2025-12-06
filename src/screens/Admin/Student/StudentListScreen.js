import React, { useState, useEffect, useMemo } from 'react';
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
  Avatar,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { studentServices } from '../../../services/studentService';
import { departmentService } from '../../../services/departmentService';
import { classService } from '../../../services/classService';
import SearchableAutocomplete from '../../../components/Common/SearchableAutocomplete';
import { toast } from '../../../utils/toast';

const yearOptions = [
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021' },
  { value: '2020', label: '2020' },
];

const statusOptions = [
  { value: 1, label: 'Đang học' },
  { value: 2, label: 'Không hoạt động' },
  { value: 3, label: 'Đã tốt nghiệp' },
  { value: 4, label: 'Đình chỉ' },
  { value: 5, label: 'Bảo lưu' },
];

const StudentListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // State
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [filterYearOfAdmission, setFilterYearOfAdmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDepartments();
    loadStudents();
  }, [page, rowsPerPage, filterDepartment, filterClass, filterYearOfAdmission, filterStatus]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getDepartmentsDropdown();
      if (response && Array.isArray(response)) {
        setDepartments(response);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Fetch classes when department changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (filterDepartment) {
        const result = await classService.getClassesDropdownByDepartment(
          filterDepartment.departmentId
        );
        if (result && Array.isArray(result)) {
          setClasses(result);
        } else {
          setClasses([]);
        }
        setFilterClass(null);
      } else {
        const result = await classService.getAllClasses(1, 1000, '');
        if (result && result.items && Array.isArray(result.items)) {
          setClasses(result.items);
        } else {
          setClasses([]);
        }
      }
    };
    fetchClasses();
  }, [filterDepartment]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const filters = {
        departmentId: filterDepartment?.departmentId,
        className: filterClass?.className,
        yearOfAdmission: filterYearOfAdmission?.value,
        studentStatus: filterStatus?.value,
      };

      const response = await studentServices.getAllStudents(
        page + 1,
        rowsPerPage,
        searchQuery,
        filters
      );

      if (response) {
        setStudents(response.items || []);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleSearch = () => {
    setPage(0);
    loadStudents();
  };

  const clearFilters = () => {
    setFilterDepartment(null);
    setFilterClass(null);
    setFilterYearOfAdmission(null);
    setFilterStatus(null);
    setSearchQuery('');
    setPage(0);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      1: { label: 'Đang học', color: theme.colors.success },
      2: { label: 'Không hoạt động', color: theme.colors.surfaceVariant },
      3: { label: 'Đã tốt nghiệp', color: theme.colors.primary },
      4: { label: 'Đình chỉ', color: theme.colors.error },
      5: { label: 'Bảo lưu', color: theme.colors.warning },
    };
    const config = statusConfig[status] || {
      label: 'Không xác định',
      color: theme.colors.surfaceVariant,
    };
    return (
      <Chip mode="outlined" textStyle={{ color: config.color }}>
        {config.label}
      </Chip>
    );
  };

  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.studentStatus === 1).length;
    const graduatedStudents = students.filter((s) => s.studentStatus === 3).length;
    const uniqueDepartments = new Set(
      students
        .map((s) => s.class?.program?.department?.departmentName)
        .filter(Boolean)
    ).size;

    return {
      total: totalCount,
      active: activeStudents,
      graduated: graduatedStudents,
      departments: uniqueDepartments,
    };
  }, [students, totalCount]);

  const renderStudentCard = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Avatar.Text
              size={40}
              label={item.user?.fullName?.[0]?.toUpperCase() || 'S'}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
            <View style={styles.cardTitleText}>
              <Text variant="titleMedium" style={styles.studentName}>
                {item.user?.fullName || 'N/A'}
              </Text>
              <Text variant="bodySmall" style={styles.studentCode}>
                {item.mssv}
              </Text>
            </View>
          </View>
          {getStatusChip(item.studentStatus)}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Email:
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {item.user?.email || 'Chưa cập nhật'}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Lớp:
          </Text>
          <Chip
            mode="outlined"
            compact
            style={styles.classChip}
          >
            {item.class?.className || 'N/A'}
          </Chip>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Chuyên ngành:
          </Text>
          <Text variant="bodyMedium" style={styles.value} numberOfLines={2}>
            {item.class?.program?.department?.departmentName || 'N/A'}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="bodyMedium" style={styles.label}>
            Năm nhập học:
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {item.yearOfAdmission || 'N/A'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Quản lý Sinh viên" />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setShowFilters(true)}
        />
      </Appbar.Header>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm theo MSSV, tên, email..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Active Filters */}
      {(filterDepartment || filterClass || filterYearOfAdmission || filterStatus) && (
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
          {filterClass && (
            <Chip
              onClose={() => {
                setFilterClass(null);
                setPage(0);
              }}
              style={styles.filterChip}
            >
              {filterClass.className}
            </Chip>
          )}
          {filterYearOfAdmission && (
            <Chip
              onClose={() => {
                setFilterYearOfAdmission(null);
                setPage(0);
              }}
              style={styles.filterChip}
            >
              Năm {filterYearOfAdmission.value}
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
              {filterStatus.label}
            </Chip>
          )}
          <Button mode="text" onPress={clearFilters} compact>
            Xóa bộ lọc
          </Button>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.statLabel}>
              Tổng sinh viên
            </Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats.total}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.statLabel}>
              Đang học
            </Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats.active}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.statLabel}>
              Đã tốt nghiệp
            </Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats.graduated}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Students List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge">Không có sinh viên nào</Text>
            </View>
          }
          onEndReached={() => {
            if (students.length < totalCount && !loading) {
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

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
            options={classes}
            value={filterClass}
            onChange={(newValue) => {
              setFilterClass(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) => option.className}
            label="Lớp"
            placeholder="Tìm lớp..."
          />

          <SearchableAutocomplete
            options={yearOptions}
            value={filterYearOfAdmission}
            onChange={(newValue) => {
              setFilterYearOfAdmission(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) => option.label}
            label="Năm nhập học"
            placeholder="Chọn năm..."
          />

          <SearchableAutocomplete
            options={statusOptions}
            value={filterStatus}
            onChange={(newValue) => {
              setFilterStatus(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) => option.label}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    elevation: 1,
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitleText: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontWeight: 'bold',
  },
  studentCode: {
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    width: 100,
  },
  value: {
    flex: 1,
  },
  classChip: {
    alignSelf: 'flex-start',
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

export default StudentListScreen;
