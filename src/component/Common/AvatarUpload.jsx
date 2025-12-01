import React, { useState } from 'react';
import { Upload, message, Avatar, Spin } from 'antd';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import { Box, IconButton, Tooltip } from '@mui/material';
import fileService from '../../service/fileService';
import { userService } from '../../service/userService';
import { studentServices } from '../../service/studentServices';
import { useDispatch, useSelector } from 'react-redux';
import { doGetAccountAction } from '../../redux/UserSlice';

const AvatarUpload = ({ currentAvatarUrl, userId, size = 120, showUploadButton = true }) => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const dispatch = useDispatch();
  const account = useSelector((state) => state.user.account);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể upload file ảnh!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    return true;
  };

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      // Step 1: Upload file
      const uploadResult = await fileService.uploadFile(file, userId);

      if (!uploadResult) {
        setLoading(false);
        return;
      }

      // Step 2: Update user with new avatar URL
      let updateResult;

      // Check if current user is a student (role name or role ID)
      const isStudent = account?.role?.roleName === 'Student' ||
                        account?.role?.roleId === 3 ||
                        account?.mssv; // Student có MSSV

      if (isStudent) {
        // Use student API - need to get full student info first
        const currentUserInfo = await userService.getUserInfo();
        const currentStudent = currentUserInfo?.user || {};

        // Build full payload with all fields, updating only avatarUrl
        const fullPayload = {
          fullName: currentStudent.fullName ?? null,
          email: currentStudent.email ?? null,
          phone: currentStudent.phone ?? null,
          gender: currentStudent.gender ?? null,
          dateOfBirth: currentStudent.dateOfBirth ?? null,
          ethnicity: currentStudent.ethnicity ?? null,
          nationality: currentStudent.nationality ?? null,
          religion: currentStudent.religion ?? null,
          avatarUrl: uploadResult.filePath, // Only this field is new
          citizenIdCard: currentStudent.citizenIdCard ?? null,
          issuedDate: currentStudent.issuedDate ?? null,
          issuedPlace: currentStudent.issuedPlace ?? null,
          healthInsuranceNumber: currentStudent.healthInsuranceNumber ?? null,
          registeredHospital: currentStudent.registeredHospital ?? null,
          hometownProvince: currentStudent.hometownProvince ?? null,
          hometownDistrict: currentStudent.hometownDistrict ?? null,
          hometownWard: currentStudent.hometownWard ?? null,
          birthProvince: currentStudent.birthProvince ?? null,
          birthDistrict: currentStudent.birthDistrict ?? null,
          birthWard: currentStudent.birthWard ?? null,
          birthCertProvince: currentStudent.birthCertProvince ?? null,
          birthCertDistrict: currentStudent.birthCertDistrict ?? null,
          birthCertWard: currentStudent.birthCertWard ?? null,
          permanentProvince: currentStudent.permanentProvince ?? null,
          permanentDistrict: currentStudent.permanentDistrict ?? null,
          permanentWard: currentStudent.permanentWard ?? null,
          temporaryAddress: currentStudent.temporaryAddress ?? null,
          contactAddress: currentStudent.contactAddress ?? null,
          address: currentStudent.address ?? null,
          object: null,
          policyArea: null,
          dateOfJoinUnion: null,
          dateOfJoinParty: null,
        };

        updateResult = await studentServices.updateStudentInformation(fullPayload);
      } else {
        // Use general user API (for admin, lecturer, etc.)
        updateResult = await userService.updateUser(userId, {
          avatarUrl: uploadResult.filePath,
        });
      }

      if (updateResult) {
        setAvatarUrl(uploadResult.filePath);
        message.success('Cập nhật avatar thành công!');

        // Refresh user info in Redux - get full user data
        const userInfo = await userService.getUserInfo();
        if (userInfo) {
          // Update Redux with full user info to refresh UI everywhere
          dispatch(doGetAccountAction({
            ...account, // Keep existing account data (tokens, etc.)
            ...userInfo, // Update with fresh user data
            avatarUrl: uploadResult.filePath, // Ensure new avatar is set
            user: userInfo.user, // Include nested user object if exists
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('Upload avatar thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const customRequest = ({ file, onSuccess }) => {
    handleUpload(file);
    onSuccess('ok');
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Spin spinning={loading}>
        <Avatar
          size={size}
          src={avatarUrl}
          icon={<UserOutlined />}
        />
      </Spin>

      {showUploadButton && (
        <Upload
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          accept="image/*"
        >
          <Tooltip title="Thay đổi avatar">
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                boxShadow: 2,
              }}
              size="small"
            >
              <CameraOutlined style={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Upload>
      )}
    </Box>
  );
};

export default AvatarUpload;
