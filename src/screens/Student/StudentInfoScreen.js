import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  IconButton,
  Chip,
  Surface,
  Divider,
  Avatar,
  Button,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { familyRelationshipService } from '../../services/familyRelationshipService';

const { width } = Dimensions.get('window');

const StudentInfoScreen = ({ navigation }) => {
  const theme = useTheme();
  const account = useSelector((state) => state.user.account);
  const [data, setData] = useState(null);
  const [familyRelationships, setFamilyRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getFamilyByType = (familyList, type) => {
    return familyList.find((f) => f.relationshipTypeName === type);
  };

  const fetchData = async () => {
    try {
      if (account) {
        setData(account);

        const familyUser =
          await familyRelationshipService.getFamilyRelationshipsByStudent();
        setFamilyRelationships(
          Array.isArray(familyUser) ? familyUser : familyUser?.data || []
        );
      }
    } catch (error) {
      console.error('Error fetching family info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [account]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Đang tải thông tin sinh viên...</Text>
      </View>
    );
  }

  const user = data?.user;
  const bank = user?.bankAccount;

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={styles.infoLabel}>
        {label}:
      </Text>
      <Text variant="bodyMedium" style={styles.infoValue}>
        {value || 'Chưa cập nhật'}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Banner */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerContent}>
          <Avatar.Text
            size={100}
            label={user?.fullName?.charAt(0) || 'S'}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.bannerName}>
            {user?.fullName || 'Sinh viên'}
          </Text>
          <Chip
            mode="flat"
            style={styles.mssvChip}
            textStyle={{ color: '#fff' }}
          >
            MSSV: {data?.mssv}
          </Chip>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={1}>
          <IconButton icon="school" size={24} iconColor={theme.colors.primary} />
          <Text variant="titleSmall" style={styles.statValue}>
            {data?.className || 'N/A'}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Lớp học
          </Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <IconButton icon="domain" size={24} iconColor={theme.colors.secondary} />
          <Text variant="titleSmall" style={styles.statValue}>
            {data?.departmentName || 'N/A'}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Khoa
          </Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <IconButton icon="calendar" size={24} iconColor={theme.colors.tertiary} />
          <Text variant="titleSmall" style={styles.statValue}>
            {data?.yearOfAdmission || 'N/A'}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Năm nhập học
          </Text>
        </Surface>
      </View>

      {/* Contact Info */}
      <Card style={styles.card}>
        <Card.Title
          title="Liên hệ"
          left={(props) => <IconButton {...props} icon="email" />}
        />
        <Card.Content>
          <InfoRow label="Email" value={user?.email} />
          <Divider style={styles.divider} />
          <InfoRow label="Số điện thoại" value={user?.phone} />
          <Divider style={styles.divider} />
          <InfoRow
            label="Giới tính"
            value={
              user?.gender === 0 ? 'Nam' : user?.gender === 1 ? 'Nữ' : 'Khác'
            }
          />
          <Divider style={styles.divider} />
          <InfoRow
            label="Ngày sinh"
            value={
              user?.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
                : null
            }
          />
        </Card.Content>
      </Card>

      {/* Personal Info */}
      <Card style={styles.card}>
        <Card.Title
          title="Thông tin cá nhân"
          left={(props) => <IconButton {...props} icon="account" />}
        />
        <Card.Content>
          <InfoRow label="Dân tộc" value={user?.ethnicity} />
          <Divider style={styles.divider} />
          <InfoRow label="Quốc tịch" value={user?.nationality} />
          <Divider style={styles.divider} />
          <InfoRow label="Nơi sinh" value={user?.placeOfBirth} />
          <Divider style={styles.divider} />
          <InfoRow label="Địa chỉ thường trú" value={user?.address} />
          <Divider style={styles.divider} />
          <InfoRow label="Địa chỉ tạm trú" value={user?.temporaryAddress} />
        </Card.Content>
      </Card>

      {/* Academic Info */}
      <Card style={styles.card}>
        <Card.Title
          title="Thông tin học tập"
          left={(props) => <IconButton {...props} icon="book-open-variant" />}
        />
        <Card.Content>
          <InfoRow label="MSSV" value={data?.mssv} />
          <Divider style={styles.divider} />
          <InfoRow label="Lớp" value={data?.className} />
          <Divider style={styles.divider} />
          <InfoRow label="Chương trình" value={data?.programName} />
          <Divider style={styles.divider} />
          <InfoRow label="Khoa" value={data?.departmentName} />
          <Divider style={styles.divider} />
          <InfoRow label="Trình độ" value={data?.trainningLevel} />
          <Divider style={styles.divider} />
          <InfoRow label="Năm nhập học" value={data?.yearOfAdmission} />
        </Card.Content>
      </Card>

      {/* ID Card */}
      <Card style={styles.card}>
        <Card.Title
          title="Giấy tờ cá nhân"
          left={(props) => <IconButton {...props} icon="card-account-details" />}
        />
        <Card.Content>
          <InfoRow label="CCCD" value={user?.citizenIdCard} />
          <Divider style={styles.divider} />
          <InfoRow
            label="Ngày cấp"
            value={
              user?.issuedDate
                ? new Date(user.issuedDate).toLocaleDateString('vi-VN')
                : null
            }
          />
          <Divider style={styles.divider} />
          <InfoRow label="Nơi cấp" value={user?.issuedPlace} />
        </Card.Content>
      </Card>

      {/* Bank Info */}
      <Card style={styles.card}>
        <Card.Title
          title="Tài khoản ngân hàng"
          left={(props) => <IconButton {...props} icon="bank" />}
        />
        <Card.Content>
          <InfoRow label="Số tài khoản" value={bank?.accountNumber} />
          <Divider style={styles.divider} />
          <InfoRow label="Ngân hàng" value={bank?.bankName} />
          <Divider style={styles.divider} />
          <InfoRow label="Chi nhánh" value={bank?.branch} />
          <Divider style={styles.divider} />
          <InfoRow label="Chủ tài khoản" value={bank?.accountHolderName} />
          {bank?.accountStatus !== undefined && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Trạng thái:
                </Text>
                <Chip
                  mode="outlined"
                  textStyle={{
                    color:
                      bank?.accountStatus === 1
                        ? theme.colors.tertiary
                        : theme.colors.error,
                  }}
                >
                  {bank?.accountStatus === 1 ? 'Đang hoạt động' : 'Đã khóa'}
                </Chip>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Family Members */}
      <Card style={styles.card}>
        <Card.Title
          title="Thông tin người thân"
          subtitle={`${familyRelationships.length} người`}
          left={(props) => <IconButton {...props} icon="account-group" />}
        />
        {familyRelationships.map((member, idx) => (
          <Card.Content key={member.familyRelationshipId || idx}>
            {idx > 0 && <Divider style={styles.sectionDivider} />}
            <Text
              variant="titleMedium"
              style={[styles.familyMemberTitle, { color: theme.colors.primary }]}
            >
              {member.relationshipTypeName || 'Người thân'}
            </Text>
            <InfoRow label="Họ tên" value={member.fullName} />
            <Divider style={styles.divider} />
            <InfoRow label="SĐT" value={member.phone} />
            <Divider style={styles.divider} />
            <InfoRow
              label="Năm sinh"
              value={
                member.dateOfBirth
                  ? new Date(member.dateOfBirth).toLocaleDateString('vi-VN')
                  : null
              }
            />
            <Divider style={styles.divider} />
            <InfoRow label="Email" value={member.email} />
            <Divider style={styles.divider} />
            <InfoRow label="Nghề nghiệp" value={member.occupation} />
            <Divider style={styles.divider} />
            <InfoRow label="Nơi làm việc" value={member.workplace} />
            <Divider style={styles.divider} />
            <InfoRow label="CCCD" value={member.citizenIdCard} />
            <Divider style={styles.divider} />
            <InfoRow
              label="Là người giám hộ"
              value={
                member.isGuardian === true
                  ? 'Có'
                  : member.isGuardian === false
                    ? 'Không'
                    : 'N/A'
              }
            />
          </Card.Content>
        ))}
      </Card>

      {/* Edit Button */}
      <Button
        mode="contained"
        icon="pencil"
        style={styles.editButton}
        onPress={() => navigation.navigate('StudentEditInfo')}
      >
        Chỉnh sửa thông tin
      </Button>

      <View style={{ height: 24 }} />
    </ScrollView>
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
  banner: {
    padding: 32,
    alignItems: 'center',
  },
  bannerContent: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  bannerName: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
  },
  mssvChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  statLabel: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
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
  sectionDivider: {
    marginVertical: 16,
  },
  familyMemberTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  editButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
});

export default StudentInfoScreen;
