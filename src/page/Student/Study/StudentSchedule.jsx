import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  Radio,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import scheduleService from '../../../service/scheduleService';

const { Title, Text } = Typography;

const periods = [
  { key: 'morning', label: 'Sáng' },
  { key: 'afternoon', label: 'Chiều' },
  { key: 'evening', label: 'Tối' },
];

const scheduleTypeMap = {
  1: 'class',
  2: 'assignment',
  3: 'exam',
};

const typeToIdMap = {
  all: 0,
  class: 1,
  assignment: 2,
  exam: 3,
};

const getEventColor = (item) => {
  switch (item.type) {
    case 'class':
      return '#e6f4ff';
    case 'assignment':
      return '#d9f7be';
    case 'exam':
      return '#fffbe6';
    default:
      return '#f0f0f0';
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'class':
      return 'Lý thuyết';
    case 'assignment':
      return 'Thực hành';
    case 'exam':
      return 'Thi';
    default:
      return '';
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'class':
      return '#1677ff';
    case 'assignment':
      return '#52c41a';
    case 'exam':
      return '#faad14';
    default:
      return '#d9d9d9';
  }
};

const getPeriodFromTime = (time) => {
  if (!time) return 'morning';
  const first = time.split('-')[0].trim();
  const hh = parseInt(first.split(':')[0], 10);
  if (isNaN(hh)) return 'morning';
  if (hh < 12) return 'morning';
  if (hh < 18) return 'afternoon';
  return 'evening';
};

