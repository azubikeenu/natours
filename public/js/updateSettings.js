/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const updateProfile = async (type, object) => {
 const endPoint = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe';
  try {
   const res =  await axios({
      method: 'PATCH',
      url: endPoint,
      data: object,
    });

    if (res.data.status === 'Success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
