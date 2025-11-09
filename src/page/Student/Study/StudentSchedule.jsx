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
  Table,
  Progress,
  Badge,
  Tag,
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined,
  PrinterOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useTheme, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import scheduleService from '../../../service/scheduleService';

const { Title, Text } = Typography;

const periods = [
  { key: 'morning', label: 'Sáng', time: '7:00 - 11:30' },
  { key: 'afternoon', label: 'Chiều', time: '13:00 - 17:30' },
  { key: 'evening', label: 'Tối', time: '18:00 - 21:00' },
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
  const theme = useTheme();
  const [scheduleItems, setScheduleItems] = useState([]);
  const [baseDate, setBaseDate] = useState(dayjs());
  const [filterType, setFilterType] = useState('all');

  const getEventColor = (item) => {
    switch (item.type) {
      case 'class':
        return alpha(theme.palette.primary.main, 0.08);
      case 'assignment':
        return alpha(theme.palette.success.main, 0.08);
      case 'exam':
        return alpha(theme.palette.warning.main, 0.08);
      default:
        return theme.palette.background.default;
    }
  };

  const getEventBorderColor = (item) => {
    switch (item.type) {
      case 'class':
        return theme.palette.primary.main;
      case 'assignment':
        return theme.palette.success.main;
      case 'exam':
        return theme.palette.warning.main;
      default:
        return theme.palette.divider;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'class':
        return theme.palette.primary.main;
      case 'assignment':
        return theme.palette.success.main;
      case 'exam':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.disabled;
    }
  };

  const fetchSchedule = async (date, scheduleTypeId = 0) => {
    try {
      const data = await scheduleService.getByDate(date, scheduleTypeId);
      const startOfWeek = baseDate.startOf('week').add(1, 'day');
      const mapped = data.map((item) => {
        let eventDate = item.date;
        if (!eventDate) {
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

  const startOfWeek = baseDate.startOf('week').add(1, 'day');
  const endOfWeek = startOfWeek.add(6, 'day');

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

  const percentProgress = weekScheduleItems.length
    ? Math.round(
        ((completedItems.length + todayItems.length) /
          weekScheduleItems.length) *
          100
      )
    : 0;

  // Mock data cho các thống kê bổ sung
  const weekStats = {
    totalClasses: weekScheduleItems.filter((i) => i.type === 'class').length,
    totalAssignments: weekScheduleItems.filter((i) => i.type === 'assignment')
      .length,
    totalExams: weekScheduleItems.filter((i) => i.type === 'exam').length,
    attendanceRate: 95,
    studyHours: 18,
  };

  const goPrevWeek = () => setBaseDate(baseDate.subtract(1, 'week'));
  const goNextWeek = () => setBaseDate(baseDate.add(1, 'week'));
  const handleFilterChange = (type) => setFilterType(type);
  const handleToday = () => setBaseDate(dayjs());
  const handlePrint = () => window.print();

  const columns = [
    {
      title: 'Ca học',
      dataIndex: 'period',
      key: 'period',
      width: 100,
      fixed: 'left',
      align: 'center',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{text}</div>
          <div style={{ fontSize: 11, color: theme.palette.text.secondary, marginTop: 4 }}>
            {periods.find((p) => p.label === text)?.time}
          </div>
        </div>
      ),
      onCell: () => ({
        style: {
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`,
          borderRight: `2px solid ${theme.palette.warning.main}`,
        },
      }),
    },
    ...weekDays.map((d) => ({
      title: (
        <div
          style={{
            textAlign: 'center',
            padding: '4px 0',
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: d.isSame(today, 'day') ? theme.palette.primary.main : theme.palette.text.primary,
              fontSize: 13,
            }}
          >
            {d.day() === 0 ? 'Chủ nhật' : `Thứ ${d.day() + 1}`}
          </div>
          <div
            className="table-date"
            style={{
              fontWeight: 400,
              fontSize: 11,
              color: theme.palette.text.secondary,
              marginTop: 2,
            }}
          >
            {d.format('DD/MM/YYYY')}
          </div>
          {d.isSame(today, 'day') && (
            <Badge
              count="Hôm nay"
              style={{
                backgroundColor: theme.palette.primary.main,
                fontSize: 10,
                height: 18,
                lineHeight: '18px',
                marginTop: 4,
              }}
            />
          )}
        </div>
      ),
      dataIndex: d.format('YYYY-MM-DD'),
      key: d.format('YYYY-MM-DD'),
      width: 150,
      render: (events) => (
        <div style={{ minHeight: 100 }}>
          {events?.map((ev) => (
            <div
              key={ev.id}
              style={{
                background: getEventColor(ev),
                border: `1px solid ${getEventBorderColor(ev)}`,
                borderLeft: `4px solid ${getEventBorderColor(ev)}`,
                borderRadius: 8,
                marginBottom: 8,
                padding: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                fontSize: 13,
                transition: 'all 0.3s',
                cursor: 'pointer',
                maxWidth: 150,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                {ev.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.palette.text.secondary,
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <BookOutlined style={{ fontSize: 10 }} />
                {ev.subject}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.palette.text.secondary,
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 10 }} />
                {ev.time}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.palette.text.secondary,
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CalendarOutlined style={{ fontSize: 10 }} />
                {ev.location}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.palette.text.secondary,
                  marginBottom: 6,
                }}
              >
                GV: {ev.description}
              </div>
              <Tag
                color={getTypeColor(ev.type)}
                style={{
                  fontSize: 10,
                  padding: '0 6px',
                  borderRadius: 4,
                  fontWeight: 500,
                }}
              >
                {getTypeLabel(ev.type)}
              </Tag>
            </div>
          ))}
        </div>
      ),
      onHeaderCell: () => ({
        style: {
          background: d.isSame(today, 'day')
            ? 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)'
            : 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
          borderBottom: d.isSame(today, 'day')
            ? '2px solid #1890ff'
            : '1px solid #f0f0f0',
        },
      }),
    })),
  ];

  const dataSource = periods.map((p) => {
    const row = {
      key: p.key,
      period: p.label,
    };
    weekDays.forEach((d) => {
      const dateKey = d.format('YYYY-MM-DD');
      const cellKey = `${dateKey}#${p.key}`;
      row[dateKey] = eventsByCell[cellKey] || [];
    });
    return row;
  });

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A3 landscape;
          margin: 5mm;
        }
        
        html, body {
          height: 100%;
          overflow: hidden;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body * {
          visibility: hidden !important;
        }
        
        .printable-schedule,
        .printable-schedule * {
          visibility: visible !important;
        }
        
        .printable-schedule {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
          page-break-inside: avoid !important;
        }
        
        .printable-schedule .ant-table-wrapper {
          width: 100% !important;
          page-break-inside: avoid !important;
        }
        .table-date{
        
        }
        .printable-schedule .ant-table {
          width: 100% !important;
          font-size: 15pt !important;
          page-break-inside: avoid !important;
        }
        
        .printable-schedule .ant-table-container {
          width: 100% !important;
          page-break-inside: avoid !important;
        }
        
        .printable-schedule .ant-table-content {
          width: 100% !important;
          overflow: visible !important;
        }
        
        .printable-schedule table {
          width: 100% !important;
          table-layout: fixed !important;
          page-break-inside: avoid !important;
        }
        
        .printable-schedule .ant-table-thead > tr > th {
          background: #ffffe0 !important;
          font-size: 16pt !important;
          padding: 6px !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }
        
        .printable-schedule .ant-table-thead > tr > th:first-child {
          width: 60px !important;
          max-width: 60px !important;
        }
        
        .printable-schedule .ant-table-thead > tr > th:not(:first-child) {
          width: auto !important;
        }
        
        .printable-schedule .ant-table-tbody > tr {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td {
          font-size: 15pt !important;
          padding: 6px !important;
          vertical-align: top !important;
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td:first-child {
          width: 60px !important;
          max-width: 60px !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td:not(:first-child) {
          width: auto !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td > div {
          min-height: auto !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td > div > div {
          font-size: 15pt !important;
          padding: 6px !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td > div > div > div {
          font-size: 15pt !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }
        
        .printable-schedule .ant-table-cell-fix-left {
          position: relative !important;
        }
        
        #student-schedule-stats-bar,
        #student-schedule-filter-bar,
        .schedule-legend,
        h2 {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      style={{
        padding: 24,
        width: '100%',
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, color: theme.palette.text.primary }}>
            <CalendarOutlined style={{ marginRight: 8, color: theme.palette.primary.main }} />
            Lịch học, lịch thi theo tuần
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tuần ngày {startOfWeek.format('DD/MM')} -{' '}
            {endOfWeek.format('DD/MM/YYYY')}
          </Text>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row
        id="student-schedule-stats-bar"
        gutter={[16, 16]}
        style={{ marginBottom: 20 }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: theme.palette.primary.main,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff', fontSize: 12 }}>Hôm nay</span>
              }
              value={todayItems.length}
              prefix={
                <CalendarOutlined style={{ color: '#fff', fontSize: 18 }} />
              }
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
              suffix={<span style={{ color: '#fff', fontSize: 13 }}>lịch</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: theme.palette.success.main,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff', fontSize: 12 }}>Sắp tới</span>
              }
              value={upcomingItems.length}
              prefix={
                <ClockCircleOutlined style={{ color: '#fff', fontSize: 18 }} />
              }
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
              suffix={<span style={{ color: '#fff', fontSize: 13 }}>lịch</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: theme.palette.secondary.main,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff', fontSize: 12 }}>
                  Đã hoàn thành
                </span>
              }
              value={completedItems.length}
              prefix={
                <CheckCircleOutlined style={{ color: '#fff', fontSize: 18 }} />
              }
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
              suffix={<span style={{ color: '#fff', fontSize: 13 }}>lịch</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: theme.palette.warning.main,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff', fontSize: 12 }}>
                  Tiến độ tuần
                </span>
              }
              value={percentProgress}
              prefix={<FireOutlined style={{ color: '#fff', fontSize: 18 }} />}
              suffix={<span style={{ color: '#fff', fontSize: 13 }}>%</span>}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            />
            <Progress
              percent={percentProgress}
              strokeColor="#fff"
              trailColor="rgba(255,255,255,0.3)"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        id="student-schedule-filter-bar"
        bordered={false}
        style={{
          marginBottom: 20,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Radio.Group
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="all">
              <CalendarOutlined /> Tất cả
            </Radio.Button>
            <Radio.Button value="class">
              <BookOutlined /> Lý thuyết
            </Radio.Button>
            <Radio.Button value="assignment">
              <FileTextOutlined /> Thực hành
            </Radio.Button>
            <Radio.Button value="exam">
              <TrophyOutlined /> Thi
            </Radio.Button>
          </Radio.Group>

          <DatePicker
            value={baseDate}
            onChange={(d) => d && setBaseDate(dayjs(d))}
            format="DD/MM/YYYY"
            style={{ minWidth: 140 }}
            allowClear={false}
          />

          <Space size={8} style={{ marginLeft: 'auto', flexWrap: 'wrap' }}>
            <Button onClick={handleToday} type="default">
              <CalendarOutlined /> Hiện tại
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              type="primary"
            >
              In lịch
            </Button>
            <Button icon={<LeftOutlined />} onClick={goPrevWeek} />
            <Button icon={<RightOutlined />} onClick={goNextWeek} />
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div className="printable-schedule">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered
            scroll={{ x: 'max-content' }}
            size="middle"
            style={{ maxWidth: 1200 }}
          />
        </div>
      </Card>

      {/* Legend */}
      <Card
        className="schedule-legend"
        bordered={false}
        style={{
          marginTop: 16,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Space size={20} wrap>
          <Space size={8}>
            <div
              style={{
                width: 20,
                height: 14,
                background: alpha(theme.palette.primary.main, 0.1),
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: 3,
              }}
            />
            <Text style={{ fontSize: 13, color: theme.palette.text.primary }}>Lý thuyết</Text>
          </Space>
          <Space size={8}>
            <div
              style={{
                width: 20,
                height: 14,
                background: alpha(theme.palette.success.main, 0.1),
                border: `2px solid ${theme.palette.success.main}`,
                borderRadius: 3,
              }}
            />
            <Text style={{ fontSize: 13, color: theme.palette.text.primary }}>Thực hành</Text>
          </Space>
          <Space size={8}>
            <div
              style={{
                width: 20,
                height: 14,
                background: alpha(theme.palette.warning.main, 0.1),
                border: `2px solid ${theme.palette.warning.main}`,
                borderRadius: 3,
              }}
            />
            <Text style={{ fontSize: 13, color: theme.palette.text.primary }}>Lịch thi</Text>
          </Space>
        </Space>
      </Card>

      {/* Additional Widgets */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {/* Upcoming Assignments */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title={
              <Space>
                <FileTextOutlined style={{ color: theme.palette.primary.main }} />
                <Text strong style={{ color: theme.palette.text.primary }}>Bài tập sắp đến hạn</Text>
              </Space>
            }
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{
                padding: 12,
                background: alpha(theme.palette.error.main, 0.1),
                borderLeft: `4px solid ${theme.palette.error.main}`,
                borderRadius: 4,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ color: theme.palette.text.primary }}>Bài tập lớn - Lập trình Web</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> Hạn nộp: {dayjs().add(2, 'day').format('DD/MM/YYYY')}
                    </Text>
                  </div>
                  <Tag color="error">Còn 2 ngày</Tag>
                </div>
              </div>
              <div style={{
                padding: 12,
                background: alpha(theme.palette.warning.main, 0.1),
                borderLeft: `4px solid ${theme.palette.warning.main}`,
                borderRadius: 4,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ color: theme.palette.text.primary }}>Thuyết trình nhóm - Quản lý dự án</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> Hạn nộp: {dayjs().add(5, 'day').format('DD/MM/YYYY')}
                    </Text>
                  </div>
                  <Tag color="warning">Còn 5 ngày</Tag>
                </div>
              </div>
              <div style={{
                padding: 12,
                background: alpha(theme.palette.success.main, 0.1),
                borderLeft: `4px solid ${theme.palette.success.main}`,
                borderRadius: 4,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ color: theme.palette.text.primary }}>Báo cáo thực hành - Cơ sở dữ liệu</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> Hạn nộp: {dayjs().add(7, 'day').format('DD/MM/YYYY')}
                    </Text>
                  </div>
                  <Tag color="success">Còn 1 tuần</Tag>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Study Statistics */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title={
              <Space>
                <TrophyOutlined style={{ color: theme.palette.primary.main }} />
                <Text strong style={{ color: theme.palette.text.primary }}>Thống kê học tập tuần này</Text>
              </Space>
            }
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: theme.palette.text.secondary }}>Số tiết đã học</Text>
                  <Text strong style={{ color: theme.palette.text.primary }}>12/18 tiết</Text>
                </div>
                <Progress
                  percent={67}
                  strokeColor={{
                    '0%': theme.palette.primary.main,
                    '100%': theme.palette.secondary.main,
                  }}
                  showInfo={false}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: theme.palette.text.secondary }}>Bài tập đã hoàn thành</Text>
                  <Text strong style={{ color: theme.palette.text.primary }}>5/8 bài</Text>
                </div>
                <Progress
                  percent={63}
                  strokeColor={theme.palette.success.main}
                  showInfo={false}
                />
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ fontSize: 12, color: theme.palette.text.secondary }}>Tổng giờ học</span>}
                    value={18}
                    suffix="giờ"
                    valueStyle={{ fontSize: 20, color: theme.palette.primary.main }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ fontSize: 12, color: theme.palette.text.secondary }}>Điểm danh</span>}
                    value={95}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ fontSize: 20, color: theme.palette.success.main }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ fontSize: 12, color: theme.palette.text.secondary }}>Streak</span>}
                    value={7}
                    suffix="ngày"
                    prefix={<FireOutlined />}
                    valueStyle={{ fontSize: 20, color: theme.palette.warning.main }}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card
        bordered={false}
        title={
          <Space>
            <BookOutlined style={{ color: theme.palette.primary.main }} />
            <Text strong style={{ color: theme.palette.text.primary }}>Hành động nhanh</Text>
          </Space>
        }
        style={{
          marginTop: 16,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Space wrap>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            style={{ borderRadius: 6 }}
          >
            Đăng ký học phần
          </Button>
          <Button
            icon={<FileTextOutlined />}
            style={{ borderRadius: 6 }}
          >
            Xem bài tập
          </Button>
          <Button
            icon={<TrophyOutlined />}
            style={{ borderRadius: 6 }}
          >
            Xem điểm số
          </Button>
          <Button
            icon={<BookOutlined />}
            style={{ borderRadius: 6 }}
          >
            Tài liệu học tập
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default StudentSchedule;
