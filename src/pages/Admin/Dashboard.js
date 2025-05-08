// src/pages/Admin/Dashboard.js
import React from 'react';
import SideBar from '../../components/SideBar/SideBar';
import ManageProduct from './Products/ManageProduct';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="admin-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <ManageProduct />
      </div>
    </div>
  );
}

export default Dashboard;
