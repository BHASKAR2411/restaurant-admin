import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import '../styles/QRCode.css';

const QRCode = () => {
  const { user } = useContext(AuthContext);
  const [tableNo, setTableNo] = useState('');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState('');

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/tables`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTables(res.data);
    } catch (error) {
      toast.error('Failed to fetch tables');
    }
  };

  useEffect(() => {
    fetchTables();

    if (!user?.upiId || !user?.googleReviewLink) {
      setAlert('Please add UPI ID and Google Review Link in Account settings to generate QR codes.');
    } else {
      setAlert('');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNo || isNaN(tableNo) || tableNo <= 0) {
      toast.error('Please enter a valid table number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/tables/generate-qr`,
        { tableNo: parseInt(tableNo) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      await fetchTables(); // Refetch tables after creation
      setTableNo('');
      toast.success('QR code generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/tables/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      await fetchTables(); // Refetch tables after deletion
      toast.success('QR code deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete QR code');
    }
    setLoading(false);
  };

  const handlePrint = (tableNo, qrCode) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .print-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            img {
              width: 200px;
              height: 200px;
              margin-top: 10px;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h2>Table ${tableNo}</h2>
            <h3>${user.restaurantName}</h3>
            <img src="${qrCode}" alt="QR Code" />
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="qrcode-container">
      <Sidebar />
      <div className="qrcode-content">
        {loading && <LoadingSpinner />}
        <h2>Generate QR Codes</h2>
        {alert && <p className="alert">{alert}</p>}
        <form onSubmit={handleSubmit} className="qrcode-form">
          <input
            type="number"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            placeholder="Table Number"
            disabled={!!alert}
            required
          />
          <button type="submit" disabled={!!alert}>
            Generate QR
          </button>
        </form>
        <div className="qr-list">
          {tables.map((table) => (
            <div key={table.id} className="qr-item">
              <p>Table {table.tableNo}</p>
              <img src={table.qrCode} alt={`QR for Table ${table.tableNo}`} />
              <div className="qr-actions">
                <button
                  onClick={() => handlePrint(table.tableNo, table.qrCode)}
                  style={{ backgroundColor: '#28a745', color: 'white', marginRight: '5px' }}
                >
                  Print
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  style={{ backgroundColor: '#ff4444', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRCode;