import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Descriptions,
  Button,
  Tag,
  Divider,
  Spin,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { userService } from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import { familyRelationshipService } from '../../../service/familyRelationshipService';

const { Title, Text } = Typography;

// Helper: hiển thị tối đa 2 dòng, nếu dài thì ... và có tooltip
const InfoText = ({ children }) => (
  <span
    style={{
      display: '-webkit-box',
      maxWidth: 220,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      verticalAlign: 'bottom',
      color: !children ? '#fa541c' : undefined, // nổi bật khi chưa cập nhật
      fontWeight: !children ? 600 : undefined,
      fontStyle: !children ? 'italic' : undefined,
    }}
    title={children}
  >
    {children || 'Chưa cập nhật'}
  </span>
);

const renderFamilyInfo = (family) => (
  <Descriptions
    bordered
    column={{ xs: 1, sm: 2 }}
    size="middle"
    style={{ marginBottom: 24 }}
  >
    <Descriptions.Item label="Họ và tên">
      <InfoText>{family?.fullName}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Mối quan hệ">
      <InfoText>{family?.relationshipTypeName}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Năm sinh">
      <InfoText>
        {family?.dateOfBirth
          ? dayjs(family.dateOfBirth).format('DD/MM/YYYY')
          : ''}
      </InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Số điện thoại">
      <InfoText>{family?.phone}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Email">
      <InfoText>{family?.email}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="CCCD">
      <InfoText>{family?.citizenIdCard}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Ngày cấp CCCD">
      <InfoText>
        {family?.issuedDate
          ? dayjs(family.issuedDate).format('DD/MM/YYYY')
          : ''}
      </InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Nơi cấp CCCD">
      <InfoText>{family?.issuedPlace}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Nghề nghiệp">
      <InfoText>{family?.occupation}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Nơi làm việc">
      <InfoText>{family?.workplace}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Địa chỉ">
      <InfoText>{family?.address}</InfoText>
    </Descriptions.Item>
    <Descriptions.Item label="Là người giám hộ">
      <InfoText>
        {family?.isGuardian === true
          ? 'Có'
          : family?.isGuardian === false
            ? 'Không'
            : ''}
      </InfoText>
    </Descriptions.Item>
  </Descriptions>
);

const getFamilyByType = (familyList, typeName) =>
  familyList.find((item) => item.relationshipTypeName === typeName);

