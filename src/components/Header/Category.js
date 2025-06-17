

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Category.css";
import categoryData from "./Category_tree.json";


import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as DiIcons from "react-icons/di";
import * as FaIcons from "react-icons/fa";
import * as GiIcons from "react-icons/gi";
import * as IoIcons from "react-icons/io";
import * as Io5Icons from "react-icons/io5";
import * as MdIcons from "react-icons/md";
import * as PiIcons from "react-icons/pi";
import * as RiIcons from "react-icons/ri";
import * as TbIcons from "react-icons/tb";
import * as TiIcons from "react-icons/ti";
import * as CgIcons from "react-icons/cg";
import * as SiIcons from "react-icons/si";

const iconLibs = {
  Ai: AiIcons, Bs: BsIcons, Di: DiIcons, Fa: FaIcons, Gi: GiIcons,
  Io: IoIcons, Io5: Io5Icons, Md: MdIcons, Pi: PiIcons, Ri: RiIcons,
  Tb: TbIcons, Ti: TiIcons, Cg: CgIcons, Si: SiIcons,
};

function getIcon(iconName) {
  if (!iconName) return null;
  const libKey = iconName.slice(0, 3);
  const lib = iconLibs[libKey] || iconLibs[iconName.slice(0, 2)];
  if (!lib) return null;
  const Icon = lib[iconName];
  return Icon ? <Icon className="category-icon" /> : null;
}


export default function Category({ onCategorySelect }) {
  const [tree, setTree] = useState([]);
  const [activeRoot, setActiveRoot] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTree(categoryData);
  }, []);

  const roots = tree;
  const subs = activeRoot
    ? tree.find((r) => r.id === activeRoot)?.children || []
    : [];
  const thirds = activeSub
    ? subs.find((s) => s.id === activeSub)?.children || []
    : [];

  const onRootEnter = (id) => {
    setActiveRoot(id);
    setActiveSub(null);
  };
  const onSubEnter = (id) => setActiveSub(id);
  const onClickCategory = (id) => {
    if (onCategorySelect) {
      onCategorySelect(id);
    } else {
      navigate(`/search?category_id=${id}`);
    }
  };

  return (
    <div className="category-menu">
      <ul className="category-top-nav">
        {roots.map((root) => (
          <li
            key={root.id}
            onMouseEnter={() => onRootEnter(root.id)}
            onClick={() => onClickCategory(root.id)}
          >
            {getIcon(root.icon)}
            <span className="name">{root.name}</span>
            <i className="arrow" />
          </li>
        ))}
      </ul>

      <div
        className={`category-dropdown ${activeRoot ? "open" : ""}`}
        onMouseLeave={() => {
          setActiveRoot(null);
          setActiveSub(null);
        }}
      >
        <div className="dropdown-inner">
          <nav className="dropdown-left">
            <ul>
              {subs.map((sub) => (
                <li
                  key={sub.id}
                  onMouseEnter={() => onSubEnter(sub.id)}
                  onClick={() => onClickCategory(sub.id)}
                >
                  {getIcon(sub.icon)}
                  <span>{sub.name}</span>
                </li>
              ))}
            </ul>
          </nav>

          <section className="dropdown-right">
            {thirds.map((th) => (
              <div
                key={th.id}
                className="third-card"
                onClick={() => onClickCategory(th.id)}
              >
                {getIcon(th.icon)}
                <span className="third-name">{th.name}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
