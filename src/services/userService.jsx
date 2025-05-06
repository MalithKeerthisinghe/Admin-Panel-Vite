import axios from '../utils/api';

const API_URL = 'http://151.106.125.212:5021/api';

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      withCredentials: false,
    });
    console.log('Users response:', response.data); // Log the response for debugging
    return response.data; // This should now match the backend response format { users: [...] }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export default { getAllUsers };