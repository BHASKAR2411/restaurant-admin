import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ dailyOrders: 0, monthlyOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(res.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch stats');
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        {loading && <LoadingSpinner />}
        <h1>{user.restaurantName}</h1>
        <h2>Welcome, {user.ownerName || user.owner_name || 'Owner'}</h2>
        <div className="stats-boxes">
          <div className="stats-box">
            <h3>Daily Orders</h3>
            <p>{stats.dailyOrders}</p>
          </div>
          <div className="stats-box">
            <h3>Monthly Orders</h3>
            <p>{stats.monthlyOrders}</p>
          </div>
          <div className="stats-box">
            <h3>Today's Date</h3>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <Link to="/orders" className="view-orders-btn">
          View Orders
        </Link>
        <footer className="page-footer">
          Powered by SAE. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;