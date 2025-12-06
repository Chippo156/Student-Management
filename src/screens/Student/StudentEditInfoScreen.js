import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  TextInput,
  SegmentedButtons,
  Portal,
  Modal,
} from 'react-native-paper';
import { userService } from '../../services/userService';
import { familyRelationshipService } from '../../services/familyRelationshipService';
import { studentServices } from '../../services/studentServices';
import { showToast } from '../../utils/toast';

const StudentEditInfoScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentInfo, setStudentInfo] = useState({});
  const [familyList, setFamilyList] = useState([]);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [nationality, setNationality] = useState('');
  const [religion, setReligion] = useState('');
  const [citizenIdCard, setCitizenIdCard] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [issuedPlace, setIssuedPlace] = useState('');
  const [address, setAddress] = useState('');
  const [temporaryAddress, setTemporaryAddress] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const userRes = await userService.getUserInfo();
      const userData = userRes?.user || {};
      setStudentInfo(userData);

      // Set form fields
      setFullName(userData.fullName || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setGender(
        userData.gender === 0 ? 'Nam' : userData.gender === 1 ? 'Nữ' : 'Khác'
      );
      setDateOfBirth(userData.dateOfBirth || '');
      setEthnicity(userData.ethnicity || '');
      setNationality(userData.nationality || '');
      setReligion(userData.religion || '');
      setCitizenIdCard(userData.citizenIdCard || '');
      setIssuedDate(userData.issuedDate || '');
      setIssuedPlace(userData.issuedPlace || '');
      setAddress(userData.address || '');
      setTemporaryAddress(userData.temporaryAddress || '');

      // Fetch family relationships
      const familyRes =
        await familyRelationshipService.getFamilyRelationshipsByStudent();
      const familyListRaw = Array.isArray(familyRes)
        ? familyRes
        : familyRes?.data || [];
      setFamilyList(familyListRaw);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Không thể tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async () => {
    try {
      setSaving(true);

      const genderValue = gender === 'Nam' ? 0 : gender === 'Nữ' ? 1 : 2;

      const data = {
        fullName: fullName || null,
        email: email || null,
        phone: phone || null,
        gender: genderValue,
        dateOfBirth: dateOfBirth || null,
        ethnicity: ethnicity || null,
        nationality: nationality || null,
        religion: religion || null,
        avatarUrl: null,
        citizenIdCard: citizenIdCard || null,
        issuedDate: issuedDate || null,
        issuedPlace: issuedPlace || null,
        address: address || null,
        temporaryAddress: temporaryAddress || null,
        healthInsuranceNumber: studentInfo.healthInsuranceNumber || null,
        registeredHospital: studentInfo.registeredHospital || null,
      };

      await studentServices.updateStudentInformation(data);
      showToast('Cập nhật thông tin thành công!', 'success');
      navigation.goBack();
    } catch (err) {
      console.error('Update error:', err);
      showToast('Cập nhật thông tin thất bại!', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Đang tải thông tin sinh viên...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Chỉnh sửa thông tin cá nhân" />
        <Card.Content>
          <TextInput
            label="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text variant="labelLarge" style={styles.label}>
            Giới tính
          </Text>
          <SegmentedButtons
            value={gender}
            onValueChange={setGender}
            buttons={[
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
              { value: 'Khác', label: 'Khác' },
            ]}
            style={styles.input}
          />

          <TextInput
            label="Ngày sinh (YYYY-MM-DD)"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <TextInput
            label="Dân tộc"
            value={ethnicity}
            onChangeText={setEthnicity}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Quốc tịch"
            value={nationality}
            onChangeText={setNationality}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Tôn giáo"
            value={religion}
            onChangeText={setReligion}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Số CCCD"
            value={citizenIdCard}
            onChangeText={setCitizenIdCard}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Ngày cấp CCCD (YYYY-MM-DD)"
            value={issuedDate}
            onChangeText={setIssuedDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <TextInput
            label="Nơi cấp CCCD"
            value={issuedPlace}
            onChangeText={setIssuedPlace}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Địa chỉ thường trú"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <TextInput
            label="Địa chỉ tạm trú"
            value={temporaryAddress}
            onChangeText={setTemporaryAddress}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSavePersonal}
          loading={saving}
          disabled={saving}
          style={styles.button}
        >
          Lưu thông tin
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={saving}
          style={styles.button}
        >
          Hủy
        </Button>
      </View>

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
  card: {
    margin: 16,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});

export default StudentEditInfoScreen;
