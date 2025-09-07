import axios from "../until/customize-axios";

export const getFilterDestination = async (city, param,location) => {
  try {
    if (city === "Other") {
      if (param) {
        let res;
        if(location){
          res = await axios(`/destinations/filter?location=${location}${param ? `${param}` : ""}`);
        }else{
          res = await axios(`/destinations/filter?${param}`);
        }
        return res;
      } else {
        const res = await axios(`/destinations/filter?page=1&size=10`);
        return res;
      }
    }
    const res = await axios(
      `/destinations/filter?location=${city}${param ? `${param}` : ""}`
    );
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const getImageDestination = async (id) => {
  try {
    const res = await axios(`destination-images/destination/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const getFilterTour = async (param) => {
  try {
    const res = await axios(`/tours/filter?${param}`);
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
}