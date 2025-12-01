import React from 'react';
import { Table } from 'antd';

const GradeTable = ({ columns, dataSource, theme }) => {
  const mergedColumns = columns.map((col) => ({
    ...col,
    onCell: (record) => {
      if (record.isGroup)
        return {
          style: {
            background: theme.palette.background.default,
            fontWeight: 600,
            border: 'none',
          },
        };
      if (record.isSummary)
        return {
          style: {
            background: theme.palette.background.secondary,
            fontWeight: 500,
          },
        };
      return {};
    },
    render: (value, record) => {
      // === Nhóm học kỳ (chiếm full width)
      if (record.isGroup && col.dataIndex === 'index') {
        return {
          children: (
            <div
              style={{
                width: '100%',
                textAlign: 'left',
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {record.semesterName}
              <span
                style={{
                  marginLeft: 16,
                  color: theme.palette.secondary.main,
                  fontWeight: 500,
                }}
              >
                GPA: {record.semesterGPA10 ?? ''}
              </span>
            </div>
          ),
          props: { colSpan: columns.length },
        };
      }
      if (record.isGroup) return { children: null, props: { colSpan: 0 } };

      // === Summary chia 2 cột lớn
      if (record.isSummary) {
        if (col.dataIndex === 'index')
          return {
            children: `${record.col1Label}: ${record.col1Value ?? ''}`,
            props: { colSpan: 2 },
          };
        if (col.dataIndex === 'courseCode')
          return { children: null, props: { colSpan: 0 } };

        if (col.dataIndex === 'courseName')
          return {
            children: `${record.col2Label}: ${record.col2Value ?? ''}`,
            props: { colSpan: 2 },
          };
        if (col.dataIndex === 'credits')
          return { children: null, props: { colSpan: 0 } };

        return '';
      }

      return col.render ? col.render(value, record) : value;
    },
  }));

  const isMobile = window.innerWidth < 600;
  const isTablet = window.innerWidth >= 600 && window.innerWidth < 960;

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        background: theme.palette.background.paper,
        borderRadius: 8,
        padding: isMobile ? 8 : isTablet ? 12 : 16,
      }}
    >
      <style>
        {`
          .grade-table .ant-table {
            background: ${theme.palette.background.paper} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .grade-table .ant-table-thead > tr > th {
            background: ${
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : theme.palette.background.secondary
            } !important;
            color: ${theme.palette.text.primary} !important;
            border-color: ${theme.palette.divider} !important;
            font-weight: 600;
          }
          .grade-table .ant-table-tbody > tr > td {
            border-color: ${theme.palette.divider} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .grade-table .ant-table-row:hover > td {
            background: ${theme.palette.action.hover} !important;
          }

          /* Responsive table cells */
          @media (max-width: 600px) {
            .grade-table .ant-table-cell {
              padding: 8px 4px !important;
              font-size: 12px !important;
            }
            .grade-table .ant-table-thead > tr > th {
              font-size: 11px !important;
            }
          }

          @media (min-width: 600px) and (max-width: 960px) {
            .grade-table .ant-table-cell {
              padding: 12px 8px !important;
              font-size: 13px !important;
            }
          }
        `}
      </style>
      <Table
        className="grade-table"
        columns={mergedColumns}
        dataSource={dataSource}
        pagination={false}
        bordered
        rowKey="key"
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </div>
  );
};

export default GradeTable;
