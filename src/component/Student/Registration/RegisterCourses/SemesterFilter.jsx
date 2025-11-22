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
      padding: 20,
      borderRadius: 8,
      marginBottom: 24,
      border: `1px solid ${theme.palette.divider}`,
    }}
  >
    <Row gutter={16} align="middle">
      <Col>
        <span
          style={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            marginRight: 12,
          }}
        >
          Đợt đăng ký:
        </span>
        <Select
          value={semester}
          onChange={setSemester}
          style={{ width: 250 }}
          options={semesters}
          placeholder="Chọn học kỳ"
        />
      </Col>
      <Col>
        <Radio.Group
          value={registerType}
          onChange={(e) => setRegisterType(e.target.value)}
          style={{ marginLeft: 16 }}
        >
          {Object.values(REGISTER_TYPES).map((type) => (
            <Radio key={type} value={type} style={{ fontWeight: 500 }}>
              {REGISTER_TYPE_LABELS[type]}
            </Radio>
          ))}
        </Radio.Group>
      </Col>
    </Row>
  </div>
));

SemesterFilter.displayName = 'SemesterFilter';

export default SemesterFilter;
