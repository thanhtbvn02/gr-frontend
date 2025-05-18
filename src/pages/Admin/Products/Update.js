import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../../../components/SideBar/SideBar";
import { MdDelete } from 'react-icons/md';
import "./Update.css";

const TABS = ["Thông tin chung", "Detail", "Ingredient"];
const MULTILINE_FIELDS = ["description", "uses", "how_use", "side_effects", "notes", "preserve"];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [product, setProduct] = useState({});
  const [details, setDetails] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const editableFields = [
    "name", "unit", "price",
    ...MULTILINE_FIELDS,
    "stock"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get(`https://gr-backend.onrender.com/api/products/${id}`);
        setProduct(productRes.data);
        const detailRes = await axios.get(`https://gr-backend.onrender.com/api/details?product_id=${id}`);
        setDetails(detailRes.data);
        const ingredientRes = await axios.get(`https://gr-backend.onrender.com/api/ingredients?product_id=${id}`);
        setIngredients(ingredientRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index, field, value) => {
    const updated = [...details];
    updated[index][field] = value;
    setDetails(updated);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };
  
  const handleAddDetail = () => {
    setDetails([...details, { key_name: "", value: "" }]);
  };
  
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };
  
  const handleDeleteDetail = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleDeleteIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`https://gr-backend.onrender.com/api/products/${id}`, {
        ...product,
        details,
        ingredients
      });
      alert('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Lỗi khi cập nhật sản phẩm');
    }
  };

  const renderGeneralInfo = () => (
    <div className="tab-content">
      {editableFields.map((field) => (
        <div key={field} className="input-group">
          <label>{field}</label>
          {MULTILINE_FIELDS.includes(field) ? (
            <textarea
              name={field}
              className="no-border-input"
              rows={4}
              value={product[field] || ""}
              onChange={handleInputChange}
            />
          ) : (
            <input
              type="text"
              name={field}
              className="no-border-input"
              value={product[field] || ""}
              onChange={handleInputChange}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderDetails = () => (
    <div className="tab-content">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Thuộc tính</th>
            <th>Giá trị</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  className="no-border-input"
                  value={detail.key_name}
                  onChange={(e) => handleDetailChange(index, 'key_name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="no-border-input"
                  value={detail.value}
                  onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                />
              </td>
              <td><MdDelete className="delete-icon" onClick={() => handleDeleteDetail(index)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button" onClick={handleAddDetail}>+</button>
    </div>
  );

  const renderIngredients = () => (
    <div className="tab-content">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Thành phần</th>
            <th>Tỉ lệ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  className="no-border-input"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="no-border-input"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                />
              </td>
              <td><MdDelete className="delete-icon" onClick={() => handleDeleteIngredient(index)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button" onClick={handleAddIngredient}>+</button>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <div className="update-container">
          <h2>Cập nhật sản phẩm</h2>
          <div className="tab-nav">
            {TABS.map((tab) => (
              <div
                key={tab}
                className={`tab-item ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="tab-content-container">
            {activeTab === "Thông tin chung" && renderGeneralInfo()}
            {activeTab === "Detail" && renderDetails()}
            {activeTab === "Ingredient" && renderIngredients()}
          </div>
          <button className="update-button" onClick={handleUpdate}>Cập nhật</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;