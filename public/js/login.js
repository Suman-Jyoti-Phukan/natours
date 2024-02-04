import axios from 'axios';

export async function login(email, password) {
  try {
    const response = await axios.post(
      '/api/v1/users/login',
      {
        email,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    if (response.data.status === 'success') {
      alert('Logged in successfully');

      window.location.assign('/');
    }
  } catch (err) {
    alert(err.message);
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
