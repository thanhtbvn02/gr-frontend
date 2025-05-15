import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SideBar.css';

export default function SideBar() {
  const navigate = useNavigate();
  
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-logo" onClick={() => handleNavigate('/admin')}>
        DRUG STORE
      </div>
      <div className="nav-link" onClick={() => handleNavigate('/admin/users')}>
        Manage Users
      </div>
      <div className="nav-link" onClick={() => handleNavigate('/admin/products')}>
        Manage Products
      </div>
      <div className="nav-link">
        Manage Orders
      </div>
    </nav>
  );
}
