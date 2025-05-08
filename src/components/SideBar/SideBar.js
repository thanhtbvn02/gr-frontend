import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideBar.css';

export default function SideBar() {
  return (
    <nav className="sidebar-nav">
      <div className="sidebar-logo">DRUG STORE</div>
      <NavLink to="users" className="nav-link">
        Manage Users
      </NavLink>
      <NavLink to="products" className="nav-link">
        Manage Products
      </NavLink>
      {/* Thêm link nếu cần */}
    </nav>
  );
}

