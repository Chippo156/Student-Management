import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  IconButton,
  Chip,
  FAB,
  Portal,
  Modal,
  TextInput,
  Divider,
} from 'react-native-paper';
import { bankAccountService } from '../../services/bankAccountService';
import { showToast } from '../../utils/toast';

const BankInfoScreen = ({ navigation }) => {
  const theme = useTheme();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form fields
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [branch, setBranch] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await bankAccountService.getUserBankAccounts();
      let accounts = Array.isArray(res) ? res : [];
      accounts = accounts.sort(
        (a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)
      );
      setBankAccounts(accounts);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      showToast('Không thể lấy danh sách tài khoản!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setAccountNumber('');
    setBankName('');
    setBankCode('');
    setBranch('');
    setAccountHolderName('');
    setModalVisible(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setAccountNumber(account.accountNumber || '');
    setBankName(account.bankName || '');
    setBankCode(account.bankCode || '');
    setBranch(account.branch || '');
    setAccountHolderName(account.accountHolderName || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        accountNumber,
        bankName,
        bankCode,
        branch,
        accountHolderName,
        dateCreateAccount: new Date().toISOString().split('T')[0],
        isDefault: true,
      };

      if (editingAccount) {
        await bankAccountService.updateBankAccount(editingAccount.id, payload);
        showToast('Cập nhật tài khoản thành công!', 'success');
      } else {
        await bankAccountService.createBankAccount(payload);
        showToast('Thêm tài khoản thành công!', 'success');
      }

      setModalVisible(false);
      await fetchAccounts();
    } catch (error) {
      console.error('Save error:', error);
      showToast('Lưu tài khoản thất bại!', 'error');
    }
  };

  const handleDelete = async (id) => {
    const accountToDelete = bankAccounts.find((acc) => acc.id === id);
    if (accountToDelete?.isDefault) {
      showToast('Không thể xóa tài khoản mặc định!', 'error');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await bankAccountService.deleteBankAccount(id);
              showToast('Xóa tài khoản thành công!', 'success');
              await fetchAccounts();
            } catch (error) {
              console.error('Delete error:', error);
              showToast('Xóa tài khoản thất bại!', 'error');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id) => {
    try {
      await bankAccountService.setBankAccountDefault(id);
      showToast('Đã đặt làm tài khoản mặc định!', 'success');
      await fetchAccounts();
    } catch (error) {
      console.error('Set default error:', error);
      showToast('Không thể đặt làm mặc định!', 'error');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const defaultAccount = bankAccounts.find((account) => account.isDefault);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Default Account */}
        {defaultAccount && (
          <Card style={styles.card}>
            <Card.Title
              title="Tài khoản mặc định"
              left={(props) => <IconButton {...props} icon="star" />}
              right={(props) => (
                <Chip mode="flat" style={{ backgroundColor: theme.colors.primary }}>
                  <Text style={{ color: '#fff' }}>Mặc định</Text>
                </Chip>
              )}
            />
            <Card.Content>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Số tài khoản:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {defaultAccount.accountNumber}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Ngân hàng:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {defaultAccount.bankName}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Chủ tài khoản:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {defaultAccount.accountHolderName}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleEdit(defaultAccount)}>Sửa</Button>
            </Card.Actions>
          </Card>
        )}

        {/* All Accounts */}
        <Card style={styles.card}>
          <Card.Title
            title="Danh sách tài khoản"
            subtitle={`${bankAccounts.length} tài khoản`}
            left={(props) => <IconButton {...props} icon="bank" />}
          />
          {bankAccounts.map((account) => (
            <Card.Content key={account.id}>
              <View style={styles.accountItem}>
                <View style={styles.accountInfo}>
                  <Text variant="titleMedium" style={styles.accountNumber}>
                    {account.accountNumber}
                  </Text>
                  <Text variant="bodySmall" style={styles.bankName}>
                    {account.bankName}
                  </Text>
                  {account.isDefault && (
                    <Chip
                      mode="outlined"
                      compact
                      style={{ marginTop: 4, alignSelf: 'flex-start' }}
                    >
                      Mặc định
                    </Chip>
                  )}
                </View>
                <View style={styles.accountActions}>
                  {!account.isDefault && (
                    <IconButton
                      icon="star-outline"
                      size={20}
                      onPress={() => handleSetDefault(account.id)}
                    />
                  )}
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEdit(account)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(account.id)}
                  />
                </View>
              </View>
              <Divider style={styles.divider} />
            </Card.Content>
          ))}
        </Card>
      </ScrollView>

      {/* Add Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAdd}
      />

      {/* Add/Edit Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            {editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}
          </Text>

          <TextInput
            label="Số tài khoản"
            value={accountNumber}
            onChangeText={setAccountNumber}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Tên ngân hàng"
            value={bankName}
            onChangeText={setBankName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Mã ngân hàng"
            value={bankCode}
            onChangeText={setBankCode}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Chi nhánh"
            value={branch}
            onChangeText={setBranch}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Chủ tài khoản"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.modalButton}
            >
              Lưu
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
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
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  accountInfo: {
    flex: 1,
  },
  accountNumber: {
    fontWeight: '600',
  },
  bankName: {
    opacity: 0.7,
    marginTop: 4,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default BankInfoScreen;
