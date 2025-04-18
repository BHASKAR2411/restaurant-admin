import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import OrderTable from '../components/OrderTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import '../styles/Orders.css';

const Orders = () => {
  const [liveOrders, setLiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [liveRes, pastRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/orders/live`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/orders/past`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setLiveOrders(liveRes.data);
        setPastOrders(pastRes.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch orders');
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleComplete = async (id) => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setLiveOrders(liveOrders.filter((order) => order.id !== id));
      setPastOrders([...pastOrders, res.data]);
      toast.success('Order marked as complete');
    } catch (error) {
      toast.error('Failed to complete order');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/orders/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setLiveOrders(liveOrders.filter((order) => order.id !== id));
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error('Failed to delete order');
    }
    setLoading(false);
  };

  return (
    <div className="orders-container">
      <Sidebar />
      <div className="orders-content">
        {loading && <LoadingSpinner />}
        <h2>Orders</h2>
        <OrderTable title="Live Orders" orders={liveOrders} onComplete={handleComplete} onDelete={handleDelete} />
        <OrderTable title="Past Orders" orders={pastOrders} />
      </div>
    </div>
  );
};

export default Orders;