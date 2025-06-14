import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../../../components/SideBar/SideBar";
import { MdDelete } from "react-icons/md";
import "./UpdateProduct.css";

const TABS = ["Thông tin chung", "Thuộc tính", "Thành phần"];
const MULTILINE_FIELDS = [
  "description", // Mô tả
  "uses", // Công dụng
  "how_use", // Cách dùng
  "side_effects", // Tác dụng phụ
  "notes", // Ghi chú
  "preserve", // Bảo quản
];

const editableFields = ["name", "unit", "price", ...MULTILINE_FIELDS, "stock"];

// Hàm hiển thị label tiếng Việt cho các trường
const getFieldLabel = (field) => {
  switch (field) {
    case "name":
      return "Tên sản phẩm";
    case "unit":
      return "Đơn vị";
    case "price":
      return "Giá";
    case "description":
      return "Mô tả";
    case "uses":
      return "Công dụng";
    case "how_use":
      return "Cách dùng";
    case "side_effects":
      return "Tác dụng phụ";
    case "notes":
      return "Ghi chú";
    case "preserve":
      return "Bảo quản";
    case "stock":
      return "Tồn kho";
    default:
      return field;
  }
};

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [product, setProduct] = useState({});
  const [details, setDetails] = useState([{ key_name: "", value: "" }]);
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        setProduct(productRes.data);
        const detailRes = await axios.get(
          `http://localhost:5000/api/details?product_id=${id}`
        );
        setDetails(
          detailRes.data.length > 0
            ? detailRes.data
            : [{ key_name: "", value: "" }]
        );
        const ingredientRes = await axios.get(
          `http://localhost:5000/api/ingredients?product_id=${id}`
        );
        setIngredients(
          ingredientRes.data.length > 0
            ? ingredientRes.data
            : [{ name: "", quantity: "" }]
        );
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

  const addDetail = () => setDetails([...details, { key_name: "", value: "" }]);
  const addIngredient = () =>
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  const removeDetail = (index) =>
    setDetails(details.filter((_, i) => i !== index));
  const removeIngredient = (index) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, {
        ...product,
        details,
        ingredients,
      });
      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Lỗi khi cập nhật sản phẩm");
    }
  };

  // Tab: Thông tin chung
  const renderGeneralInfo = () => (
    <div className="tab-content">
      {editableFields.map((field) => (
        <div key={field} className="input-group">
          <label>{getFieldLabel(field)}</label>
          {MULTILINE_FIELDS.includes(field) ? (
            <textarea
              name={field}
              className="no-border-input"
              rows={4}
              placeholder={"Nhập " + getFieldLabel(field).toLowerCase()}
              value={product[field] || ""}
              onChange={handleInputChange}
            />
          ) : (
            <input
              type="text"
              name={field}
              className="no-border-input"
              placeholder={"Nhập " + getFieldLabel(field).toLowerCase()}
              value={product[field] || ""}
              onChange={handleInputChange}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Tab: Thuộc tính
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
                  placeholder="Tên thuộc tính"
                  value={detail.key_name}
                  onChange={(e) =>
                    handleDetailChange(index, "key_name", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className="no-border-input"
                  placeholder="Giá trị"
                  value={detail.value}
                  onChange={(e) =>
                    handleDetailChange(index, "value", e.target.value)
                  }
                />
              </td>
              <td>
                <MdDelete
                  className="delete-icon"
                  onClick={() => removeDetail(index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button" onClick={addDetail}>
        +
      </button>
    </div>
  );

  // Tab: Thành phần
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
                  placeholder="Tên thành phần"
                  value={ingredient.name}
                  onChange={(e) =>
                    handleIngredientChange(index, "name", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className="no-border-input"
                  placeholder="Tỉ lệ"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    handleIngredientChange(index, "quantity", e.target.value)
                  }
                />
              </td>
              <td>
                <MdDelete
                  className="delete-icon"
                  onClick={() => removeIngredient(index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button" onClick={addIngredient}>
        +
      </button>
    </div>
  );

  return (
    <div className="add-product-page">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <div className="add-product-container">
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
            {activeTab === "Thuộc tính" && renderDetails()}
            {activeTab === "Thành phần" && renderIngredients()}
          </div>
          <button className="update-button" onClick={handleUpdate}>
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
