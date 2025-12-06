import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  Card,
  Text,
  useTheme,
  IconButton,
  Chip,
  Divider,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
} from 'react-native-paper';

const BHYTScreen = ({ navigation }) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Mock insurance info
  const [insuranceInfo] = useState({
    cardNumber: 'HS4030012345678',
    holderName: 'Nguyễn Văn A',
    dateOfBirth: '2002-05-15',
    gender: 'male',
    issueDate: '2024-01-01',
    expiryDate: '2025-12-31',
    issuedBy: 'BHXH TP.HCM',
    status: 'active',
    hospitalRegistered: 'Bệnh viện Đại học Y Dược TP.HCM',
  });

  const [medicalHistory] = useState([
    {
      id: '1',
      date: '2024-09-15',
      hospital: 'Bệnh viện Đại học Y Dược TP.HCM',
      diagnosis: 'Cảm cúm thông thường',
      treatment: 'Thuốc hạ sốt, kháng sinh',
      cost: 250000,
      covered: 200000,
    },
    {
      id: '2',
      date: '2024-08-20',
      hospital: 'Phòng khám Đa khoa Medlatec',
      diagnosis: 'Khám sức khỏe định kỳ',
      treatment: 'Xét nghiệm máu, đo huyết áp',
      cost: 180000,
      covered: 144000,
    },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={styles.infoLabel}>
        {label}:
      </Text>
      <Text variant="bodyMedium" style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );

  const renderMedicalRecord = ({ item }) => (
    <Card style={styles.recordCard}>
      <Card.Content>
        <View style={styles.recordHeader}>
          <Text variant="titleMedium" style={styles.diagnosis}>
            {item.diagnosis}
          </Text>
          <Chip mode="outlined" compact>
            {new Date(item.date).toLocaleDateString('vi-VN')}
          </Chip>
        </View>
        <Divider style={styles.divider} />
        <InfoRow label="Bệnh viện" value={item.hospital} />
        <InfoRow label="Điều trị" value={item.treatment} />
        <InfoRow label="Chi phí" value={formatCurrency(item.cost)} />
        <InfoRow label="BHYT chi trả" value={formatCurrency(item.covered)} />
        <InfoRow
          label="Tự trả"
          value={formatCurrency(item.cost - item.covered)}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Insurance Card */}
        <Card style={styles.card}>
          <Card.Title
            title="Thẻ BHYT"
            left={(props) => <IconButton {...props} icon="card-account-details" />}
            right={(props) => (
              <Chip
                mode="flat"
                style={{ backgroundColor: theme.colors.tertiary }}
              >
                <Text style={{ color: '#fff' }}>Còn hiệu lực</Text>
              </Chip>
            )}
          />
          <Card.Content>
            <InfoRow label="Số thẻ" value={insuranceInfo.cardNumber} />
            <Divider style={styles.divider} />
            <InfoRow label="Họ và tên" value={insuranceInfo.holderName} />
            <Divider style={styles.divider} />
            <InfoRow label="Ngày sinh" value={insuranceInfo.dateOfBirth} />
            <Divider style={styles.divider} />
            <InfoRow
              label="Giới tính"
              value={insuranceInfo.gender === 'male' ? 'Nam' : 'Nữ'}
            />
            <Divider style={styles.divider} />
            <InfoRow label="Ngày cấp" value={insuranceInfo.issueDate} />
            <Divider style={styles.divider} />
            <InfoRow label="Ngày hết hạn" value={insuranceInfo.expiryDate} />
            <Divider style={styles.divider} />
            <InfoRow label="Nơi cấp" value={insuranceInfo.issuedBy} />
            <Divider style={styles.divider} />
            <InfoRow label="Nơi ĐK KCB" value={insuranceInfo.hospitalRegistered} />
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.card}>
          <Card.Title
            title="Thống kê"
            left={(props) => <IconButton {...props} icon="chart-bar" />}
          />
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
                  {formatCurrency(
                    medicalHistory.reduce((sum, r) => sum + r.cost, 0)
                  )}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Tổng chi phí
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  variant="headlineSmall"
                  style={{ color: theme.colors.tertiary }}
                >
                  {formatCurrency(
                    medicalHistory.reduce((sum, r) => sum + r.covered, 0)
                  )}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  BHYT chi trả
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Medical History */}
        <Card style={styles.card}>
          <Card.Title
            title="Lịch sử khám chữa bệnh"
            subtitle={`${medicalHistory.length} lần khám`}
            left={(props) => <IconButton {...props} icon="history" />}
          />
        </Card>

        <FlatList
          data={medicalHistory}
          renderItem={renderMedicalRecord}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  recordCard: {
    marginBottom: 12,
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diagnosis: {
    fontWeight: '600',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BHYTScreen;
