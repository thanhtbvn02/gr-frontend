import React, { useState, useEffect } from 'react';
import SideBar from '../../components/SideBar/SideBar';
import './Dashboard.css';
import axios from 'axios';

const CategoryItem = ({ node, level }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="category-item">
      <div 
        className="category-header" 
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={toggleExpand}
      >
        <div className="category-name">
          {node.children && node.children.length > 0 && (
            <span className="expand-icon">{expanded ? '▼' : '►'}</span>
          )}
          {node.name}
        </div>
        <div className="category-count">{node.count}</div>
      </div>
      
      {expanded && node.children && node.children.length > 0 && (
        <div className="category-children">
          {node.children.map(child => (
            <CategoryItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [userStats, setUserStats] = useState({ total: 0, admins: 0, users: 0 });
  const [categoryTree, setCategoryTree] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userTotal, userAdmins, userNormal, products] = await Promise.all([
          axios.get('http://localhost:5000/api/users/count'),
          axios.get('http://localhost:5000/api/users/count/admin'),
          axios.get('http://localhost:5000/api/users/count/user'),
          axios.get('http://localhost:5000/api/products/count')
        ]);

        setUserStats({
          total: userTotal.data.count,
          admins: userAdmins.data.count,
          users: userNormal.data.count
        });
        setTotalProducts(products.data.count);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  // Fetch category tree with aggregated counts
  useEffect(() => {
    const fetchCategoryTree = async () => {
      try {
        const { data: tree } = await axios.get('http://localhost:5000/api/category/tree-with-counts');
        setCategoryTree(tree);
      } catch (err) {
        console.error('Error loading category tree with counts:', err);
      }
    };

    fetchCategoryTree();
  }, []);

  return (
    <div className="admin-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <h1>Dashboard</h1>
        
        <div className="stats-card">
          <h2>User Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total Users</h3>
              <div className="stat-value">{userStats.total}</div>
            </div>
            <div className="stat-item">
              <h3>Admins</h3>
              <div className="stat-value">{userStats.admins}</div>
            </div>
            <div className="stat-item">
              <h3>Users</h3>
              <div className="stat-value">{userStats.users}</div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h2>Product Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total Products</h3>
              <div className="stat-value">{totalProducts}</div>
            </div>
          </div>
        </div>

        <div className="category-tree-container">
          <h2>Categories</h2>
          <div className="category-tree">
            {categoryTree.map(node => (
              <CategoryItem key={node.id} node={node} level={0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
