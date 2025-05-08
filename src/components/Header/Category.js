import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './home.css';

const TopNav = ({ items, activeId, onHover, onClick }) => (
  <nav className="top-nav">
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          className={item.id === activeId ? 'active' : ''}
          onMouseEnter={() => onHover(item.id)}
          onClick={() => onClick(item.id)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  </nav>
);

export default function Category() {
  const [roots, setRoots]             = useState([]);
  const [subs, setSubs]               = useState([]);
  const [thirds, setThirds]           = useState([]);
  const [activeRoot, setActiveRoot]   = useState(null);
  const [activeSub, setActiveSub]     = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Load root categories once
  useEffect(() => {
    axios.get('http://localhost:5000/api/category')
      .then(res => setRoots(res.data))
      .catch(err => console.error('Load roots error:', err));
  }, []);

  // Load subs when activeRoot changes
  useEffect(() => {
    if (activeRoot == null) {
      setSubs([]);
      setActiveSub(null);
      return;
    }
    axios.get(`http://localhost:5000/api/category/${activeRoot}`)
      .then(res => setSubs(res.data))
      .catch(err => console.error('Load subs error:', err));
  }, [activeRoot]);

  // Load thirds when activeSub changes
  useEffect(() => {
    if (activeSub == null) {
      setThirds([]);
      return;
    }
    axios.get(`http://localhost:5000/api/category/${activeSub}`)
      .then(res => setThirds(res.data))
      .catch(err => console.error('Load thirds error:', err));
  }, [activeSub]);

  // Handlers
  const handleRootHover = id => setActiveRoot(id);
  const handleSubHover  = id => setActiveSub(id);
  const handleSearch    = id => navigate(`/search?category_id=${id}`);

  return (
    <div className="home-container">
      {/* Dropdown wrapper: hover leaves hides all */}
      <div
        className="menu-dropdown"
        onMouseLeave={() => {
          setActiveRoot(null);
          setActiveSub(null);
        }}
      >
        {/* Top-level navigation */}
        <TopNav
          items={roots}
          activeId={activeRoot}
          onHover={handleRootHover}
          onClick={handleSearch}
        />

        {/* Sub-menu + third-level layout container */}
        {activeRoot && subs.length > 0 && (
          <div className="submenu-container">
            {/* Second level */}
            <aside className="sub-panel">
              <ul className="sub-list">
                {subs.map(sub => (
                  <li
                    key={sub.id}
                    className={sub.id === activeSub ? 'active' : ''}
                    onMouseEnter={() => handleSubHover(sub.id)}
                    onClick={() => handleSearch(sub.id)}
                  >
                    {sub.name}
                  </li>
                ))}
              </ul>
            </aside>

            {/* Third level, appears to right of sub-panel */}
            {activeSub && thirds.length > 0 && (
              <section className="third-grid">
                {thirds.map(th => (
                  <div
                    key={th.id}
                    className="third-card"
                    onClick={() => handleSearch(th.id)}
                  >
                    {th.name}
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
