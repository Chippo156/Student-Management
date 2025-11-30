import React, { forwardRef } from 'react';
import { Select, Radio, Row, Col } from 'antd';
import { alpha } from '@mui/material/styles';
import { REGISTER_TYPES, REGISTER_TYPE_LABELS } from './constants';

const SemesterFilter = forwardRef(({
  theme,
  semesters,
  semester,
  setSemester,
  registerType,
  setRegisterType,
}, ref) => (
  <div
    ref={ref}
    style={{
      background: alpha(theme.palette.primary.main, 0.05),
      padding: window.innerWidth < 600 ? 12 : 20,
      borderRadius: 8,
      marginBottom: 24,
      border: `1px solid ${theme.palette.divider}`,
    }}
  >
    <Row gutter={[16, 16]} align="top">
      <Col xs={24} sm={24} md={12} lg={12} xl={10}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span
            style={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: window.innerWidth < 600 ? 13 : 14,
            }}
          >
            Đợt đăng ký:
          </span>
          <Select
            value={semester}
            onChange={setSemester}
            style={{ width: '100%', maxWidth: 300 }}
            options={semesters}
            placeholder="Chọn học kỳ"
          />
        </div>
      </Col>
      <Col xs={24} sm={24} md={12} lg={12} xl={14}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span
            style={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: window.innerWidth < 600 ? 13 : 14,
            }}
          >
            Loại đăng ký:
          </span>
          <Radio.Group
            value={registerType}
            onChange={(e) => setRegisterType(e.target.value)}
          >
            {Object.values(REGISTER_TYPES).map((type) => (
              <Radio
                key={type}
                value={type}
                style={{
                  fontWeight: 500,
                  fontSize: window.innerWidth < 600 ? 13 : 14,
                  display: 'block',
                  marginBottom: window.innerWidth < 600 ? 8 : 0,
                }}
              >
                {REGISTER_TYPE_LABELS[type]}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Col>
    </Row>
  </div>
));

SemesterFilter.displayName = 'SemesterFilter';

export default SemesterFilter;
