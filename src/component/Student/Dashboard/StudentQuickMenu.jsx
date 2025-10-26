import React from 'react';
import { Card } from 'antd';
import { alpha } from '@mui/material/styles';

const StudentQuickMenu = ({ menuItems, colors, navigate }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 16,
      marginTop: 8,
      alignItems: 'stretch',
    }}
  >
    {menuItems.map((item, idx) => (
      <Card
        key={idx}
        hoverable
        style={{
          background: colors.bgCard,
          color: colors.fg,
          textAlign: 'center',
          width: '100%',
          height: '100%',
          border: `1px solid ${alpha(colors.primary, 0.2)}`,
          borderRadius: 12,
          cursor: 'pointer',
        }}
        bodyStyle={{
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => navigate(item.path)}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha(colors.primary, 0.12),
            color: colors.primary,
            fontSize: 18,
          }}
        >
          {item.icon}
        </div>
        <div style={{ marginTop: 10, fontWeight: 600, lineHeight: 1.2 }}>
          {item.text}
        </div>
      </Card>
    ))}
  </div>
);

export default StudentQuickMenu;
