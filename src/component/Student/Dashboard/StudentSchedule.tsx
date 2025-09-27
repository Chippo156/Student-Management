import React, { useState } from 'react';
import {
  Card,
  Calendar,
  Badge,
  List,
  Typography,
  Select,
  Row,
  Col,
  Button,
  Modal,
  Descriptions,
  Tag,
  Empty,
  Timeline,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const { Title, Text } = Typography;
const { Option } = Select;

interface ScheduleItem {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  startTime: string;
  endTime: string;
  type: 'theory' | 'lab' | 'exam' | 'assignment';
  semester: string;
  date: string;
  description?: string;
}

const StudentSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSemester, setSelectedSemester] = useState('HK1-2025');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock data
  const scheduleData: ScheduleItem[] = [
    {
      id: '1',
      courseCode: 'IT101',
      courseName: 'Lập trình cơ bản',
      instructor: 'TS. Nguyễn Văn A',
      room: 'A101',
      startTime: '07:30',
      endTime: '09:30',
      type: 'theory',
      semester: 'HK1-2025',
      date: '2025-09-28',
      description: 'Bài gi强 về cú pháp cơ bản của Python',
    },
    {
      id: '2',
      courseCode: 'IT101',
      courseName: 'Lập trình cơ bản - Thực hành',
      instructor: 'ThS. Trần Thị B',
      room: 'LAB2',
      startTime: '13:30',
      endTime: '15:30',
      type: 'lab',
      semester: 'HK1-2025',
      date: '2025-09-28',
      description: 'Thực hành lập trình với Python',
    },
    {
      id: '3',
      courseCode: 'MA201',
      courseName: 'Giải tích 2',
      instructor: 'PGS. Lê Minh C',
      room: 'B203',
      startTime: '09:45',
      endTime: '11:45',
      type: 'theory',
      semester: 'HK1-2025',
      date: '2025-09-29',
      description: 'Tích phân và ứng dụng',
    },
    {
      id: '4',
      courseCode: 'IT201',
      courseName: 'Cấu trúc dữ liệu',
      instructor: 'TS. Phạm Văn D',
      room: 'A205',
      startTime: '07:30',
      endTime: '09:30',
      type: 'theory',
      semester: 'HK1-2025',
      date: '2025-09-30',
      description: 'Cây nhị phân và thuật toán duyệt cây',
    },
    {
      id: '5',
      courseCode: 'IT101',
      courseName: 'Kiểm tra giữa kỳ - Lập trình cơ bản',
      instructor: 'TS. Nguyễn Văn A',
      room: 'A101',
      startTime: '07:30',
      endTime: '09:30',
      type: 'exam',
      semester: 'HK1-2025',
      date: '2025-10-15',
      description: 'Kiểm tra giữa kỳ môn Lập trình cơ bản',
    },
    {
      id: '6',
      courseCode: 'IT201',
      courseName: 'Bài tập lớn - Cấu trúc dữ liệu',
      instructor: 'TS. Phạm Văn D',
      room: 'Online',
      startTime: '23:59',
      endTime: '23:59',
      type: 'assignment',
      semester: 'HK1-2025',
      date: '2025-10-20',
      description: 'Nộp bài tập lớn về cây AVL',
    },
  ];

  const getScheduleForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return scheduleData.filter(item => 
      item.semester === selectedSemester && item.date === dateStr
    );
  };

  const getListData = (value: Dayjs) => {
    const schedules = getScheduleForDate(value);
    return schedules.map(schedule => ({
      type: getScheduleType(schedule.type),
      content: `${schedule.startTime} - ${schedule.courseCode}`,
    }));
  };

  const getScheduleType = (type: string) => {
    switch (type) {
      case 'theory': return 'default';
      case 'lab': return 'processing';
      case 'exam': return 'error';
      case 'assignment': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory': return 'blue';
      case 'lab': return 'green';
      case 'exam': return 'red';
      case 'assignment': return 'orange';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'theory': return 'Lý thuyết';
      case 'lab': return 'Thực hành';
      case 'exam': return 'Kiểm tra';
      case 'assignment': return 'Bài tập';
      default: return type;
    }
  };

  const cellRender = (current: Dayjs) => {
    const listData = getListData(current);
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type as any} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handleViewDetail = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setIsModalVisible(true);
  };

  const todaySchedules = getScheduleForDate(selectedDate);
  const upcomingSchedules = scheduleData
    .filter(item => 
      item.semester === selectedSemester && 
      dayjs(item.date).isAfter(selectedDate, 'day')
    )
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    .slice(0, 5);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Lịch học</Title>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn học kỳ"
          value={selectedSemester}
          onChange={setSelectedSemester}
        >
          <Option value="HK1-2025">HK1/2025</Option>
          <Option value="HK2-2024">HK2/2024</Option>
          <Option value="HK1-2024">HK1/2024</Option>
        </Select>
      </div>

      <Row gutter={24}>
        {/* Calendar */}
        <Col xs={24} lg={16}>
          <Card title="Lịch học tháng">
            <Calendar
              cellRender={cellRender}
              onSelect={handleDateSelect}
            />
          </Card>
        </Col>

        {/* Side Panel */}
        <Col xs={24} lg={8}>
          {/* Today's Schedule */}
          <Card 
            title={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Lịch học hôm nay ({selectedDate.format('DD/MM/YYYY')})
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            {todaySchedules.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={todaySchedules}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => handleViewDetail(item)}
                      >
                        Chi tiết
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {item.startTime}
                          </div>
                          <div style={{ fontSize: '10px', color: '#999' }}>
                            {item.endTime}
                          </div>
                        </div>
                      }
                      title={
                        <div>
                          <Text strong>{item.courseName}</Text>
                          <Tag color={getTypeColor(item.type)} style={{ marginLeft: 8 }}>
                            {getTypeText(item.type)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div>
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            {item.room}
                          </div>
                          <div>
                            <UserOutlined style={{ marginRight: 4 }} />
                            {item.instructor}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Hôm nay không có lịch học" />
            )}
          </Card>

          {/* Upcoming Schedule */}
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Lịch học sắp tới
              </span>
            }
          >
            {upcomingSchedules.length > 0 ? (
              <Timeline
                items={upcomingSchedules.map(item => ({
                  dot: item.type === 'exam' ? 
                    <ClockCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} /> :
                    <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />,
                  children: (
                    <div key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>{dayjs(item.date).format('DD/MM/YYYY')}</Text>
                        <Tag color={getTypeColor(item.type)}>
                          {getTypeText(item.type)}
                        </Tag>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text>{item.courseName}</Text>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                        {item.startTime} - {item.room}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="Không có lịch học sắp tới" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết lịch học"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedSchedule && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>{selectedSchedule.courseName}</Title>
              <Text type="secondary">{selectedSchedule.courseCode}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={getTypeColor(selectedSchedule.type)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {getTypeText(selectedSchedule.type)}
                </Tag>
              </div>
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Ngày" span={1}>
                {dayjs(selectedSchedule.date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian" span={1}>
                {selectedSchedule.startTime} - {selectedSchedule.endTime}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng học" span={1}>
                <Text strong>{selectedSchedule.room}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giảng viên" span={1}>
                <Text strong>{selectedSchedule.instructor}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại" span={1}>
                <Tag color={getTypeColor(selectedSchedule.type)}>
                  {getTypeText(selectedSchedule.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Học kỳ" span={1}>
                {selectedSchedule.semester}
              </Descriptions.Item>
              {selectedSchedule.description && (
                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedSchedule.description}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedSchedule.type === 'exam' && (
              <div style={{ marginTop: 16, padding: 16, backgroundColor: '#fff2e8', border: '1px solid #ffbb96', borderRadius: 6 }}>
                <Text type="warning">
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Đây là buổi kiểm tra. Vui lòng chuẩn bị kỹ càng và đến đúng giờ!
                </Text>
              </div>
            )}

            {selectedSchedule.type === 'assignment' && (
              <div style={{ marginTop: 16, padding: 16, backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
                <Text type="warning">
                  <BookOutlined style={{ marginRight: 8 }} />
                  Hạn nộp bài tập. Đảm bảo hoàn thành và nộp đúng thời hạn!
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentSchedule;