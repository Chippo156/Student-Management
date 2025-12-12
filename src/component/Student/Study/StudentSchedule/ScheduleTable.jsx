import React, { useEffect } from 'react';
import { Card, Table } from 'antd';
import { getScheduleColumns } from './ScheduleTableColumns';

const ScheduleTable = ({
  dataSource,
  weekDays,
  today,
  theme,
  isDark,
  startOfWeek,
  endOfWeek,
}) => {
  const columns = getScheduleColumns(weekDays, today, theme, isDark);
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Responsive table scrolling */
      .schedule-table .ant-table {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .schedule-table .ant-table-cell-fix-left {
        z-index: 100 !important;
        background: ${theme.palette.background.paper} !important;
        position: sticky !important;
        left: 0 !important;
      }

      .schedule-table .ant-table-thead .ant-table-cell-fix-left {
        z-index: 101 !important;
        background: ${
          theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : theme.palette.background.secondary
        } !important;
        position: sticky !important;
        left: 0 !important;
      }

      .schedule-table .ant-table-tbody .ant-table-cell-fix-left {
        z-index: 100 !important;
        background: ${theme.palette.background.paper} !important;
        position: sticky !important;
        left: 0 !important;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .schedule-table .ant-table {
          font-size: 12px;
        }

        .schedule-table .ant-table-cell {
          padding: 8px 4px !important;
        }
      }

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
        
        .print-header {
          display: block !important;
        }
        
        .printable-schedule .ant-table-wrapper {
          width: 100% !important;
          page-break-inside: avoid !important;
        }
        
        .table-date {
          font-size: 10pt !important;
        }
        
        .printable-schedule .ant-table {
          width: 100% !important;
          font-size: 10pt !important;
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
          table-layout: auto !important;
          page-break-inside: avoid !important;
        }
        
        .printable-schedule .ant-table-thead > tr > th {
          background: #fff9e6 !important;
          font-size: 10pt !important;
          padding: 6px 4px !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }
        
        .printable-schedule .ant-table-thead > tr > th:first-child {
          width: 50px !important;
          min-width: 50px !important;
        }
        
        .printable-schedule .ant-table-tbody > tr {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td {
          font-size: 9pt !important;
          padding: 4px !important;
          vertical-align: top !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }
        
        .printable-schedule .ant-table-tbody > tr > td:first-child {
          width: 50px !important;
          min-width: 50px !important;

        }
        .printable-schedule .ant-table-tbody > tr > td > div > div {
          font-size: 8pt !important;
          padding: 4px !important;
          margin-bottom: 4px !important;
          line-height: 1.3 !important;
        }
        
        .ant-badge {
          display: none !important;
        }
        
        #student-schedule-stats-bar,
        #student-schedule-filter-bar,
        #week-summary-section,
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
    <Card
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        background: theme.palette.background.paper,
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: 0, overflow: 'auto' }}
    >
      <style>
        {`
          .schedule-table .ant-table {
            background: ${theme.palette.background.paper} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .schedule-table .ant-table-thead > tr > th {
            background: ${
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : theme.palette.background.secondary
            } !important;
            color: ${theme.palette.text.primary} !important;
            border-color: ${theme.palette.divider} !important;
            font-weight: 600;
          }
          .schedule-table .ant-table-tbody > tr > td {
            border-color: ${theme.palette.divider} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .schedule-table .ant-table-row:hover > td:not(.ant-table-cell-fix-left) {
            background: ${theme.palette.action.hover} !important;
          }
          .schedule-table .ant-table-row:hover > td.ant-table-cell-fix-left {
            background: ${
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : theme.palette.background.secondary
            } !important;
          }
        `}
      </style>
      <div className="printable-schedule">
        <div style={{ display: 'none' }} className="print-header">
          <h1
            style={{
              textAlign: 'center',
              marginBottom: 10,
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.palette.mode !== 'dark' ? 'black' : 'white',
            }}
          >
            LỊCH HỌC, LỊCH THI THEO TUẦN
          </h1>
          <p
            style={{
              textAlign: 'center',
              marginBottom: 20,
              fontSize: 14,
              color: theme.palette.mode !== 'dark' ? 'black' : 'white',
            }}
          >
            Tuần ngày {startOfWeek.format('DD/MM')} -{' '}
            {endOfWeek.format('DD/MM/YYYY')}
          </p>
        </div>
        <Table
          className="schedule-table"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </div>
    </Card>
  );
};

export default ScheduleTable;
