import React, { useState, useEffect, useMemo } from 'react';
import { Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

import scheduleService from '../../../service/scheduleService';
import {
  periods,
  scheduleTypeMap,
  typeToIdMap,
} from '../../../component/Student/Study/StudentSchedule/constants';
import { getPeriodFromTime } from '../../../component/Student/Study/StudentSchedule/utils';
import ScheduleStatistics from '../../../component/Student/Study/StudentSchedule/ScheduleStatistics';
import ScheduleFilterBar from '../../../component/Student/Study/StudentSchedule/ScheduleFilterBar';
import ScheduleTable from '../../../component/Student/Study/StudentSchedule/ScheduleTable';
import ScheduleLegend from '../../../component/Student/Study/StudentSchedule/ScheduleLegend';

const { Title, Text } = Typography;

const StudentSchedule = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [scheduleItems, setScheduleItems] = useState([]);
  const [baseDate, setBaseDate] = useState(dayjs());
  const [filterType, setFilterType] = useState('all');

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

  const goPrevWeek = () => setBaseDate(baseDate.subtract(1, 'week'));
  const goNextWeek = () => setBaseDate(baseDate.add(1, 'week'));
  const handleFilterChange = (type) => setFilterType(type);
  const handleToday = () => setBaseDate(dayjs());
  const handlePrint = () => window.print();

  const dataSource = periods.map((p) => {
    const row = { key: p.key, period: p.label };
    weekDays.forEach((d) => {
      const dateKey = d.format('YYYY-MM-DD');
      const cellKey = `${dateKey}#${p.key}`;
      row[dateKey] = eventsByCell[cellKey] || [];
    });
    return row;
  });

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
          <Title
            level={2}
            style={{ margin: 0, color: theme.palette.text.primary }}
          >
            <CalendarOutlined
              style={{ marginRight: 8, color: theme.palette.primary.main }}
            />
            Lịch học, lịch thi theo tuần
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tuần ngày {startOfWeek.format('DD/MM')} -{' '}
            {endOfWeek.format('DD/MM/YYYY')}
          </Text>
        </div>
      </div>

      <ScheduleStatistics
        todayItems={todayItems}
        upcomingItems={upcomingItems}
        completedItems={completedItems}
        percentProgress={percentProgress}
        theme={theme}
      />

      <ScheduleFilterBar
        filterType={filterType}
        handleFilterChange={handleFilterChange}
        baseDate={baseDate}
        setBaseDate={setBaseDate}
        handleToday={handleToday}
        handlePrint={handlePrint}
        goPrevWeek={goPrevWeek}
        goNextWeek={goNextWeek}
        theme={theme}
      />

      <ScheduleTable
        dataSource={dataSource}
        weekDays={weekDays}
        today={today}
        theme={theme}
        isDark={isDark}
        startOfWeek={startOfWeek}
        endOfWeek={endOfWeek}
      />

      <ScheduleLegend theme={theme} />
    </div>
  );
};

export default StudentSchedule;
