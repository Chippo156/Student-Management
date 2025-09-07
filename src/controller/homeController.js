import axios from "../until/customize-axios";

export const handleGetDestination = async () => {
  try {
    const response = await axios.get(`/destinations?page=1&size=10`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const handleGetFavoriteDestination = async (itemPerpageTour) => {
  try {
    const response = await axios.get(`/tours?page=1&size=${itemPerpageTour}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}