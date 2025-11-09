import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Divider,
  Spin,
  Typography,
  Avatar,
  Tag,
  Row,
  Col,
  Statistic,
  Space,
  Badge,
} from 'antd';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import {
  UserOutlined,
  BookOutlined,
  HomeOutlined,
  IdcardOutlined,
  BankOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import { familyRelationshipService } from '../../../service/familyRelationshipService';

const { Title, Text } = Typography;

const StudentInfoPage = () => {
  const theme = useTheme();
  const account = useSelector((state) => state.user.account);
  const [data, setData] = useState(null);
  const [familyRelationships, setFamilyRelationships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm lấy thông tin người thân
  const getFamilyByType = (familyList, type) => {
    return familyList.find((f) => f.relationshipTypeName === type);
  };

  useEffect(() => {
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
        console.error('Lỗi khi lấy thông tin người thân:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [account]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: theme.palette.background.default, minHeight: '100vh' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: theme.palette.text.primary }}>Đang tải thông tin sinh viên...</div>
      </div>
    );
  }

  const user = data?.user;
  const bank = user?.bankAccount;
  const father = getFamilyByType(familyRelationships, 'Cha');
  const mother = getFamilyByType(familyRelationships, 'Mẹ');

  const InfoText = ({ children }) => (
    <span style={{ color: theme.palette.text.primary }}>
      {children || <span style={{ color: theme.palette.text.disabled }}>Chưa cập nhật</span>}
    </span>
  );

  const SectionTitle = ({ icon, title, color }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: 16,
        fontWeight: 600,
        color: color || theme.palette.primary.main,
      }}
    >
      {icon}
      <span style={{ marginLeft: 8 }}>{title}</span>
    </div>
  );

  return (
    <div
      style={{
        padding: 24,
        background: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      {/* Banner Profile */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 16,
          padding: '40px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Row gutter={24} align="middle" style={{ position: 'relative' }}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Badge dot status="success" offset={[-10, 90]}>
              <Avatar
                size={120}
                src={user?.avatarUrl}
                icon={<UserOutlined />}
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '4px solid rgba(255, 255, 255, 0.5)',
                }}
              />
            </Badge>
            <Title level={3} style={{ margin: '16px 0 8px', color: '#fff' }}>
              {user?.fullName}
            </Title>
            <Tag color="cyan" style={{ fontSize: 14, padding: '4px 12px' }}>
              MSSV: {data?.mssv}
            </Tag>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>Lớp học</span>}
                  value={data?.className || 'Chưa có'}
                  valueStyle={{ color: '#fff', fontSize: 20 }}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col xs={12} sm={12}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>Khoa</span>}
                  value={data?.departmentName || 'Chưa có'}
                  valueStyle={{ color: '#fff', fontSize: 20 }}
                  prefix={<HomeOutlined />}
                />
              </Col>
              <Col xs={12} sm={12}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>Năm nhập học</span>}
                  value={data?.yearOfAdmission || 'N/A'}
                  valueStyle={{ color: '#fff', fontSize: 20 }}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col xs={12} sm={12}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>Trình độ</span>}
                  value={data?.trainningLevel || 'Chưa có'}
                  valueStyle={{ color: '#fff', fontSize: 20 }}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Email</span>}
              value={user?.email || 'Chưa có'}
              valueStyle={{ color: theme.palette.primary.main, fontSize: 14 }}
              prefix={<MailOutlined style={{ color: theme.palette.primary.main }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Số điện thoại</span>}
              value={user?.phone || 'Chưa có'}
              valueStyle={{ color: theme.palette.success.main, fontSize: 16 }}
              prefix={<PhoneOutlined style={{ color: theme.palette.success.main }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Giới tính</span>}
              value={user?.gender === 0 ? 'Nam' : user?.gender === 1 ? 'Nữ' : 'Khác'}
              valueStyle={{ color: theme.palette.secondary.main, fontSize: 16 }}
              prefix={<UserOutlined style={{ color: theme.palette.secondary.main }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <Statistic
              title={<span style={{ color: theme.palette.text.secondary }}>Ngày sinh</span>}
              value={user?.dateOfBirth ? dayjs(user.dateOfBirth).format('DD/MM/YYYY') : 'Chưa có'}
              valueStyle={{ color: theme.palette.warning.main, fontSize: 16 }}
              prefix={<CalendarOutlined style={{ color: theme.palette.warning.main }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thông tin cá nhân */}
      <Card
        title={
          <SectionTitle
            icon={<UserOutlined />}
            title="Thông tin cá nhân"
            color={theme.palette.primary.main}
          />
        }
        style={{ marginBottom: 24, background: theme.palette.background.paper, borderColor: theme.palette.divider }}
      >
        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="Họ và tên">
            <InfoText>{user?.fullName}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            <InfoText>
              {user?.dateOfBirth
                ? dayjs(user.dateOfBirth).format('DD/MM/YYYY')
                : ''}
            </InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            <InfoText>
              {user?.gender === 0 ? 'Nam' : user?.gender === 1 ? 'Nữ' : 'Khác'}
            </InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Dân tộc">
            <InfoText>{user?.ethnicity}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Quốc tịch">
            <InfoText>{user?.nationality}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Nơi sinh" span={2}>
            <InfoText>{user?.placeOfBirth}</InfoText>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Học tập */}
      <Card
        title={
          <SectionTitle
            icon={<BookOutlined />}
            title="Thông tin học tập"
            color={theme.palette.primary.dark}
          />
        }
        style={{ marginBottom: 24, background: theme.palette.background.paper, borderColor: theme.palette.divider }}
      >
        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="MSSV">
            <InfoText>{data?.mssv}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Lớp">
            <InfoText>{data?.className}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Chương trình">
            <InfoText>{data?.programName}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Khoa">
            <InfoText>{data?.departmentName}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Trình độ">
            <InfoText>{data?.trainningLevel}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Năm nhập học">
            <InfoText>{data?.yearOfAdmission}</InfoText>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Liên hệ */}
      <Card
        title={
          <SectionTitle
            icon={<HomeOutlined />}
            title="Liên hệ & Địa chỉ"
            color={theme.palette.success.main}
          />
        }
        style={{ marginBottom: 24, background: theme.palette.background.paper, borderColor: theme.palette.divider }}
      >
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Email">
            <InfoText>{user?.email}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <InfoText>{user?.phone}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ thường trú">
            <InfoText>{user?.address}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ tạm trú">
            <InfoText>{user?.temporaryAddress}</InfoText>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Giấy tờ */}
      <Card
        title={
          <SectionTitle
            icon={<IdcardOutlined />}
            title="Giấy tờ cá nhân"
            color={theme.palette.warning.dark}
          />
        }
        style={{ marginBottom: 24, background: theme.palette.background.paper, borderColor: theme.palette.divider }}
      >
        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="CCCD">
            <InfoText>{user?.citizenIdCard}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cấp">
            <InfoText>
              {user?.issuedDate
                ? dayjs(user.issuedDate).format('DD/MM/YYYY')
                : ''}
            </InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Nơi cấp" span={2}>
            <InfoText>{user?.issuedPlace}</InfoText>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Ngân hàng */}
      <Card
        title={
          <SectionTitle
            icon={<BankOutlined />}
            title="Tài khoản ngân hàng"
            color={theme.palette.secondary.dark}
          />
        }
        style={{ marginBottom: 24, background: theme.palette.background.paper, borderColor: theme.palette.divider }}
      >
        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="Số tài khoản">
            <InfoText>{bank?.accountNumber}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Ngân hàng">
            <InfoText>{bank?.bankName}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Chi nhánh">
            <InfoText>{bank?.branch}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Chủ tài khoản">
            <InfoText>{bank?.accountHolderName}</InfoText>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={bank?.accountStatus === 1 ? 'green' : 'red'}>
              {bank?.accountStatus === 1 ? 'Đang hoạt động' : 'Đã khóa'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Người thân */}
      <Card
        title={
          <SectionTitle
            icon={<TeamOutlined />}
            title="Thông tin người thân"
            color={theme.palette.error.main}
          />
        }
      >
        <Row gutter={[24, 24]}>
          {familyRelationships.map((member, idx) => (
            <Col xs={24} md={24} key={member.familyRelationshipId || idx}>
              <Card
                type="inner"
                title={member.relationshipTypeName || 'Người thân'}
                headStyle={{ background: theme.palette.background.default, color: theme.palette.text.primary }}
              >
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Họ tên">
                    <InfoText>{member.fullName}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="SĐT">
                    <InfoText>{member.phone}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Năm sinh">
                    <InfoText>
                      {member.dateOfBirth
                        ? dayjs(member.dateOfBirth).format('DD/MM/YYYY')
                        : ''}
                    </InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <InfoText>{member.email}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nghề nghiệp">
                    <InfoText>{member.occupation}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nơi làm việc">
                    <InfoText>{member.workplace}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="CCCD">
                    <InfoText>{member.citizenIdCard}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày cấp">
                    <InfoText>
                      {member.issuedDate
                        ? dayjs(member.issuedDate).format('DD/MM/YYYY')
                        : ''}
                    </InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nơi cấp">
                    <InfoText>{member.issuedPlace}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ thường trú">
                    <InfoText>{member.permanentAddress}</InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ cụ thể">
                    <InfoText>
                      {member.fullAddress || member.detailAddress}
                    </InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Là người giám hộ">
                    <InfoText>
                      {member.isGuardian === true
                        ? 'Có'
                        : member.isGuardian === false
                          ? 'Không'
                          : ''}
                    </InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Đã mất">
                    <InfoText>
                      {member.isDeceased === true
                        ? 'Có'
                        : member.isDeceased === false
                          ? 'Không'
                          : ''}
                    </InfoText>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chủ hộ">
                    <InfoText>
                      {member.isHouseholder === true
                        ? 'Có'
                        : member.isHouseholder === false
                          ? 'Không'
                          : ''}
                    </InfoText>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default StudentInfoPage;
