import React, { useEffect, useState } from 'react';
import { Form, Tabs, message, Spin, Button } from 'antd';
import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { userService } from '../../../service/userService';
import { familyRelationshipService } from '../../../service/familyRelationshipService';
import { externalBankService } from '../../../service/helperService';
import { studentServices } from '../../../service/studentServices';
import { normalizeList } from '../../../component/Shared/utils';
import PersonalInfoForm from '../../../component/Student/StudentEditInfoPage/PersonalInfoForm';
import FamilyMembersList from '../../../component/Student/StudentEditInfoPage/FamilyMembersList';

const { TabPane } = Tabs;

const StudentEditInfoPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formPersonal] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({});
  const [familyList, setFamilyList] = useState([]);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thông tin sinh viên
        const userRes = await userService.getUserInfo();
        setStudentInfo(userRes?.user || {});

        // Lấy người thân
        const familyRes =
          await familyRelationshipService.getFamilyRelationshipsByStudent();
        const familyListRaw = Array.isArray(familyRes) ? familyRes : familyRes?.data || [];
        const familyList = familyListRaw.map((item) => ({
          ...item,
          id: item.familyRelationshipId,
        }));
        setFamilyList(familyList);

        // Lấy danh sách tỉnh/thành
        const provinceData = await externalBankService.getProvinces();
        const provincesList = normalizeList(provinceData);
        setProvinces(provincesList);

        // Set giá trị form
        formPersonal.setFieldsValue({
          ...userRes?.user,
          dateOfBirth: userRes?.user?.dateOfBirth
            ? dayjs(userRes?.user?.dateOfBirth)
            : null,
          issuedDate: userRes?.user?.issuedDate
            ? dayjs(userRes?.user?.issuedDate)
            : null,
          gender:
            userRes?.user?.gender === 0
              ? 'Nam'
              : userRes?.user?.gender === 1
                ? 'Nữ'
                : 'Khác',
        });
      } catch (error) {
        message.error('Không thể tải dữ liệu sinh viên!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formPersonal]);

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
        issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null,
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
    } catch (err) {
      message.error('Cập nhật thông tin thất bại!');
    }
  };

  // Lưu thông tin gia đình
  const handleSaveFamily = async () => {
    try {
      const updateList = familyList.filter((item) => item.id);
      const createList = familyList.filter((item) => !item.id);

      for (const member of updateList) {
        await familyRelationshipService.updateFamilyRelationship(member.id, member);
      }
      for (const member of createList) {
        await familyRelationshipService.createFamilyRelationship(member);
      }

      message.success('Cập nhật thông tin gia đình thành công!');
    } catch {
      message.error('Cập nhật thông tin gia đình thất bại!');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 60,
          textAlign: 'center',
          background: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 20, color: theme.palette.text.primary }}>
          Đang tải thông tin sinh viên...
        </div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        mx: 'auto',
        mt: 4,
        maxWidth: 1100,
        p: { xs: 2, sm: 2, md: 3 },
        background: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 2, md: 4 }, background: theme.palette.background.paper }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin cá nhân" key="1">
            <PersonalInfoForm
              form={formPersonal}
              onSave={handleSavePersonal}
              onCancel={() => navigate('/student/info')}
              provinces={provinces}
              studentInfo={studentInfo}
            />
          </TabPane>

          <TabPane tab="Quan hệ gia đình" key="2">
            <FamilyMembersList familyList={familyList} setFamilyList={setFamilyList} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button
                type="primary"
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
