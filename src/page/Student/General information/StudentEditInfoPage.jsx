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
  Checkbox,
  Modal,
  Space,
  Descriptions,
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

// Danh sách loại quan hệ
const RELATIONSHIP_TYPES = [
  { value: 1, label: 'Cha' },
  { value: 2, label: 'Mẹ' },
  { value: 3, label: 'Ông nội' },
  { value: 4, label: 'Bà nội' },
  { value: 5, label: 'Chú' },
  { value: 6, label: 'Cô' },
  { value: 7, label: 'Anh' },
  { value: 8, label: 'Chị' },
  { value: 9, label: 'Vợ/Chồng' },
  { value: 10, label: 'Giám hộ' },
  { value: 11, label: 'Khác' },
];

const StudentEditInfoPage = () => {
  const [formPersonal] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({});
  const [familyList, setFamilyList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Địa lý cá nhân
  const [provinces, setProvinces] = useState([]);
  const [hometownDistricts, setHometownDistricts] = useState([]);
  const [hometownWards, setHometownWards] = useState([]);
  const [birthDistricts, setBirthDistricts] = useState([]);
  const [birthWards, setBirthWards] = useState([]);
  const [birthCertDistricts, setBirthCertDistricts] = useState([]);
  const [birthCertWards, setBirthCertWards] = useState([]);
  const [permanentDistricts, setPermanentDistricts] = useState([]);
  const [permanentWards, setPermanentWards] = useState([]);

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

  // Địa chỉ người thân (modal)
  const [familyProvinces, setFamilyProvinces] = useState([]);
  const [familyDistricts, setFamilyDistricts] = useState([]);
  const [familyWards, setFamilyWards] = useState([]);
  const [selectedFamilyProvince, setSelectedFamilyProvince] = useState(null);
  const [selectedFamilyDistrict, setSelectedFamilyDistrict] = useState(null);

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

        // Lấy người thân động
        const familyRes =
          await familyRelationshipService.getFamilyRelationshipsByStudent();
        const familyListRaw = Array.isArray(familyRes)
          ? familyRes
          : familyRes?.data || [];
        // Chuyển familyRelationshipId thành id
        const familyList = familyListRaw.map((item) => ({
          ...item,
          id: item.familyRelationshipId,
        }));
        setFamilyList(familyList);

        // Lấy danh sách tỉnh/thành
        const provinceData = await externalBankService.getProvinces();
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
      } catch (error) {
        if (showError) {
          message.error('Không thể tải dữ liệu sinh viên!');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formPersonal]);

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
    } catch (err) {}
  };

  // --- Người thân động ---
  const handleAddFamily = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const handleEditFamily = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleDeleteFamily = (member) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa người thân này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        setFamilyList((prev) => prev.filter((f) => f !== member));
      },
    });
  };

  const handleSaveFamilyMember = (values) => {
    // Lấy tên tỉnh/huyện/xã từ code
    const provinceName =
      familyProvinces.find((p) => p.code === values.province)?.name || null;
    const districtName =
      familyDistricts.find((d) => d.code === values.district)?.name || null;
    const wardName =
      familyWards.find((w) => w.code === values.ward)?.name || null;

    const newValues = {
      ...values,
      id: editingMember?.id, // giữ lại id nếu đang sửa
      dateOfBirth: values.dateOfBirth
        ? typeof values.dateOfBirth.format === 'function'
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : values.dateOfBirth
        : null,
      issuedDate: values.issuedDate
        ? typeof values.issuedDate.format === 'function'
          ? values.issuedDate.format('YYYY-MM-DD')
          : values.issuedDate
        : null,
      province: provinceName,
      district: districtName,
      ward: wardName,
    };

    if (editingMember) {
      setFamilyList((prev) =>
        prev.map((f) =>
          f === editingMember ? { ...editingMember, ...newValues } : f
        )
      );
    } else {
      setFamilyList((prev) => [...prev, newValues]);
    }
    setShowModal(false);
  };
  // Lưu thông tin gia đình
  const handleSaveFamily = async () => {
    try {
      // Tách thành 2 nhóm: đã có id (update), chưa có id (create)
      const updateList = familyList.filter((item) => item.id);
      const createList = familyList.filter((item) => !item.id);

      // Gọi update cho từng người thân đã có id
      for (const member of updateList) {
        await familyRelationshipService.updateFamilyRelationship(
          member.id,
          member
        );
      }
      // Gọi create cho từng người thân mới
      for (const member of createList) {
        await familyRelationshipService.createFamilyRelationship(member);
      }

      message.success('Cập nhật thông tin gia đình thành công!');
    } catch {
      message.error('Cập nhật thông tin gia đình thất bại!');
    }
  };

  // Khi mở modal thì load tỉnh
  useEffect(() => {
    if (showModal) {
      externalBankService.getProvinces().then((data) => {
        setFamilyProvinces(normalizeList(data));
      });
      setFamilyDistricts([]);
      setFamilyWards([]);
      setSelectedFamilyProvince(null);
      setSelectedFamilyDistrict(null);
    }
  }, [showModal]);

  const handleFamilyProvinceChange = async (provinceCode) => {
    setSelectedFamilyProvince(provinceCode);
    setSelectedFamilyDistrict(null);
    setFamilyWards([]);
    const districts =
      await externalBankService.getDistrictsByProvince(provinceCode);
    setFamilyDistricts(normalizeList(districts?.data || districts));
  };

  const handleFamilyDistrictChange = async (districtCode) => {
    setSelectedFamilyDistrict(districtCode);
    const wards = await externalBankService.getWardsByDistrict(districtCode);
    setFamilyWards(normalizeList(wards?.data || wards));
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
            <Button
              type="primary"
              onClick={handleAddFamily}
              style={{ marginBottom: 16 }}
            >
              Thêm người thân
            </Button>
            <Row gutter={[24, 24]}>
              {familyList.map((member, idx) => (
                <Col xs={24} md={24} key={member.id || idx}>
                  <Card
                    type="inner"
                    title={
                      RELATIONSHIP_TYPES.find(
                        (t) => t.value === member.relationshipType
                      )?.label ||
                      member.relationshipTypeName ||
                      'Người thân'
                    }
                    headStyle={{ background: '#e6f7ff' }}
                    extra={
                      <>
                        <Button
                          size="small"
                          onClick={() => handleEditFamily(member)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => handleDeleteFamily(member)}
                          style={{ marginLeft: 8 }}
                        >
                          Xóa
                        </Button>
                      </>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Họ tên">
                        {member.fullName || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="SĐT">
                        {member.phone || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày sinh">
                        {member.dateOfBirth ? (
                          dayjs(member.dateOfBirth).format('DD/MM/YYYY')
                        ) : (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {member.email || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nghề nghiệp">
                        {member.occupation || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nơi làm việc">
                        {member.workplace || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="CCCD">
                        {member.citizenIdCard || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày cấp">
                        {member.issuedDate ? (
                          dayjs(member.issuedDate).format('DD/MM/YYYY')
                        ) : (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nơi cấp" span={2}>
                        {member.issuedPlace || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ thường trú" span={2}>
                        {member.permanentAddress || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ cụ thể" span={2}>
                        {member.fullAddress || member.detailAddress || (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Là người giám hộ">
                        {member.isGuardian === true ? (
                          'Có'
                        ) : member.isGuardian === false ? (
                          'Không'
                        ) : (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Đã mất">
                        {member.isDeceased === true ? (
                          'Có'
                        ) : member.isDeceased === false ? (
                          'Không'
                        ) : (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Chủ hộ">
                        {member.isHouseholder === true ? (
                          'Có'
                        ) : member.isHouseholder === false ? (
                          'Không'
                        ) : (
                          <span style={{ color: '#999' }}>Chưa cập nhật</span>
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              ))}
            </Row>
            <Modal
              open={showModal}
              title={editingMember ? 'Sửa người thân' : 'Thêm người thân'}
              onCancel={() => setShowModal(false)}
              footer={null}
              destroyOnClose
            >
              <Form
                layout="vertical"
                initialValues={
                  editingMember
                    ? {
                        ...editingMember,
                        dateOfBirth: editingMember.dateOfBirth
                          ? dayjs(editingMember.dateOfBirth)
                          : null,
                        issuedDate: editingMember.issuedDate
                          ? dayjs(editingMember.issuedDate)
                          : null,
                      }
                    : {
                        relationshipType: 1,
                        isGuardian: false,
                        isDeceased: false,
                        isHouseholder: false,
                      }
                }
                onFinish={handleSaveFamilyMember}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Loại quan hệ"
                      name="relationshipType"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        {RELATIONSHIP_TYPES.map((t) => (
                          <Option key={t.value} value={t.value}>
                            {t.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Ngày sinh" name="dateOfBirth">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Số điện thoại" name="phone">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Email" name="email">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nghề nghiệp" name="occupation">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Nơi làm việc" name="workplace">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="CCCD" name="citizenIdCard">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Ngày cấp" name="issuedDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nơi cấp" name="issuedPlace">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Địa chỉ thường trú"
                      name="permanentAddress"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Địa chỉ liên hệ" name="contactAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="isGuardian" valuePropName="checked">
                      <Checkbox>Là người giám hộ</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="isDeceased" valuePropName="checked">
                      <Checkbox>Đã mất</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="isHouseholder" valuePropName="checked">
                      <Checkbox>Là chủ hộ</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Tỉnh/Thành" name="province">
                      <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành"
                        value={selectedFamilyProvince}
                        onChange={handleFamilyProvinceChange}
                        allowClear
                      >
                        {familyProvinces.map((p) => (
                          <Option key={p.code} value={p.code}>
                            {p.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Quận/Huyện" name="district">
                      <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        value={selectedFamilyDistrict}
                        onChange={handleFamilyDistrictChange}
                        disabled={!selectedFamilyProvince}
                        allowClear
                      >
                        {familyDistricts.map((d) => (
                          <Option key={d.code} value={d.code}>
                            {d.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Xã/Phường" name="ward">
                      <Select
                        showSearch
                        placeholder="Chọn xã/phường"
                        disabled={!selectedFamilyDistrict}
                        allowClear
                      >
                        {familyWards.map((w) => (
                          <Option key={w.code} value={w.code}>
                            {w.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Địa chỉ cụ thể" name="detailAddress">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ textAlign: 'right' }}>
                  <Button
                    onClick={() => setShowModal(false)}
                    style={{ marginRight: 8 }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Lưu
                  </Button>
                </div>
              </Form>
            </Modal>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ minWidth: 120, marginRight: 8 }}
                onClick={handleSaveFamily}
              >
                Lưu
              </Button>
              <Button onClick={() => navigate('/student/info')}>Hủy</Button>
            </div>
          </TabPane>
        </Tabs>
      </Paper>
    </Box>
  );
};

export default StudentEditInfoPage;
