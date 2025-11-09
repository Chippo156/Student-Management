import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  FlagOutlined,
} from '@ant-design/icons';

// Giới tính
export const genderOptions = [
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
  { value: 3, label: 'Khác' },
];

export const genderLabel = (gender) => {
  if (gender === 0) return 'Nam';
  if (gender === 1) return 'Nữ';
  if (gender === 2) return 'Khác';
  return '';
};

// Vai trò
export const roleOptions = [
  { value: 1, label: 'Admin' },
  { value: 3, label: 'Giảng viên' },
  { value: 2, label: 'Sinh viên' },
];

// Học hàm học vị
export const academicTitleOptions = [
  { value: 'Thạc sĩ', label: 'Thạc sĩ' },
  { value: 'Tiến sĩ', label: 'Tiến sĩ' },
  { value: 'Phó giáo sư', label: 'Phó giáo sư' },
  { value: 'Giáo sư', label: 'Giáo sư' },
];

// Chức vụ
export const positionOptions = [
  { value: 'Giảng viên', label: 'Giảng viên' },
  { value: 'Trưởng khoa', label: 'Trưởng khoa' },
  { value: 'Phó khoa', label: 'Phó khoa' },
];

// Trạng thái tài khoản
export const accountStatusMap = {
  1: { label: 'Hoạt động', color: 'green' },
  2: { label: 'Không hoạt động', color: 'orange' },
  3: { label: 'Bị tạm khóa', color: 'red' },
  4: { label: 'Đã xóa', color: 'default' },
};

// Danh sách field hiển thị
export const fieldList = [
  { label: 'Tên đăng nhập', key: 'username', icon: <UserOutlined /> },
  { label: 'Họ và tên', key: 'fullName', icon: <UserOutlined /> },
  { label: 'Email', key: 'email', icon: <MailOutlined /> },
  { label: 'Số điện thoại', key: 'phone', icon: <PhoneOutlined /> },
  { label: 'Địa chỉ', key: 'address', icon: <HomeOutlined /> },
  {
    label: 'Giới tính',
    key: 'gender',
    icon: <UserOutlined />,
    render: genderLabel,
  },
  { label: 'Nơi sinh', key: 'placeOfBirth', icon: <HomeOutlined /> },
  { label: 'Tôn giáo', key: 'religion', icon: <FlagOutlined /> },
  {
    label: 'Ngày sinh',
    key: 'dateOfBirth',
    icon: <HomeOutlined />,
    render: (v) => (v ? new Date(v).toLocaleDateString() : ''),
  },
  { label: 'CCCD', key: 'citizenIdCard', icon: <UserOutlined /> },
  {
    label: 'Trạng thái tài khoản',
    key: 'accountStatus',
    icon: <UserOutlined />,
    render: (v) => (v === 0 ? 'Hoạt động' : 'Khóa'),
  },
];
