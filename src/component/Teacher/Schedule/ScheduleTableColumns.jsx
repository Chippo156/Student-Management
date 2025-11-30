import React from 'react';
import { Badge, Tag } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { alpha } from '@mui/material/styles';
import { periods } from './constants';
import {
  getEventColor,
  getEventBorderColor,
  getTypeColor,
  getTypeLabel,
} from './utils';

export const getScheduleColumns = (weekDays, today, theme, isDark) => {
  // Check if mobile to disable fixed column
  const isMobile = window.innerWidth < 768;

  return [
  {
    title: 'Ca học',
    dataIndex: 'period',
    key: 'period',
    width: 100,
    fixed: isMobile ? false : 'left',
    align: 'center',
    render: (text) => (
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: theme.palette.text.primary,
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.palette.text.secondary,
            marginTop: 4,
          }}
        >
          {periods.find((p) => p.label === text)?.time}
        </div>
      </div>
    ),
    onCell: () => ({
      style: {
        background: isDark
          ? alpha(theme.palette.warning.main, 0.15)
          : `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`,
        borderRight: `2px solid ${theme.palette.warning.main}`,
      },
    }),
  },
  ...weekDays.map((d) => ({
    title: (
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <div
          style={{
            fontWeight: 600,
            color: d.isSame(today, 'day')
              ? theme.palette.primary.main
              : theme.palette.text.primary,
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
              background: getEventColor(ev, theme, alpha),
              border: `1px solid ${getEventBorderColor(ev, theme)}`,
              borderLeft: `4px solid ${getEventBorderColor(ev, theme)}`,
              borderRadius: 8,
              marginBottom: 8,
              padding: 10,
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.06)',
              fontSize: 13,
              transition: 'all 0.3s',
              cursor: 'pointer',
              maxWidth: 150,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 4px 12px rgba(0,0,0,0.5)'
                : '0 4px 12px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.06)';
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
              <HomeOutlined style={{ fontSize: 10 }} />
              {ev.location}
            </div>
            {ev.sectionCode && (
              <div
                style={{
                  fontSize: 11,
                  color: theme.palette.text.secondary,
                  marginBottom: 6,
                }}
              >
                Lớp: {ev.sectionCode}
              </div>
            )}
            <Tag
              color={getTypeColor(ev.type, theme)}
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
          ? isDark
            ? alpha(theme.palette.primary.main, 0.25)
            : 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)'
          : isDark
            ? theme.palette.background.paper
            : 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
        borderBottom: d.isSame(today, 'day')
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
      },
    }),
    onCell: () => ({
      style: {
        background: theme.palette.background.paper,
        borderColor: theme.palette.divider,
      },
    }),
  })),
];
};
