import axios from "../until/customize-axios";


export let getDestinationById = async (id) => {
  try {
    const response = await axios.get(`/destinations/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getImagesDestination = async (id) => {
  try {
    const response = await axios.get(`/destination-images/destination/${id}`);
    return response.result;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getImageRoom = async (id) => {
  try {
    const response = await axios.get(`/room-images/room/${id}`);
    return response.result;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getAmenities = async (id) => {
  try {
    const response = await axios.get(`/destination-amenity/destination/${id}`);
    return response.result;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getRoomsByDestinationId = async (id) => {
  try {
    const response = await axios.get(`/rooms/destination/${id}`);
    return response.result;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getRoomById = async (id) => {
  try {
    const response = await axios.get(`/rooms/${id}`);
    return response.result;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const getFullAmenities = async () => {
  try {
    const response = await axios.get(`/amenities`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const getFilterRoom = async (
  sleeps,
  startDate,
  endDate,
  quantity,
  destinationId
) => {
  try {
    const response = await axios.get(`/rooms/available`, {
      params: {
        sleeps: sleeps,
        startDate: startDate,
        endDate: endDate,
        quantity: quantity,
        destinationId: destinationId,
      },
    });
    return response.result;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getReviews = async (id) => {
  try {
    const response = await axios.get(`/reviews/destination/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getCountReview = async (id) => {
  try {
    const response = await axios.get(`/reviews/count/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}