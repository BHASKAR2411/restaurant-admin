import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Account.css';

const schema = yup.object().shape({
  restaurantName: yup.string().required('Restaurant name is required'),
  ownerName: yup.string().required('Owner name is required'),
  upiId: yup
    .string()
    .matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format')
    .nullable(),
  googleReviewLink: yup.string().url('Invalid URL').nullable(),
});

const Account = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    upiId: '',
    googleReviewLink: '',
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        restaurantName: user.restaurantName || '',
        ownerName: user.ownerName || '',
        upiId: user.upiId || '',
        googleReviewLink: user.googleReviewLink || '',
        profilePicture: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture' && files[0]) {
      const file = files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a JPEG, PNG, or GIF image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
    }
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await schema.validate(
        {
          restaurantName: formData.restaurantName,
          ownerName: formData.ownerName,
          upiId: formData.upiId,
          googleReviewLink: formData.googleReviewLink,
        },
        { abortEarly: false }
      );

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value && key !== 'profilePicture') {
          data.append(key, value);
        } else if (key === 'profilePicture' && value) {
          data.append('profilePicture', value);
        }
      });

      const res = await axios.put(`${process.env.REACT_APP_API_URL}/users/account`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      updateUser(res.data);
      toast.success('Account updated successfully');
    } catch (error) {
      if (error.name === 'ValidationError') {
        error.inner.forEach((err) => toast.error(err.message));
      } else {
        toast.error(error.response?.data?.message || 'Failed to update account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-container">
      <Sidebar />
      <div className="account-content">
        {loading && <LoadingSpinner />}
        <h2>Account Settings</h2>
        {user ? (
          <div className="account-layout">
            {/* Left Side: Current User Info */}
            <div className="user-info">
              <div className="profile-picture">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Restaurant Logo"
                    className="restaurant-logo"
                  />
                ) : (
                  <div className="logo-placeholder">
                    <p>No logo uploaded</p>
                  </div>
                )}
              </div>
              <div className="info-item">
                <h4>Restaurant Name</h4>
                <p>{user.restaurantName || 'Not set'}</p>
              </div>
              <div className="info-item">
                <h4>Owner Name</h4>
                <p>{user.ownerName || 'Not set'}</p>
              </div>
              <div className="info-item">
                <h4>UPI ID</h4>
                <p>{user.upiId || 'Not set'}</p>
              </div>
              <div className="info-item">
                <h4>Google Review Link</h4>
                {user.googleReviewLink ? (
                  <a
                    href={user.googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.googleReviewLink}
                  </a>
                ) : (
                  <p>Not set</p>
                )}
              </div>
            </div>

            {/* Right Side: Edit Form */}
            <form onSubmit={handleSubmit} className="account-form">
              <label>
                Restaurant Name
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>
              <label>
                Owner Name
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>
              <label>
                UPI ID
                <input
                  type="text"
                  name="upiId"
                  placeholder="e.g., merchant@upi"
                  value={formData.upiId}
                  onChange={handleChange}
                  disabled={loading}
                />
              </label>
              <label>
                Google Review Link
                <input
                  type="text"
                  name="googleReviewLink"
                  placeholder="e.g., https://g.page/restaurant/review"
                  value={formData.googleReviewLink}
                  onChange={handleChange}
                  disabled={loading}
                />
              </label>
              <label>
                Profile Picture
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleChange}
                  disabled={loading}
                />
              </label>
              {user.profilePicture && (
                <div className="profile-picture-preview">
                  <p>Current Profile Picture:</p>
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              )}
              <button type="submit" disabled={loading}>
                Save Changes
              </button>
            </form>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
        <button className="logout-btn" onClick={logout} disabled={loading}>
          Log Out
        </button>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default Account;