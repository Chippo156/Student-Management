import React from 'react';
import { Card } from 'antd';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StudentProgressChart = ({
  outerCredits,
  innerProgress,
  hoveredRing,
  setHoveredRing,
  completedCredits,
  totalCredits,
  percentCompleted,
  colors,
  creditsSummary,
  account,
}) => (
  <Card
    style={{
      background: colors.bgCard,
      color: colors.fg,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      textAlign: 'center',
      height: '100%',
    }}
  >
    <div style={{ fontWeight: 600, marginBottom: 12 }}>Tiến độ học tập</div>
    <div
      style={{
        position: 'relative',
        width: 220,
        height: 220,
        margin: '0 auto',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={outerCredits}
            cx="50%"
            cy="50%"
            innerRadius={82}
            outerRadius={100}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            onMouseEnter={() => setHoveredRing('outer')}
            onMouseLeave={() => setHoveredRing(null)}
          >
            {outerCredits.map((entry, i) => (
              <Cell key={`outer-${i}`} fill={entry.color} cursor="pointer" />
            ))}
          </Pie>
          <Pie
            data={innerProgress}
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={76}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            onMouseEnter={() => setHoveredRing('inner')}
            onMouseLeave={() => setHoveredRing(null)}
          >
            {innerProgress.map((entry, i) => (
              <Cell key={`inner-${i}`} fill={entry.color} cursor="pointer" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          pointerEvents: 'none',
        }}
      >
        {hoveredRing === 'outer' ? (
          <>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.fg,
              }}
            >
              {completedCredits}/{totalCredits || '--'}
            </div>
            <div style={{ fontSize: 12, color: colors.sub }}>Tín chỉ</div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: colors.fg,
              }}
            >
              {percentCompleted}%
            </div>
            <div style={{ fontSize: 12, color: colors.sub }}>Hoàn thành</div>
          </>
        )}
      </div>
    </div>
    <div style={{ marginTop: 8, color: colors.sub }}>
      <span style={{ color: colors.fg, fontWeight: 600 }}>
        {creditsSummary?.totalCreditCompleted ?? 143}
      </span>{' '}
      /{' '}
      {creditsSummary?.totalCreditRequired ??
        account?.totalCreditsRequired ??
        '--'}{' '}
      tín chỉ
    </div>
  </Card>
);

export default StudentProgressChart;
