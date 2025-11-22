import React, { forwardRef } from 'react';
import {
  Table,
  Button,
  Dropdown,
  Menu,
  Tag,
  Popconfirm,
  Spin,
  Card,
} from 'antd';
import {
  UnorderedListOutlined,
  DeleteOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { tableRowClassName, parseModalSchedule } from './helpers';
import ScheduleModal from './ScheduleModal';

const EnrolledTable = forwardRef((props, ref) => {
  const { theme, enrolledSections, handleDropEnrollment, loading } = props;

  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [modalSchedule, setModalSchedule] = React.useState([]);

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
      render: (status) => {
        const statusMap = {
          0: { text: 'Đang chuẩn bị', color: 'orange' },
          1: { text: 'Mở đăng ký', color: 'green' },
          2: { text: 'Đã đóng', color: 'red' },
          3: { text: 'Đã hủy', color: 'default' },
          4: { text: 'Đã hoàn thành', color: 'blue' },
        };
        const s = statusMap[status];
        if (s) {
          return <Tag color={s.color}>{s.text}</Tag>;
        }
        return <Tag color="default">{status}</Tag>;
      },
    },
  ];

  return (
    <Card
      ref={ref}
      title={
        <>
          <CheckCircleOutlined style={{ marginRight: 8 }} />
          Danh sách môn đã đăng ký ({enrolledSections.length})
        </>
      }
      style={{
        marginTop: 24,
        borderRadius: 8,
        background: theme.palette.background.paper,
        borderColor: theme.palette.divider,
      }}
      className="register-courses-enrolled-table"
    >
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
    </Card>
  );
});

EnrolledTable.displayName = 'EnrolledTable';

export default EnrolledTable;
