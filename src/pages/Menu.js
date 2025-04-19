import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as yup from 'yup';
import Sidebar from '../components/Sidebar';
import MenuTable from '../components/MenuTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import '../styles/Menu.css';

const schema = yup.object().shape({
  category: yup.string().required('Category is required'),
  name: yup.string().required('Name is required'),
  isVeg: yup.boolean().required('Veg/non-veg status is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
});

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({ category: '', name: '', isVeg: true, price: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/menu?restaurantId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(res.data);
      } catch (error) {
        toast.error('Failed to fetch menu');
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'radio' ? value === 'true' : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await schema.validate(formData, { abortEarly: false });
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/menu`,
        { ...formData, price: parseFloat(formData.price) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMenuItems([...menuItems, res.data]);
      setFormData({ category: '', name: '', isVeg: true, price: '' });
      toast.success('Menu item added');
    } catch (error) {
      if (error.name === 'ValidationError') {
        error.inner.forEach((err) => toast.error(err.message));
      } else {
        toast.error('Failed to add menu item');
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/menu/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMenuItems(menuItems.filter((item) => item.id !== id));
      toast.success('Menu item deleted');
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
    setLoading(false);
  };

  return (
    <div className="menu-container">
      <Sidebar />
      <div className="menu-content">
        {loading && <LoadingSpinner />}
        <h2>Menu Management</h2>
        <form onSubmit={handleSubmit} className="menu-form">
          <input
            type="text"
            name="category"
            placeholder="Category (e.g., Appetizer)"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="isVeg"
                value="true"
                checked={formData.isVeg}
                onChange={handleChange}
              />
              Veg
            </label>
            <label>
              <input
                type="radio"
                name="isVeg"
                value="false"
                checked={!formData.isVeg}
                onChange={handleChange}
              />
              Non-Veg
            </label>
          </div>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            required
          />
          <button type="submit">Add Item</button>
        </form>
        <MenuTable menuItems={menuItems} onDelete={handleDelete} />
        <footer className="page-footer">
          Powered by SAE. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Menu;