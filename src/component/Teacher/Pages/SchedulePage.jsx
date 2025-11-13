import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { Schedule, CalendarToday, AccessTime } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
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

  const colors = useMemo(() => ({
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    bgLightBlue: alpha(theme.palette.primary.main, 0.1),
    bgLightPurple: alpha(theme.palette.secondary.main, 0.1),
    bgLightGreen: alpha(theme.palette.success.main, 0.1),
    iconBlue: theme.palette.primary.main,
    iconPurple: theme.palette.secondary.main,
    iconGreen: theme.palette.success.main,
  }), [theme]);

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
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>
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
              bgcolor: colors.bgLightBlue,
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <Schedule sx={{ fontSize: 50, mr: 2, color: colors.iconBlue }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: colors.iconBlue }}>
                  {totalLessons}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Tổng tiết tuần này
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: colors.bgLightPurple,
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <CalendarToday sx={{ fontSize: 50, mr: 2, color: colors.iconPurple }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: colors.iconPurple }}>
                  {uniqueCourses}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Môn học
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: colors.bgLightGreen,
              boxShadow: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
              <AccessTime sx={{ fontSize: 50, mr: 2, color: colors.iconGreen }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: colors.iconGreen }}>
                  {todayItems.length}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
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
