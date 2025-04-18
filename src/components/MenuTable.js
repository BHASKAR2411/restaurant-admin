import React from 'react';
import '../styles/Menu.css';

const MenuTable = ({ menuItems, onDelete }) => {
  return (
    <div className="menu-table">
      <h3>Menu Items</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Name</th>
            <th>Veg/Non-Veg</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.length === 0 ? (
            <tr>
              <td colSpan={6}>No menu items</td>
            </tr>
          ) : (
            menuItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.category}</td>
                <td>{item.name}</td>
                <td>{item.isVeg ? 'Veg' : 'Non-Veg'}</td>
                <td>₹{item.price.toFixed(2)}</td>
                <td>
                  <button onClick={() => onDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MenuTable;