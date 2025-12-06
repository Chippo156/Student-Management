import axios from '../utils/customize-axios';
import { toast } from '../utils/toast';

const fileService = {
  /**
   * Upload file (image, document, etc.) - Multipart form
   */
  uploadFile: async (file, uploadedByUserId) => {
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('UploadedByUserId', uploadedByUserId);

      const response = await axios.post('/api/File/Upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Upload file thất bại');
        }
        return null;
      }

      toast.success('Upload file thành công!');
      // Return file info from response
      return {
        fileName: response.data.fileName,
        fileType: response.data.fileType,
        filePath: response.data.filePath,
        uploadedBy: response.data.uploadedBy,
        uploadedAt: response.data.uploadedAt,
      };
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Upload file failed');
        }
      } else {
        toast.error(error.message || 'Upload file failed');
      }
      return null;
    }
  },
};

export default fileService;
