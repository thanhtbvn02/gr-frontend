import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SideBar.css';
import { MdSell } from "react-icons/md";
import { FaProductHunt } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";


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
        <FaRegUser />
        Manage Users
      </div>
      <div className="nav-link" onClick={() => handleNavigate('/admin/products')}>
        <FaProductHunt />
        Manage Products
      </div>
      <div className="nav-link" onClick={() => handleNavigate('/admin/orders')}>
        <MdSell />
        Manage Orders
      </div>
    </nav>
  );
}
