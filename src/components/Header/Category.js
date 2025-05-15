import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Category.css';

export default function Category({ onCategorySelect }) {
  const [tree, setTree] = useState([]);
  const [activeRoot, setActiveRoot] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const navigate = useNavigate();

  // 1) Lấy cả cây category cùng counts
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/category/tree-with-counts');
        setTree(res.data);
      } catch (err) {
        console.error('Error loading category tree:', err);
      }
    };
    fetchTree();
  }, []);

  // 2) Tính các cấp con dựa vào activeRoot/activeSub
  const roots = tree;
  const subs = activeRoot
    ? (tree.find(r => r.id === activeRoot)?.children || [])
    : [];
  const thirds = activeSub
    ? (subs.find(s => s.id === activeSub)?.children || [])
    : [];

  // 3) Handlers
  const onRootEnter = id => {
    setActiveRoot(id);
    setActiveSub(null);
  };
  const onSubEnter = id => setActiveSub(id);
  const onClickCategory = id => {
    if (onCategorySelect) {
      onCategorySelect(id);
    } else {
      navigate(`/search?category_id=${id}`);
    }
  };

  return (
    <div className="category-menu">
      {/* Top-level nav */}
      <ul className="category-top-nav">
        {roots.map(root => (
          <li
            key={root.id}
            onMouseEnter={() => onRootEnter(root.id)}
            onClick={() => onClickCategory(root.id)}
          >
            <span className="name">{root.name}</span>
            <i className="arrow" />
          </li>
        ))}
      </ul>

      {/* Dropdown */}
      <div
        className={`category-dropdown ${activeRoot ? 'open' : ''}`}
        onMouseLeave={() => {
          setActiveRoot(null);
          setActiveSub(null);
        }}
      >
        <div className="dropdown-inner">
          {/* Left panel: second-level */}
          <nav className="dropdown-left">
            <ul>
              {subs.map(sub => (
                <li
                  key={sub.id}
                  onMouseEnter={() => onSubEnter(sub.id)}
                  onClick={() => onClickCategory(sub.id)}
                >
                  {sub.name}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right panel: third-level cards */}
          <section className="dropdown-right">
            {thirds.map(th => (
              <div
                key={th.id}
                className="third-card"
                onClick={() => onClickCategory(th.id)}
              >
                <span className="third-name">{th.name}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