const StudentSchedule = () => {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [baseDate, setBaseDate] = useState(dayjs());
  const [filterType, setFilterType] = useState('all');

  // Lấy lịch từ API
  const fetchSchedule = async (date, scheduleTypeId = 0) => {
    try {
      const data = await scheduleService.getByDate(date, scheduleTypeId);
      // Lấy ngày đầu tuần (Thứ 2) của baseDate
      const startOfWeek = baseDate.startOf('week').add(1, 'day');
      const mapped = data.map((item) => {
        let eventDate = item.date;
        if (!eventDate) {
          // Nếu date null, tính ngày dựa trên tuần đang xem
          eventDate = startOfWeek
            .add(item.dayOfWeek - 1, 'day')
            .format('YYYY-MM-DD');
        }
        return {
          id: item.scheduleId.toString(),
          title: item.courseName,
          type: scheduleTypeMap[item.scheduleTypeId] || 'other',
          date: eventDate,
          time:
            item.startTime && item.endTime
              ? `${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)}`
              : '',
          location: item.room || 'Online',
          description: item.lecturerName || '',
          status: 'upcoming',
          subject: item.courseCode || '',
        };
      });
      setScheduleItems(mapped);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const dateStr = baseDate.format('YYYY-MM-DD');
    const typeId = typeToIdMap[filterType] || 0;
    fetchSchedule(dateStr, typeId);
  }, [baseDate, filterType]);

  const weekDays = useMemo(() => {
    const start = baseDate.startOf('week');
    const days = [];
    for (let i = 1; i <= 7; i++) {
      days.push(start.add(i, 'day'));
    }
    return days;
  }, [baseDate]);

  const eventsByCell = useMemo(() => {
    const map = {};
    scheduleItems.forEach((ev) => {
      const period = getPeriodFromTime(ev.time);
      const key = `${ev.date}#${period}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [scheduleItems]);

  const startOfWeek = baseDate.startOf('week').add(1, 'day'); // Thứ 2
  const endOfWeek = startOfWeek.add(6, 'day'); // Chủ nhật

  const weekScheduleItems = scheduleItems.filter((item) =>
    dayjs(item.date).isBetween(startOfWeek, endOfWeek, 'day', '[]')
  );

  const today = dayjs();
  const todayItems = weekScheduleItems.filter((item) =>
    dayjs(item.date).isSame(today, 'day')
  );
  const completedItems = weekScheduleItems.filter(
    (item) => item.status === 'completed'
  );
  const upcomingItems = weekScheduleItems.filter(
    (item) =>
      dayjs(item.date).isAfter(today, 'day') && item.status !== 'completed'
  );

  const percentCompleted = weekScheduleItems.length
    ? Math.round((completedItems.length / weekScheduleItems.length) * 100)
    : 0;

  const percentProgress = weekScheduleItems.length
    ? Math.round(
        ((completedItems.length + todayItems.length) /
          weekScheduleItems.length) *
          100
      )
    : 0;

  const goPrevWeek = () => setBaseDate(baseDate.subtract(1, 'week'));
  const goNextWeek = () => setBaseDate(baseDate.add(1, 'week'));
  const handleFilterChange = (type) => setFilterType(type);
  const handleToday = () => setBaseDate(dayjs());
  const handlePrint = () => window.print();

  // Chỉ in bảng khi xuất PDF
  useEffect(() => {
    const handleBeforePrint = () => {
      const filterBar = document.getElementById('student-schedule-filter-bar');
      const statsBar = document.getElementById('student-schedule-stats-bar');
      if (filterBar) filterBar.style.display = 'none';
      if (statsBar) statsBar.style.display = 'none';
    };
    const handleAfterPrint = () => {
      const filterBar = document.getElementById('student-schedule-filter-bar');
      const statsBar = document.getElementById('student-schedule-stats-bar');
      if (filterBar) filterBar.style.display = '';
      if (statsBar) statsBar.style.display = '';
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <div
      style={{
        padding: 24,
        width: '100%',
        minHeight: '100vh',
        background: '#fff',
      }}
    >
      <div>
        <Title level={2}>Lịch học, lịch thi theo tuần</Title>
      </div>
      {/* Statistics */}
      <Row
        id="student-schedule-stats-bar"
        gutter={16}
        style={{ marginBottom: 8 }}
      >
        <Col span={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={todayItems.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={upcomingItems.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={completedItems.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến độ tuần"
              value={percentProgress}
              suffix="%"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Bar */}
      <div
        id="student-schedule-filter-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 20px',
          background: '#f6faff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          marginBottom: 16,
          flexWrap: 'wrap',
          minHeight: 56,
        }}
      >
        {/* Filter Options (Radio Style) */}
        <Radio.Group
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value)}
          style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            padding: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            height: 36,
          }}
          size="middle"
        >
          <Radio.Button
            value="all"
            style={{
              borderRadius: '16px 0 0 16px',
              fontWeight: 500,
              minWidth: 80,
              textAlign: 'center',
            }}
          >
            Tất cả
          </Radio.Button>
          <Radio.Button
            value="class"
            style={{ fontWeight: 500, minWidth: 90, textAlign: 'center' }}
          >
            Lý thuyết
          </Radio.Button>
          <Radio.Button
            value="assignment"
            style={{ fontWeight: 500, minWidth: 100, textAlign: 'center' }}
          >
            Thực hành
          </Radio.Button>
          <Radio.Button
            value="exam"
            style={{
              borderRadius: '0 16px 16px 0',
              fontWeight: 500,
              minWidth: 70,
              textAlign: 'center',
            }}
          >
            Thi
          </Radio.Button>
        </Radio.Group>

        {/* Date Picker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: 16,
            gap: 6,
          }}
        >
          <span
            style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              height: 36,
            }}
          >
            <CalendarOutlined
              style={{ color: '#1677ff', marginRight: 6, fontSize: 16 }}
            />
            <DatePicker
              value={baseDate}
              onChange={(d) => d && setBaseDate(dayjs(d))}
              format="DD/MM/YYYY"
              size="middle"
              style={{
                border: 'none',
                boxShadow: 'none',
                background: 'transparent',
                minWidth: 110,
                height: 28,
              }}
              allowClear={false}
              suffixIcon={null}
              inputReadOnly
            />
          </span>
        </div>

        {/* Action Buttons */}
        <Space size={8} style={{ marginLeft: 'auto', flexWrap: 'wrap' }}>
          <Button
            onClick={handleToday}
            size="middle"
            style={{ borderRadius: 8 }}
          >
            Hiện tại
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            size="middle"
            style={{ borderRadius: 8 }}
          >
            In lịch
          </Button>
          <Button
            icon={<LeftOutlined />}
            onClick={goPrevWeek}
            size="middle"
            style={{ borderRadius: 8 }}
          >
            Trở về
          </Button>
          <Button
            icon={<RightOutlined />}
            onClick={goNextWeek}
            size="middle"
            style={{ borderRadius: 8 }}
          >
            Tiếp
          </Button>
        </Space>
      </div>

      {/* Weekly calendar table only */}
      <Card bodyStyle={{ padding: 0, background: '#fff' }}>
        <div
          style={{
            overflowX: 'auto',
            background: '#fff',
            border: '1px solid #e4e4e4',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(7, minmax(140px, 1fr))',
              borderTop: '1px solid #e4e4e4',
              borderLeft: '1px solid #e4e4e4',
              background:
                'repeating-linear-gradient(0deg, #f8fafd 0px, #f8fafd 29px, #f0f0f0 30px), repeating-linear-gradient(90deg, #f8fafd 0px, #f8fafd 29px, #f0f0f0 30px)',
            }}
          >
            {/* header */}
            <div
              style={{
                borderRight: '1px solid #e4e4e4',
                borderBottom: '1px solid #e4e4e4',
                background: '#ffffe0',
                padding: 12,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Ca học
            </div>
            {weekDays.map((d) => (
              <div
                key={d.format('YYYY-MM-DD')}
                style={{
                  borderRight: '1px solid #e4e4e4',
                  borderBottom: '1px solid #e4e4e4',
                  background: '#ffffe0',
                  padding: 12,
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#1677ff',
                }}
              >
                {d.day() === 0 ? 'Chủ nhật' : `Thứ ${d.day() + 1}`}
                <div style={{ fontWeight: 400, fontSize: 12 }}>
                  {d.format('DD/MM/YYYY')}
                </div>
              </div>
            ))}

            {/* rows for periods */}
            {periods.map((p) => (
              <React.Fragment key={p.key}>
                <div
                  style={{
                    borderRight: '1px solid #e4e4e4',
                    borderBottom: '1px solid #e4e4e4',
                    background: '#ffffe0',
                    padding: 12,
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {p.label}
                </div>
                {weekDays.map((d) => {
                  const key = `${d.format('YYYY-MM-DD')}#${p.key}`;
                  const cellEvents = eventsByCell[key] || [];
                  return (
                    <div
                      key={key}
                      style={{
                        minHeight: 80,
                        borderRight: '1px solid #e4e4e4',
                        borderBottom: '1px solid #e4e4e4',
                        padding: 6,
                        background: '#fff',
                        position: 'relative',
                      }}
                    >
                      {cellEvents.map((ev) => (
                        <div
                          key={ev.id}
                          style={{
                            background: getEventColor(ev),
                            borderLeft: `5px solid ${getTypeColor(ev.type)}`,
                            borderRadius: 6,
                            marginBottom: 8,
                            padding: 8,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            fontSize: 13,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: '#222',
                              marginBottom: 2,
                            }}
                          >
                            {ev.title}
                          </div>
                          <div style={{ fontSize: 12, color: '#555' }}>
                            <b>Mã lớp:</b> {ev.subject}
                          </div>
                          <div style={{ fontSize: 12, color: '#555' }}>
                            <b>Phòng:</b> {ev.location}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            <b>Thời gian:</b> {ev.time}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            <b>GV:</b> {ev.description}
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: '#fff',
                              background: getTypeColor(ev.type),
                              display: 'inline-block',
                              borderRadius: 4,
                              padding: '1px 8px',
                            }}
                          >
                            {getTypeLabel(ev.type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div style={{ marginTop: 12, paddingLeft: 8 }}>
          <Space>
            <span
              style={{
                display: 'inline-block',
                width: 18,
                height: 12,
                background: '#e6f4ff',
                border: '1px solid #1677ff',
              }}
            />
            <Text>Lịch học lý thuyết</Text>
            <span
              style={{
                display: 'inline-block',
                width: 18,
                height: 12,
                background: '#d9f7be',
                border: '1px solid #52c41a',
              }}
            />
            <Text>Lịch học thực hành</Text>
            <span
              style={{
                display: 'inline-block',
                width: 18,
                height: 12,
                background: '#fffbe6',
                border: '1px solid #faad14',
              }}
            />
            <Text>Lịch thi</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default StudentSchedule;