const StudentInfoPage = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [familyRelationships, setFamilyRelationships] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserInfo();
        setStudentInfo(data.user); // chỉ lấy data.user
        // Lấy danh sách người thân
        const familyUser =
          await familyRelationshipService.getFamilyRelationshipsByStudent();
        setFamilyRelationships(
          Array.isArray(familyUser) ? familyUser : familyUser?.data || []
        );
        // Không cần gọi getUserBankAccounts nữa, lấy trực tiếp từ user
        setBankAccount(data.user.bankAccount || null);
      } catch (err) {
        message.error('Không thể lấy thông tin sinh viên!');
        setStudentInfo(null);
      }
      setLoading(false);
    };
    fetchInfo();
  }, []);

  // Lấy thông tin cha, mẹ từ danh sách người thân
  const father = getFamilyByType(familyRelationships, 'Cha');
  const mother = getFamilyByType(familyRelationships, 'Mẹ');

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin sinh viên...</div>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#faad14' }}>
        Không có dữ liệu sinh viên!
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <Title level={2}>Thông tin sinh viên</Title>
      <Row gutter={[24, 24]} wrap>
        {/* Profile Card */}
        <Col xs={24} md={6} style={{ minWidth: 0 }}>
          <Card
            style={{
              textAlign: 'center',
              marginBottom: 24,
              height: '100%',
              minHeight: 420,
            }}
          >
            <Avatar
              size={120}
              src={studentInfo.avatarUrl}
              icon={<UserOutlined />}
              style={{ marginBottom: 16, background: '#e6f7ff' }}
            />
            <Title level={4} style={{ margin: 0 }}>
              <InfoText>{studentInfo.fullName}</InfoText>
            </Title>
            <Text type="secondary">
              <InfoText>{studentInfo.username}</InfoText>
            </Text>
            <div style={{ marginTop: 16 }}>
              <Tag
                color="blue"
                style={{ fontSize: '14px', padding: '4px 12px' }}
              >
                <InfoText>
                  {studentInfo.accountStatus === 1
                    ? 'Đang học'
                    : studentInfo.accountStatus === 0
                      ? 'Đã khóa'
                      : ''}
                </InfoText>
              </Tag>
            </div>
            <Divider />
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Email:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <InfoText>{studentInfo.email}</InfoText>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Số điện thoại:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <InfoText>{studentInfo.phone}</InfoText>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Địa chỉ:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <InfoText>{studentInfo.address}</InfoText>
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate('/student/edit-info')}
              style={{ width: '100%', marginTop: 16 }}
            >
              Chỉnh sửa thông tin
            </Button>
          </Card>
        </Col>

        {/* Details Cards */}
        <Col xs={24} md={18} style={{ minWidth: 0 }}>
          <Card title="Thông tin cá nhân" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Mã sinh viên">
                <InfoText>{studentInfo.username}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                <InfoText>{studentInfo.fullName}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                <InfoText>
                  {studentInfo.dateOfBirth
                    ? dayjs(studentInfo.dateOfBirth).format('DD/MM/YYYY')
                    : ''}
                </InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <InfoText>
                  {studentInfo.gender === 0
                    ? 'Nam'
                    : studentInfo.gender === 1
                      ? 'Nữ'
                      : 'Khác'}
                </InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Nơi sinh">
                <InfoText>{studentInfo.placeOfBirth}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Tôn giáo">
                <InfoText>{studentInfo.religion}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Số CCCD">
                <InfoText>{studentInfo.citizenIdCard}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cấp CCCD">
                <InfoText>
                  {studentInfo.issuedDate
                    ? dayjs(studentInfo.issuedDate).format('DD/MM/YYYY')
                    : ''}
                </InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Nơi cấp CCCD">
                <InfoText>{studentInfo.issuedPlace}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text copyable>
                  <InfoText>{studentInfo.email}</InfoText>
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <Text copyable>
                  <InfoText>{studentInfo.phone}</InfoText>
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                <InfoText>{studentInfo.address}</InfoText>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Thông tin tài khoản ngân hàng"
            style={{ marginBottom: 24 }}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Số tài khoản">
                <InfoText>{bankAccount?.accountNumber}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Ngân hàng">
                <InfoText>{bankAccount?.bankName}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh">
                <InfoText>{bankAccount?.branch}</InfoText>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái tài khoản">
                <Tag color={bankAccount?.accountStatus === 1 ? 'green' : 'red'}>
                  <InfoText>
                    {bankAccount?.accountStatus === 1
                      ? 'Đang hoạt động'
                      : bankAccount?.accountStatus === 0
                        ? 'Đã khóa'
                        : ''}
                  </InfoText>
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chủ tài khoản">
                <InfoText>{bankAccount?.accountHolderName}</InfoText>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin người thân */}
          <Card title="Thông tin người thân" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={24}>
                <Card
                  type="inner"
                  title="Cha"
                  style={{ marginBottom: 16 }}
                  headStyle={{ background: '#e6f7ff' }}
                >
                  <Descriptions bordered column={{ xs: 1 }}>
                    <Descriptions.Item label="Họ tên cha">
                      <InfoText>{father?.fullName}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT cha">
                      <InfoText>{father?.phone}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Năm sinh cha">
                      <InfoText>
                        {father?.dateOfBirth
                          ? dayjs(father.dateOfBirth).format('DD/MM/YYYY')
                          : ''}
                      </InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email cha">
                      <InfoText>{father?.email}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="CCCD cha">
                      <InfoText>{father?.citizenIdCard}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cấp CCCD cha">
                      <InfoText>
                        {father?.issuedDate
                          ? dayjs(father.issuedDate).format('DD/MM/YYYY')
                          : ''}
                      </InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nơi cấp CCCD cha">
                      <InfoText>{father?.issuedPlace}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nghề nghiệp cha">
                      <InfoText>{father?.occupation}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nơi làm việc cha">
                      <InfoText>{father?.workplace}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ cha">
                      <InfoText>{father?.address}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Là người giám hộ">
                      <InfoText>
                        {father?.isGuardian === true
                          ? 'Có'
                          : father?.isGuardian === false
                            ? 'Không'
                            : ''}
                      </InfoText>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} md={24}>
                <Card
                  type="inner"
                  title="Mẹ"
                  style={{ marginBottom: 16 }}
                  headStyle={{ background: '#fffbe6' }}
                >
                  <Descriptions bordered column={{ xs: 1 }}>
                    <Descriptions.Item label="Họ tên mẹ">
                      <InfoText>{mother?.fullName}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT mẹ">
                      <InfoText>{mother?.phone}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Năm sinh mẹ">
                      <InfoText>
                        {mother?.dateOfBirth
                          ? dayjs(mother.dateOfBirth).format('DD/MM/YYYY')
                          : ''}
                      </InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email mẹ">
                      <InfoText>{mother?.email}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="CCCD mẹ">
                      <InfoText>{mother?.citizenIdCard}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cấp CCCD mẹ">
                      <InfoText>
                        {mother?.issuedDate
                          ? dayjs(mother.issuedDate).format('DD/MM/YYYY')
                          : ''}
                      </InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nơi cấp CCCD mẹ">
                      <InfoText>{mother?.issuedPlace}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nghề nghiệp mẹ">
                      <InfoText>{mother?.occupation}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nơi làm việc mẹ">
                      <InfoText>{mother?.workplace}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ mẹ">
                      <InfoText>{mother?.address}</InfoText>
                    </Descriptions.Item>
                    <Descriptions.Item label="Là người giám hộ">
                      <InfoText>
                        {mother?.isGuardian === true
                          ? 'Có'
                          : mother?.isGuardian === false
                            ? 'Không'
                            : ''}
                      </InfoText>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentInfoPage;
