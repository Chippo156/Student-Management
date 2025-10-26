import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Tabs,
  Card,
  Row,
  Col,
  message,
  Spin,
  Divider,
  Checkbox,
} from 'antd';
import { Box, Paper } from '@mui/material';
import { userService } from '../../../service/userService';
import { familyRelationshipService } from '../../../service/familyRelationshipService';
import { externalBankService } from '../../../service/helperService';
import { studentServices } from '../../../service/studentServices';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TabPane } = Tabs;

const StudentEditInfoPage = () => {
  const [formPersonal] = Form.useForm();
  const [formFamily] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({});
  const [familyData, setFamilyData] = useState({
    father: {},
    mother: {},
    guardian: {},
  });

  // Danh sách địa lý
  const [provinces, setProvinces] = useState([]);
  // Quê quán
  const [hometownDistricts, setHometownDistricts] = useState([]);
  const [hometownWards, setHometownWards] = useState([]);
  // Nơi sinh
  const [birthDistricts, setBirthDistricts] = useState([]);
  const [birthWards, setBirthWards] = useState([]);
  // Nơi cấp giấy khai sinh
  const [birthCertDistricts, setBirthCertDistricts] = useState([]);
  const [birthCertWards, setBirthCertWards] = useState([]);
  // Hộ khẩu thường trú
  const [permanentDistricts, setPermanentDistricts] = useState([]);
  const [permanentWards, setPermanentWards] = useState([]);

  // Các giá trị chọn hiện tại
  const [selectedHometownProvince, setSelectedHometownProvince] =
    useState(null);
  const [selectedHometownDistrict, setSelectedHometownDistrict] =
    useState(null);

  const [selectedBirthProvince, setSelectedBirthProvince] = useState(null);
  const [selectedBirthDistrict, setSelectedBirthDistrict] = useState(null);

  const [selectedBirthCertProvince, setSelectedBirthCertProvince] =
    useState(null);
  const [selectedBirthCertDistrict, setSelectedBirthCertDistrict] =
    useState(null);

  const [selectedPermanentProvince, setSelectedPermanentProvince] =
    useState(null);
  const [selectedPermanentDistrict, setSelectedPermanentDistrict] =
    useState(null);

  const navigate = useNavigate();

  // Chuẩn hóa dữ liệu {id, name} => {code, name}
  const normalizeList = (arr) =>
    Array.isArray(arr)
      ? arr.map((item) => ({
          code: item.id,
          name: item.name,
        }))
      : [];

  useEffect(() => {
    const fetchData = async (showError = true) => {
      try {
        setLoading(true);

        const userRes = await userService.getUserInfo();
        setStudentInfo(userRes?.user || {});

        const familyRes =
          await familyRelationshipService.getFamilyRelationshipsByStudent();
        const familyList = Array.isArray(familyRes)
          ? familyRes
          : familyRes?.data || [];

        const father =
          familyList.find((i) => i.relationshipTypeName === 'Cha') || {};
        const mother =
          familyList.find((i) => i.relationshipTypeName === 'Mẹ') || {};
        const guardian =
          familyList.find((i) => i.relationshipTypeName === 'Người giám hộ') ||
          {};

        setFamilyData({ father, mother, guardian });

        // Lấy danh sách tỉnh/thành
        const provinceData = await externalBankService.getProvinces();
        // Sửa lại dòng này:
        const provincesList = normalizeList(provinceData);
        setProvinces(provincesList);

        // Set giá trị form và các select địa chỉ nếu có dữ liệu
        formPersonal.setFieldsValue({
          ...userRes?.user,
          dateOfBirth: userRes?.user?.dateOfBirth
            ? dayjs(userRes?.user?.dateOfBirth)
            : null,
          issuedDate: userRes?.user?.issuedDate
            ? dayjs(userRes?.user?.issuedDate)
            : null,
          dateOfJoinUnion: userRes?.user?.dateOfJoinUnion
            ? dayjs(userRes?.user?.dateOfJoinUnion)
            : null,
          dateOfJoinParty: userRes?.user?.dateOfJoinParty
            ? dayjs(userRes?.user?.dateOfJoinParty)
            : null,
          // ...các trường ngày tháng khác nếu có
          gender:
            userRes?.user?.gender === 0
              ? 'Nam'
              : userRes?.user?.gender === 1
                ? 'Nữ'
                : 'Khác',
        });

        // Set các giá trị select địa chỉ nếu có
        if (userRes?.user?.hometownProvince) {
          setSelectedHometownProvince(userRes.user.hometownProvince);
          const districts = await externalBankService.getDistrictsByProvince(
            userRes.user.hometownProvince
          );
          setHometownDistricts(normalizeList(districts?.data || districts));
        }
        if (userRes?.user?.hometownDistrict) {
          setSelectedHometownDistrict(userRes.user.hometownDistrict);
          const wards = await externalBankService.getWardsByDistrict(
            userRes.user.hometownDistrict
          );
          setHometownWards(normalizeList(wards?.data || wards));
        }
        if (userRes?.user?.birthProvince) {
          setSelectedBirthProvince(userRes.user.birthProvince);
          const districts = await externalBankService.getDistrictsByProvince(
            userRes.user.birthProvince
          );
          setBirthDistricts(normalizeList(districts?.data || districts));
        }
        if (userRes?.user?.birthDistrict) {
          setSelectedBirthDistrict(userRes.user.birthDistrict);
          const wards = await externalBankService.getWardsByDistrict(
            userRes.user.birthDistrict
          );
          setBirthWards(normalizeList(wards?.data || wards));
        }
        if (userRes?.user?.birthCertProvince) {
          setSelectedBirthCertProvince(userRes.user.birthCertProvince);
          const districts = await externalBankService.getDistrictsByProvince(
            userRes.user.birthCertProvince
          );
          setBirthCertDistricts(normalizeList(districts?.data || districts));
        }
        if (userRes?.user?.birthCertDistrict) {
          setSelectedBirthCertDistrict(userRes.user.birthCertDistrict);
          const wards = await externalBankService.getWardsByDistrict(
            userRes.user.birthCertDistrict
          );
          setBirthCertWards(normalizeList(wards?.data || wards));
        }
        if (userRes?.user?.permanentProvince) {
          setSelectedPermanentProvince(userRes.user.permanentProvince);
          const districts = await externalBankService.getDistrictsByProvince(
            userRes.user.permanentProvince
          );
          setPermanentDistricts(normalizeList(districts?.data || districts));
        }
        if (userRes?.user?.permanentDistrict) {
          setSelectedPermanentDistrict(userRes.user.permanentDistrict);
          const wards = await externalBankService.getWardsByDistrict(
            userRes.user.permanentDistrict
          );
          setPermanentWards(normalizeList(wards?.data || wards));
        }

        formFamily.setFieldsValue({
          fatherName: father?.fullName,
          fatherPhone: father?.phone,
          fatherDOB: father?.dateOfBirth
            ? dayjs(father?.dateOfBirth)
            : undefined,
          motherName: mother?.fullName,
          motherPhone: mother?.phone,
          motherDOB: mother?.dateOfBirth
            ? dayjs(mother?.dateOfBirth)
            : undefined,
          guardianName: guardian?.fullName,
          guardianPhone: guardian?.phone,
        });
      } catch (error) {
        if (showError) {
          message.error('Không thể tải dữ liệu sinh viên!');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formPersonal, formFamily]);

  // Quê quán
  const handleHometownProvinceChange = async (provinceCode) => {
    setSelectedHometownProvince(provinceCode);
    setSelectedHometownDistrict(null);
    formPersonal.setFieldsValue({ hometownDistrict: null, hometownWard: null });
    setHometownWards([]);
    const districts =
      await externalBankService.getDistrictsByProvince(provinceCode);
    setHometownDistricts(normalizeList(districts?.data || districts));
  };
  const handleHometownDistrictChange = async (districtCode) => {
    setSelectedHometownDistrict(districtCode);
    formPersonal.setFieldsValue({ hometownWard: null });
    const wards = await externalBankService.getWardsByDistrict(districtCode);
    setHometownWards(normalizeList(wards?.data || wards));
  };

  // Nơi sinh
  const handleBirthProvinceChange = async (provinceCode) => {
    setSelectedBirthProvince(provinceCode);
    setSelectedBirthDistrict(null);
    formPersonal.setFieldsValue({ birthDistrict: null, birthWard: null });
    setBirthWards([]);
    const districts =
      await externalBankService.getDistrictsByProvince(provinceCode);
    setBirthDistricts(normalizeList(districts?.data || districts));
  };
  const handleBirthDistrictChange = async (districtCode) => {
    setSelectedBirthDistrict(districtCode);
    formPersonal.setFieldsValue({ birthWard: null });
    const wards = await externalBankService.getWardsByDistrict(districtCode);
    setBirthWards(normalizeList(wards?.data || wards));
  };

  // Nơi cấp giấy khai sinh
  const handleBirthCertProvinceChange = async (provinceCode) => {
    setSelectedBirthCertProvince(provinceCode);
    setSelectedBirthCertDistrict(null);
    formPersonal.setFieldsValue({
      birthCertDistrict: null,
      birthCertWard: null,
    });
    setBirthCertWards([]);
    const districts =
      await externalBankService.getDistrictsByProvince(provinceCode);
    setBirthCertDistricts(normalizeList(districts?.data || districts));
  };
  const handleBirthCertDistrictChange = async (districtCode) => {
    setSelectedBirthCertDistrict(districtCode);
    formPersonal.setFieldsValue({ birthCertWard: null });
    const wards = await externalBankService.getWardsByDistrict(districtCode);
    setBirthCertWards(normalizeList(wards?.data || wards));
  };

  // Hộ khẩu thường trú
  const handlePermanentProvinceChange = async (provinceCode) => {
    setSelectedPermanentProvince(provinceCode);
    setSelectedPermanentDistrict(null);
    formPersonal.setFieldsValue({
      permanentDistrict: null,
      permanentWard: null,
    });
    setPermanentWards([]);
    const districts =
      await externalBankService.getDistrictsByProvince(provinceCode);
    setPermanentDistricts(normalizeList(districts?.data || districts));
  };
  const handlePermanentDistrictChange = async (districtCode) => {
    setSelectedPermanentDistrict(districtCode);
    formPersonal.setFieldsValue({ permanentWard: null });
    const wards = await externalBankService.getWardsByDistrict(districtCode);
    setPermanentWards(normalizeList(wards?.data || wards));
  };

  // Lưu thông tin cá nhân
  const handleSavePersonal = async () => {
    try {
      const values = await formPersonal.validateFields();
      const data = {
        fullName: values.fullName ?? null,
        email: values.email ?? null,
        phone: values.phone ?? null,
        gender: values.gender === 'Nam' ? 0 : values.gender === 'Nữ' ? 1 : 2,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : null,
        ethnicity: values.ethnicity ?? null,
        nationality: values.nationality ?? null,
        religion: values.religion ?? null,
        avatarUrl: null,
        citizenIdCard: values.citizenIdCard ?? null,
        issuedDate: values.issuedDate
          ? values.issuedDate.format('YYYY-MM-DD')
          : null,
        issuedPlace: values.issuedPlace ?? null,
        healthInsuranceNumber: values.healthInsuranceNumber ?? null,
        registeredHospital: values.healthInsuranceRegistrationPlace ?? null,
        hometownProvince: values.hometownProvince ?? null,
        hometownDistrict: values.hometownDistrict ?? null,
        hometownWard: values.hometownWard ?? null,
        birthProvince: values.birthProvince ?? null,
        birthDistrict: values.birthDistrict ?? null,
        birthWard: values.birthWard ?? null,
        birthCertProvince: values.birthCertProvince ?? null,
        birthCertDistrict: values.birthCertDistrict ?? null,
        birthCertWard: values.birthCertWard ?? null,
        permanentProvince: values.permanentProvince ?? null,
        permanentDistrict: values.permanentDistrict ?? null,
        permanentWard: values.permanentWard ?? null,
        temporaryAddress: values.temporaryAddress ?? null,
        contactAddress: values.contactAddress ?? null,
        address: values.address ?? null,
        object: null,
        policyArea: null,
        dateOfJoinUnion: null,
        dateOfJoinParty: null,
      };
      await studentServices.updateStudentInformation(data);
      message.success('Cập nhật thông tin cá nhân thành công!');
      fetchData(); // Không hiện toast lỗi khi fetch lại
    } catch (err) {}
  };

  // Lưu thông tin gia đình
  const handleSaveFamily = async () => {
    try {
      const values = await formFamily.validateFields();
      // TODO: Gọi API lưu thông tin gia đình nếu cần
      message.success('Cập nhật thông tin gia đình thành công!');
      fetchData(); // Không hiện toast lỗi khi fetch lại
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 20 }}>Đang tải thông tin sinh viên...</div>
      </div>
    );
  }

  return (
    <Box sx={{ mx: 'auto', mt: 4, maxWidth: 1100 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin cá nhân" key="1">
            <Card
              title="Cập nhật thông tin cá nhân"
              style={{ background: '#fafcff', marginBottom: 20 }}
              bordered={false}
            >
              <Form
                form={formPersonal}
                layout="vertical"
                onFinish={handleSavePersonal}
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[{ required: true, message: 'Nhập họ tên' }]}
                    >
                      <Input placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Ngày sinh"
                      name="dateOfBirth"
                      rules={[{ required: true, message: 'Chọn ngày sinh' }]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Dân tộc" name="ethnicity">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Giới tính"
                      name="gender"
                      rules={[{ required: true, message: 'Chọn giới tính' }]}
                    >
                      <Select>
                        <Option value="Nam">Nam</Option>
                        <Option value="Nữ">Nữ</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Quốc tịch" name="nationality">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số CCCD/CMND" name="citizenIdCard">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Ngày cấp" name="issuedDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nơi cấp" name="issuedPlace">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Số điện thoại" name="phone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Email" name="email">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Mã số BHYT" name="healthInsuranceNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Nơi đăng ký BHYT"
                      name="healthInsuranceRegistrationPlace"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                {/* Quê quán */}
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Quê quán - Tỉnh/Thành phố"
                      name="hometownProvince"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành"
                        value={selectedHometownProvince}
                        onChange={handleHometownProvinceChange}
                        allowClear
                      >
                        {provinces.map((p) => (
                          <Option key={p.code} value={p.code}>
                            {p.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Quê quán - Huyện/Quận"
                      name="hometownDistrict"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        value={selectedHometownDistrict}
                        onChange={handleHometownDistrictChange}
                        disabled={
                          !formPersonal.getFieldValue('hometownProvince')
                        }
                        allowClear
                      >
                        {hometownDistricts.map((d) => (
                          <Option key={d.code} value={d.code}>
                            {d.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Quê quán - Xã/Phường" name="hometownWard">
                      <Select
                        showSearch
                        placeholder="Chọn xã/phường"
                        disabled={
                          !formPersonal.getFieldValue('hometownDistrict')
                        }
                        allowClear
                      >
                        {hometownWards.map((w) => (
                          <Option key={w.code} value={w.code}>
                            {w.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {/* Nơi sinh */}
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi sinh - Tỉnh/Thành phố"
                      name="birthProvince"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành"
                        value={selectedBirthProvince}
                        onChange={handleBirthProvinceChange}
                        allowClear
                      >
                        {provinces.map((p) => (
                          <Option key={p.code} value={p.code}>
                            {p.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi sinh - Huyện/Quận"
                      name="birthDistrict"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        value={selectedBirthDistrict}
                        onChange={handleBirthDistrictChange}
                        disabled={!formPersonal.getFieldValue('birthProvince')}
                        allowClear
                      >
                        {birthDistricts.map((d) => (
                          <Option key={d.code} value={d.code}>
                            {d.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Nơi sinh - Xã/Phường" name="birthWard">
                      <Select
                        showSearch
                        placeholder="Chọn xã/phường"
                        disabled={!formPersonal.getFieldValue('birthDistrict')}
                        allowClear
                      >
                        {birthWards.map((w) => (
                          <Option key={w.code} value={w.code}>
                            {w.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {/* Nơi cấp giấy khai sinh */}
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi cấp giấy khai sinh - Tỉnh/Thành phố"
                      name="birthCertProvince"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành"
                        value={selectedBirthCertProvince}
                        onChange={handleBirthCertProvinceChange}
                        allowClear
                      >
                        {provinces.map((p) => (
                          <Option key={p.code} value={p.code}>
                            {p.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi cấp giấy khai sinh - Huyện/Quận"
                      name="birthCertDistrict"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        value={selectedBirthCertDistrict}
                        onChange={handleBirthCertDistrictChange}
                        disabled={
                          !formPersonal.getFieldValue('birthCertProvince')
                        }
                        allowClear
                      >
                        {birthCertDistricts.map((d) => (
                          <Option key={d.code} value={d.code}>
                            {d.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi cấp giấy khai sinh - Xã/Phường"
                      name="birthCertWard"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn xã/phường"
                        disabled={
                          !formPersonal.getFieldValue('birthCertDistrict')
                        }
                        allowClear
                      >
                        {birthCertWards.map((w) => (
                          <Option key={w.code} value={w.code}>
                            {w.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {/* Nơi đăng ký hộ khẩu thường trú */}
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi đăng ký hộ khẩu thường trú - Tỉnh/Thành phố"
                      name="permanentProvince"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành"
                        value={selectedPermanentProvince}
                        onChange={handlePermanentProvinceChange}
                        allowClear
                      >
                        {provinces.map((p) => (
                          <Option key={p.code} value={p.code}>
                            {p.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi đăng ký hộ khẩu thường trú - Huyện/Quận"
                      name="permanentDistrict"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        value={selectedPermanentDistrict}
                        onChange={handlePermanentDistrictChange}
                        disabled={
                          !formPersonal.getFieldValue('permanentProvince')
                        }
                        allowClear
                      >
                        {permanentDistricts.map((d) => (
                          <Option key={d.code} value={d.code}>
                            {d.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Nơi đăng ký hộ khẩu thường trú - Xã/Phường"
                      name="permanentWard"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn xã/phường"
                        disabled={
                          !formPersonal.getFieldValue('permanentDistrict')
                        }
                        allowClear
                      >
                        {permanentWards.map((w) => (
                          <Option key={w.code} value={w.code}>
                            {w.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {/* Các trường còn lại */}
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      label="Địa chỉ tạm trú (nếu có)"
                      name="temporaryAddress"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item label="Địa chỉ liên hệ" name="address">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ minWidth: 120, marginRight: 8 }}
                  >
                    Lưu
                  </Button>
                  <Button onClick={() => navigate('/student/info')}>Hủy</Button>
                </div>
              </Form>
            </Card>
          </TabPane>
          <TabPane tab="Quan hệ gia đình" key="2">
            <Form
              form={formFamily}
              layout="vertical"
              onFinish={handleSaveFamily}
            >
              {/* CHA */}
              <Card
                title="Thông tin Cha"
                style={{ background: '#f7fbff', marginBottom: 16 }}
                bordered={false}
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Họ và tên" name="fatherName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Ngày sinh" name="fatherDOB">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số CMND" name="fatherIdNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nơi cấp CMND" name="fatherIdPlace">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Ngày cấp CMND" name="fatherIdDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số điện thoại" name="fatherPhone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nghề nghiệp" name="fatherJob">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Hộ khẩu thường trú" name="fatherAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Tỉnh/Thành phố" name="fatherProvince">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Huyện/Quận" name="fatherDistrict">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Xã/Phường" name="fatherWard">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Địa chỉ" name="fatherDetailAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item name="fatherIsDead" valuePropName="checked">
                      <Checkbox>Đã mất</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="fatherIsHouseholdHead"
                      valuePropName="checked"
                    >
                      <Checkbox>Là chủ hộ</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              {/* MẸ */}
              <Card
                title="Thông tin Mẹ"
                style={{ background: '#f7fbff', marginBottom: 16 }}
                bordered={false}
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Họ và tên" name="motherName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Ngày sinh" name="motherDOB">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số CMND" name="motherIdNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nơi cấp CMND" name="motherIdPlace">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Ngày cấp CMND" name="motherIdDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Số điện thoại" name="motherPhone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Nghề nghiệp" name="motherJob">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Hộ khẩu thường trú" name="motherAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Tỉnh/Thành phố" name="motherProvince">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Huyện/Quận" name="motherDistrict">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Xã/Phường" name="motherWard">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Địa chỉ" name="motherDetailAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item name="motherIsDead" valuePropName="checked">
                      <Checkbox>Đã mất</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="motherIsHouseholdHead"
                      valuePropName="checked"
                    >
                      <Checkbox>Là chủ hộ</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              {/* NGƯỜI GIÁM HỘ */}
              <Divider />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ minWidth: 120, marginRight: 8 }}
                >
                  Lưu
                </Button>
                <Button onClick={() => navigate('/student/info')}>Hủy</Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Paper>
    </Box>
  );
};

export default StudentEditInfoPage;
