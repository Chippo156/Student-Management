import React from 'react';
import { Card, Select, Empty } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { InboxOutlined } from '@ant-design/icons';

const StudentAcademicChart = ({
  academicData,
  semesters,
  selectedSemesterId,
  handleSemesterChange,
  colors,
  sectionTitleStyle,
}) => (
  <Card
    style={{
      background: colors.bgCard,
      color: colors.fg,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      height: '100%',
    }}
    title={<span style={sectionTitleStyle}>Kết quả học tập</span>}
    extra={
      <Select
        style={{ minWidth: 120 }}
        value={selectedSemesterId ?? undefined}
        onChange={handleSemesterChange}
        options={semesters.map((s) => ({
          value: s.semesterId,
          label: `${s.year} - ${s.term}`,
        }))}
        placeholder="Chọn học kỳ"
      />
    }
    styles={{
      header: {
        borderBottom: `1px solid ${colors.border}`,
        color: colors.fg,
      },
    }}
  >
    <div style={{ width: '100%', height: 320 }}>
      {!academicData || academicData.length === 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 16
        }}>
          <Empty
            image={<InboxOutlined style={{ fontSize: 64, color: colors.sub }} />}
            description={
              <span style={{ color: colors.sub }}>
                Chưa có dữ liệu kết quả học tập cho học kỳ này
              </span>
            }
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={academicData}
            margin={{ top: 8, right: 16, left: 0, bottom: 56 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              dataKey="subject"
              interval={0}
              angle={-20}
              textAnchor="end"
              tick={{ fontSize: 12, fill: colors.sub }}
              tickMargin={10}
            />
            <YAxis domain={[0, 10]} tick={{ fill: colors.sub }} />
            <RTooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ color: colors.fg, bottom: 16 }}
            />
            <Bar
              dataKey="myScore"
              name="Điểm của bạn"
              fill={colors.primary}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="avgScore"
              name="Điểm TB lớp"
              fill={colors.secondary}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </Card>
);

export default StudentAcademicChart;
