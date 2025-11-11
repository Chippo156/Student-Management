import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { Schedule, CalendarToday, AccessTime } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

import scheduleService from '../../../service/scheduleService';
import {
  periods,
  scheduleTypeMap,
  typeToIdMap,
} from '../../Teacher/Schedule/constants';
import { getPeriodFromTime } from '../../Teacher/Schedule/utils';
import ScheduleTable from '../../Teacher/Schedule/ScheduleTable';
import ScheduleFilterBar from '../../Teacher/Schedule/ScheduleFilterBar';

const SchedulePage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [scheduleItems, setScheduleItems] = useState([]);
  const [baseDate, setBaseDate] = useState(dayjs());
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user.account);
  const lecturerId = user?.lecturerId;

  const fetchSchedule = async (date, scheduleTypeId = 0) => {
    if (!lecturerId) return;

    setLoading(true);
    try {
      const data = await scheduleService.getSchedulesOfLecturer(date, scheduleTypeId);
      const startOfWeek = baseDate.startOf('week').add(1, 'day');
      const mapped = data.map((item) => {
        let eventDate = item.date;
        if (!eventDate) {
          eventDate = startOfWeek
            .add(item.dayOfWeek - 1, 'day')
            .format('YYYY-MM-DD');
        }
        return {
          id: item.scheduleId?.toString() || Math.random().toString(),
          title: item.courseName,
          type: scheduleTypeMap[item.scheduleTypeId] || 'other',
          date: eventDate,
          time:
            item.startTime && item.endTime
              ? `${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)}`
              : '',
          location: item.room || 'Online',
          status: 'upcoming',
          subject: item.courseCode || '',
          sectionCode: item.sectionCode || '',
        };
      });
      setScheduleItems(mapped);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setScheduleItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const dateStr = baseDate.format('YYYY-MM-DD');
    const typeId = typeToIdMap[filterType] || 0;
    fetchSchedule(dateStr, typeId);
  }, [baseDate, filterType, lecturerId]);

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
  const upcomingItems = weekScheduleItems.filter(
    (item) => dayjs(item.date).isAfter(today, 'day')
  );

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

  // Calculate statistics
  const totalLessons = weekScheduleItems.length;
  const uniqueCourses = new Set(scheduleItems.map((s) => s.subject)).size;

  if (loading && scheduleItems.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
            Lịch giảng dạy theo tuần
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tuần ngày {startOfWeek.format('DD/MM')} - {endOfWeek.format('DD/MM/YYYY')}
          </Typography>
        </div>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: '#e3f2fd',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Schedule sx={{ fontSize: 50, mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1976d2' }}>
                  {totalLessons}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Tổng tiết tuần này
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: '#f3e5f5',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <CalendarToday sx={{ fontSize: 50, mr: 2, color: '#7b1fa2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#7b1fa2' }}>
                  {uniqueCourses}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Môn học
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: '#e8f5e9',
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <AccessTime sx={{ fontSize: 50, mr: 2, color: '#388e3c' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#388e3c' }}>
                  {todayItems.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Lịch hôm nay
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <ScheduleFilterBar
        filterType={filterType}
        handleFilterChange={handleFilterChange}
        baseDate={baseDate}
        handleToday={handleToday}
        handlePrint={handlePrint}
        goPrevWeek={goPrevWeek}
        goNextWeek={goNextWeek}
        theme={theme}
      />

      {/* Schedule Table */}
      <ScheduleTable
        dataSource={dataSource}
        weekDays={weekDays}
        today={today}
        theme={theme}
        isDark={isDark}
        startOfWeek={startOfWeek}
        endOfWeek={endOfWeek}
      />
    </Box>
  );
};

export default SchedulePage;
