import React from 'react';
import { Modal, Button, Table } from 'antd';

const ScheduleModal = ({
  theme,
  showScheduleModal,
  setShowScheduleModal,
  modalSchedule,
}) => (
  <Modal
    open={showScheduleModal}
    onCancel={() => setShowScheduleModal(false)}
    footer={<Button onClick={() => setShowScheduleModal(false)}>Đóng</Button>}
    title="Lịch học phần chi tiết"
    styles={{
      body: { background: theme.palette.background.paper },
      header: {
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
      },
    }}
  >
    <Table
      columns={[
        {
          title: 'STT',
          dataIndex: 'index',
          width: 50,
          align: 'center',
          render: (_, __, i) => i + 1,
        },
        { title: 'Thứ', dataIndex: 'dayOfWeekName', width: 120 },
        { title: 'Bắt đầu', dataIndex: 'startTime', width: 100 },
        { title: 'Kết thúc', dataIndex: 'endTime', width: 100 },
        { title: 'Phòng', dataIndex: 'room', width: 120 },
        { title: 'Loại', dataIndex: 'scheduleTypeName', width: 120 },
      ]}
      dataSource={modalSchedule.map((s, i) => ({
        ...s,
        key: i + 1,
        index: i + 1,
      }))}
      pagination={false}
      size="small"
    />
  </Modal>
);

export default ScheduleModal;
