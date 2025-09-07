import axios from "../until/customize-axios";

export let getAllUsers = async () => {
    try {
        const response = await axios.get(`/users`);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}