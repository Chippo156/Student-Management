import React, { useState } from 'react';
import { Upload, message, Spin } from 'antd';
import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import fileService from '../service/fileService';
import { authService } from '../service/authService';

const AvatarUpload = ({ currentAvatar, userId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (options) => {
    const { file } = options;

    setUploading(true);
    try {
      // Step 1: Upload file to get file path
      const uploadResult = await fileService.uploadFile(file, userId);

      if (!uploadResult || !uploadResult.filePath) {
        message.error('Upload file thất bại');
        setUploading(false);
        return;
      }

      // Step 2: Update user profile with new avatar URL
      const updateResult = await authService.updateUserProfile({
        avatarUrl: uploadResult.filePath,
      });

      if (updateResult) {
        message.success('Cập nhật ảnh đại diện thành công!');

        // Call parent callback to refresh data
        if (onUploadSuccess) {
          onUploadSuccess(uploadResult.filePath);
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      name="avatar"
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={handleUpload}
      disabled={uploading}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? (
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1,
            }}
          >
            <CameraOutlined style={{ color: 'white', fontSize: 18 }} />
          </div>
        )}
      </div>
    </Upload>
  );
};

export default AvatarUpload;
