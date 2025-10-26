import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import { UserOutlined, RightOutlined } from '@ant-design/icons';

const StudentProfileCard = ({
  account,
  colors,
  subTextStyle,
  acctFullName,
  acctAvatar,
  acctEmail,
  acctPhone,
  acctGender,
  acctPlaceOfBirth,
}) => (
  <Card
    style={{
      background: colors.bgCard,
      color: colors.fg,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      height: '100%',
    }}
  >
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} md={6} style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 10px 25px ${colors.primary}40`,
              overflow: 'hidden',
            }}
          >
            {acctAvatar ? (
              <img
                src={acctAvatar}
                alt="avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <UserOutlined
                style={{ fontSize: 42, color: colors.primaryContrast }}
              />
            )}
          </div>
          <span
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 18,
              height: 18,
              background: colors.success,
              borderRadius: 999,
              border: `2px solid ${colors.bgPage}`,
            }}
          />
        </div>
        <Button type="link" style={{ marginTop: 8, padding: 0 }}>
          Xem chi tiết <RightOutlined />
        </Button>
      </Col>
      <Col xs={24} md={18}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <div style={{ display: 'grid', rowGap: 8 }}>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>MSSV:</span>
                <strong>{account?.mssv || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>Họ tên:</span>
                <strong>{acctFullName || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>
                  Giới tính:
                </span>
                <span style={{ color: colors.secondary }}>
                  {acctGender === 0
                    ? 'Nam'
                    : acctGender === 1
                      ? 'Nữ'
                      : 'Chưa cập nhật'}
                </span>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>
                  Nơi sinh:
                </span>
                <span>{acctPlaceOfBirth || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>SĐT:</span>
                <span>{acctPhone || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>
                  Địa chỉ:
                </span>
                <span>
                  {account?.address ||
                    account?.user?.address ||
                    'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'grid', rowGap: 8 }}>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>Email:</span>
                <span>{acctEmail || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>
                  Lớp học:
                </span>
                <strong style={{ color: colors.primary }}>
                  {account?.className || 'Chưa cập nhật'}
                </strong>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>Ngành:</span>
                <strong style={{ color: colors.primary }}>
                  {account?.programName || 'Chưa cập nhật'}
                </strong>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>Bộ môn:</span>
                <span>{account?.departmentName || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>
                  Bậc đào tạo:
                </span>
                <span style={{ color: colors.success }}>
                  {account?.trainningLevel === 'Bachelor'
                    ? 'Đại học'
                    : account?.trainningLevel || 'Chưa cập nhật'}
                </span>
              </div>
              <div>
                <span style={{ ...subTextStyle, marginRight: 6 }}>
                  Khóa học:
                </span>
                <span>
                  {account?.yearOfAddmision
                    ? `${account.yearOfAddmision}-${account.yearOfAddmision + 4}`
                    : 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  </Card>
);

export default StudentProfileCard;
