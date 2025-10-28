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
} from '@ant-design/icons';
import { familyRelationshipService } from '../../../service/familyRelationshipService';

const { Title } = Typography;

const StudentInfoPage = () => {
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
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin sinh viên...</div>
      </div>
    );
  }

  const user = data?.user;
  const bank = user?.bankAccount;
  const father = getFamilyByType(familyRelationships, 'Cha');
  const mother = getFamilyByType(familyRelationships, 'Mẹ');

  const InfoText = ({ children }) => (
    <span>
      {children || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
    </span>
  );

  const SectionTitle = ({ icon, title, color }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: 16,
        fontWeight: 600,
        color,
      }}
    >
      {icon}
      <span style={{ marginLeft: 8 }}>{title}</span>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 24,
        background: '#fafafa',
        borderRadius: 8,
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          textAlign: 'center',
          background: '#e6f4ff',
          borderRadius: 12,
          border: '1px solid #d0e7ff',
        }}
      >
        <Avatar
          size={100}
          src={user?.avatarUrl}
          icon={<UserOutlined />}
          style={{ background: '#fff', marginBottom: 12 }}
        />
        <Title level={3} style={{ margin: 0, color: '#0050b3' }}>
          {user?.fullName}
        </Title>
        <div style={{ color: '#555' }}>
          MSSV: {data?.mssv} • {data?.className}
        </div>
        <div style={{ color: '#555' }}>
          {data?.programName} • {data?.departmentName}
        </div>
      </Card>

      {/* Thông tin cá nhân */}
      <Card
        title={
          <SectionTitle
            icon={<UserOutlined />}
            title="Thông tin cá nhân"
            color="#0050b3"
          />
        }
        style={{ marginBottom: 24 }}
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
            color="#096dd9"
          />
        }
        style={{ marginBottom: 24 }}
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
            color="#389e0d"
          />
        }
        style={{ marginBottom: 24 }}
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
            color="#d48806"
          />
        }
        style={{ marginBottom: 24 }}
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
            color="#722ed1"
          />
        }
        style={{ marginBottom: 24 }}
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
            color="#fa541c"
          />
        }
      >
        <Row gutter={[24, 24]}>
          {familyRelationships.map((member, idx) => (
            <Col xs={24} md={24} key={member.familyRelationshipId || idx}>
              <Card
                type="inner"
                title={member.relationshipTypeName || 'Người thân'}
                headStyle={{ background: '#e6f7ff' }}
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
