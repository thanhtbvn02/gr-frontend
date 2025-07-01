import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../../../components/SideBar/SideBar";
import { MdDelete } from "react-icons/md";
import "./UpdateProduct.css";
import useProduct from "../../../hooks/useProduct";
import { toast } from "react-toastify";

const MAX_IMAGES = 4; // Thay đổi nếu muốn tối đa nhiều/ít hơn
const TABS = ["Thông tin chung", "Thuộc tính", "Thành phần"];
const MULTILINE_FIELDS = [
  "description",
  "uses",
  "how_use",
  "side_effects",
  "notes",
  "preserve",
];

const editableFields = ["name", "unit", "price", ...MULTILINE_FIELDS, "stock"];

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
  const { getProductById } = useProduct();

  // --- State cho images: mỗi phần tử { url, file }
  const [imageUrls, setImageUrls] = useState(Array(MAX_IMAGES).fill(null));
  const [uploadingIdx, setUploadingIdx] = useState(-1);

  // Load dữ liệu sản phẩm + ảnh cũ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(productData);

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

        // Lấy ảnh cũ
        const imageRes = await axios.get(
          `http://localhost:5000/api/images?product_id=${id}`
        );
        const imgsArray = Array(MAX_IMAGES).fill(null);
        imageRes.data.slice(0, MAX_IMAGES).forEach((img, i) => {
          imgsArray[i] = { url: img.url, file: null };
        });
        setImageUrls(imgsArray);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [id, getProductById]);

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

  // Xử lý chọn/xoá ảnh
  const handleImageChange = (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...imageUrls];
      updated[idx] = { url: reader.result, file }; // preview + file
      setImageUrls(updated);
      setUploadingIdx(-1);
    };
    reader.readAsDataURL(file);
  };
  const handleDeleteImage = (idx) => {
    const updated = [...imageUrls];
    updated[idx] = null;
    setImageUrls(updated);
  };

  // Gửi formData khi update
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      Object.entries(product).forEach(([key, value]) =>
        formData.append(key, value)
      );
      // Đẩy detail, ingredient lên nếu cần
      formData.append("details", JSON.stringify(details));
      formData.append("ingredients", JSON.stringify(ingredients));

      // Xử lý file và url ảnh
      const urlsToKeep = [];
      imageUrls.forEach((img) => {
        if (img) {
          if (img.file) {
            formData.append("images", img.file);
          } else if (img.url) {
            urlsToKeep.push(img.url);
          }
        }
      });
      urlsToKeep.forEach((url) => formData.append("images", url));

      await axios.put(
        `http://localhost:5000/api/products/update-with-images/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Lỗi khi cập nhật sản phẩm");
    }
  };

  const renderImageInputs = () => (
    <div className="form-group image-upload-group">
      <div className="image-grid">
        {imageUrls.map((img, idx) => (
          <div
            key={idx}
            className="image-upload-update"
            style={{ position: "relative" }}
            onClick={() => document.getElementById(`img-input-${idx}`).click()}
          >
            {uploadingIdx === idx ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#3498db",
                }}
              >
                Đang tải...
              </div>
            ) : img && img.url ? (
              <>
                <img
                  src={img.url}
                  alt={`preview-${idx}`}
                  className="image-preview"
                />
                <MdDelete
                  className="delete-icon"
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    fontSize: 22,
                    zIndex: 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(idx);
                  }}
                />
              </>
            ) : (
              <span className="plus-sign">+</span>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              id={`img-input-${idx}`}
              onChange={(e) => handleImageChange(idx, e.target.files[0])}
            />
          </div>
        ))}
      </div>
    </div>
  );

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
          {renderImageInputs()}
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
