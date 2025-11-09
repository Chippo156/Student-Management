import React, { useState } from 'react';
import { Table, Button, Dropdown, Menu, Tag, Popconfirm, Spin } from 'antd';
import {
  UnorderedListOutlined,
  DeleteOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { tableRowClassName, parseModalSchedule } from './helpers';
import ScheduleModal from './ScheduleModal';

const EnrolledTable = ({
  theme,
  enrolledSections,
  handleDropEnrollment,
  loading,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [modalSchedule, setModalSchedule] = useState([]);

  const enrolledColumns = [
    {
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu>
              <Menu.Item
                key="detail"
                onClick={() => {
                  setModalSchedule(parseModalSchedule(record));
                  setShowScheduleModal(true);
                }}
              >
                <UnorderedListOutlined style={{ marginRight: 8 }} />
                Xem chi tiết
              </Menu.Item>
              <Menu.Item key="drop" danger>
                <Popconfirm
                  title="Bạn chắc chắn muốn hủy đăng ký lớp học phần này?"
                  okText="Hủy đăng ký"
                  cancelText="Không"
                  onConfirm={() => handleDropEnrollment(record.sectionId)}
                >
                  <DeleteOutlined style={{ marginRight: 8 }} />
                  Hủy đăng ký
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon={<UnorderedListOutlined />} size="small">
            Thao tác
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      render: (_, __, i) => i + 1,
    },
    { title: 'Mã LHP', dataIndex: 'sectionCode', align: 'center', width: 120 },
    { title: 'Tên môn học', dataIndex: 'courseName', width: 200 },
    {
      title: 'Lớp học dự kiến',
      dataIndex: 'expectedClass',
      align: 'center',
      width: 120,
    },
    { title: 'Số TC', dataIndex: 'credits', align: 'center', width: 70 },
    { title: 'Nhóm TH', dataIndex: 'labGroup', align: 'center', width: 80 },
    {
      title: 'Học phí',
      dataIndex: 'tuitionFee',
      align: 'right',
      width: 110,
      render: (v) => v?.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'paymentDeadline',
      align: 'center',
      width: 110,
      render: (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : ''),
    },
    {
      title: 'Thu',
      dataIndex: 'isPaid',
      align: 'center',
      width: 60,
      render: () => (
        <CheckSquareOutlined style={{ color: theme.palette.success.main }} />
      ),
    },
    {
      title: 'Trạng thái ĐK',
      dataIndex: 'registrationStatus',
      align: 'center',
      width: 110,
      render: (v) =>
        v === 'Đã đăng ký' ? (
          <Tag color="green">Đã đăng ký</Tag>
        ) : (
          <Tag color="red">{v}</Tag>
        ),
    },
    {
      title: 'Ngày ĐK',
      dataIndex: 'registrationDate',
      align: 'center',
      width: 110,
      render: (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : ''),
    },
    {
      title: 'Trạng thái LHP',
      dataIndex: 'sectionStatus',
      align: 'center',
      width: 110,
      render: (v) =>
        v === 'Available' ? (
          <Tag color="blue">Còn mở</Tag>
        ) : (
          <Tag color="red">{v}</Tag>
        ),
    },
  ];

  return (
    <>
      <div
        style={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          fontSize: 16,
          margin: '32px 0 8px',
        }}
      >
        LỚP HỌC PHẦN ĐÃ ĐĂNG KÝ TRONG HỌC KỲ NÀY
      </div>
      <Spin spinning={loading}>
        <Table
          columns={enrolledColumns}
          dataSource={enrolledSections.map((s, i) => ({
            ...s,
            key: s.sectionCode,
            index: i + 1,
          }))}
          pagination={false}
          size="small"
          bordered
          locale={{ emptyText: 'Chưa đăng ký lớp học phần nào' }}
          scroll={{ x: 1000 }}
          rowClassName={(r, i) => tableRowClassName(r, i, null, null)}
        />
      </Spin>
      <ScheduleModal
        theme={theme}
        showScheduleModal={showScheduleModal}
        setShowScheduleModal={setShowScheduleModal}
        modalSchedule={modalSchedule}
      />
    </>
  );
};

export default EnrolledTable;
