import React from 'react';
import { Card, Row, Col } from 'antd';
import { alpha } from '@mui/material';

const StudentQuickMenu = ({ menuItems, colors, navigate }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
      {menuItems.map((item, idx) => (
        <Col
          key={idx}
          xs={12} // Mobile: 2 columns (12/24 = 50%)
          sm={8} // Tablet: 3 columns (8/24 = 33.33%)
          md={8} // Medium: 3 columns
          lg={6} // Large: 4 columns (6/24 = 25%)
          xl={4} // Extra Large: 6 columns (4/24 = 16.67%)
          xxl={4} // XXL: 6 columns
        >
          <Card
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
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{
              padding: 16,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
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
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div
              style={{
                fontWeight: 600,
                lineHeight: 1.2,
                fontSize: 16,
                wordBreak: 'break-word',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.text}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StudentQuickMenu;
