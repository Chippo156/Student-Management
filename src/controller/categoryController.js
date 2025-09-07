import axios from "../until/customize-axios";

export const getAllCategory = async () => {
    try {
        const response = await axios.get('/categories');
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
};