import axios from '../until/customize-axios';

export const familyRelationshipService = {
  getFamilyRelationshipsByStudent: async () => {
    try {
      const response = await axios.get(
        '/api/FamilyRelationship/GetFamilyRelationshipsByStudent'
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get family relationships failed'
      );
    }
  },
};
