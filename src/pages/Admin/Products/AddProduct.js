import React, { useState, useEffect } from 'react';
import SideBar from '../../../components/SideBar/SideBar';
import categoryTree from './Category-tree.json';
import { MdDelete } from 'react-icons/md';
import axios from 'axios';
import './AddProduct.css';

const TABS = ["Thông tin chung", "Detail", "Ingredient"];
const MULTILINE_FIELDS = ["description", "uses", "how_use", "side_effects", "notes", "preserve"];

function AddProduct() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  const [activeTab, setActiveTab] = useState(TABS[0]);

  // State cho form data
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    price: '',
    description: '',
    uses: '',
    how_use: '',
    side_effects: '',
    notes: '',
    preserve: '',
    stock: ''
  });

  // State cho details và ingredients
  const [details, setDetails] = useState([{ key_name: '', value: '' }]);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }]);

  const editableFields = [
    "name", "unit", "price",
    ...MULTILINE_FIELDS,
    "stock"
  ];

  useEffect(() => {
    setCategories(categoryTree);
  }, []);

  useEffect(() => {
    const foundCategory = categories.find(category => category.name === selectedCategory);
    if (foundCategory) {
      setSubCategories(foundCategory.children);
      setSelectedSubCategory('');
      setSubSubCategories([]);
      setSelectedSubSubCategory('');
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    const foundSubCategory = subCategories.find(sub => sub.name === selectedSubCategory);
    if (foundSubCategory) {
      setSubSubCategories(foundSubCategory.children);
      setSelectedSubSubCategory('');
    }
  }, [selectedSubCategory, subCategories]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };

  const handleSubSubCategoryChange = (e) => {
    setSelectedSubSubCategory(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    setDetails(newDetails);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addDetail = () => {
    setDetails([...details, { key_name: '', value: '' }]);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const removeDetail = (index) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async () => {
    try {
      // Tìm category_id từ cây danh mục
      let categoryId = null;
      if (selectedSubSubCategory) {
        const subSubCat = subSubCategories.find(cat => cat.name === selectedSubSubCategory);
        categoryId = subSubCat?.id;
      } else if (selectedSubCategory) {
        const subCat = subCategories.find(cat => cat.name === selectedSubCategory);
        categoryId = subCat?.id;
      } else if (selectedCategory) {
        const cat = categories.find(cat => cat.name === selectedCategory);
        categoryId = cat?.id;
      }

      if (!categoryId) {
        alert('Vui lòng chọn danh mục sản phẩm');
        return;
      }

      // Tạo sản phẩm mới
      const productResponse = await axios.post('http://localhost:5000/api/products', {
        ...formData,
        category_id: categoryId
      });

      const productId = productResponse.data.product.id;

      // Thêm details
      for (const detail of details) {
        if (detail.key_name && detail.value) {
          await axios.post('http://localhost:5000/api/details', {
            product_id: productId,
            key_name: detail.key_name,
            value: detail.value || ''
          });
        }
      }

      // Thêm ingredients
      for (const ingredient of ingredients) {
        if (ingredient.name && ingredient.quantity) {
          await axios.post('http://localhost:5000/api/ingredients', {
            product_id: productId,
            name: ingredient.name,
            quantity: ingredient.quantity || ''
          });
        }
      }

      alert('Thêm sản phẩm thành công!');
      // Reset form
      setFormData({
        name: '',
        unit: '',
        price: '',
        description: '',
        uses: '',
        how_use: '',
        side_effects: '',
        notes: '',
        preserve: '',
        stock: ''
      });
      setDetails([{ key_name: '', value: '' }]);
      setIngredients([{ name: '', quantity: '' }]);
      setSelectedCategory('');
      setSelectedSubCategory('');
      setSelectedSubSubCategory('');

    } catch (error) {
      console.error('Error adding product:', error);
      alert('Có lỗi xảy ra khi thêm sản phẩm');
    }
  };

  // add thông tin mới 
  const renderAddGeneralInfo = () => (
    <div className="tab-content">
      {editableFields.map((field) => (
        <div key={field} className="input-group">
          <label>{field}</label>
          {MULTILINE_FIELDS.includes(field) ? (
            <textarea 
              name={field} 
              className="no-border-input" 
              rows={4}
              value={formData[field]}
              onChange={handleInputChange}
            />
          ) : (
            <input 
              type="text" 
              name={field} 
              className="no-border-input"
              value={formData[field]}
              onChange={handleInputChange}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderAddDetail = () => (
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
      <button className="add-button" onClick={addDetail}>+</button>
    </div>
  )

  const renderAddIngredient = () => (
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
      <button className="add-button" onClick={addIngredient}>+</button>
    </div>
  )

  return (
    <div className="add-product-page">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <div className="add-product-container">
          <h2>Thêm sản phẩm</h2>

          <div className="form-group">
            <label>Danh mục</label>
            <select value={selectedCategory} onChange={handleCategoryChange} className="select-input">
              <option value="">-- Chọn Danh mục --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Gồm</label>
            <select value={selectedSubCategory} onChange={handleSubCategoryChange} className="select-input" disabled={!selectedCategory}>
              <option value="">-- Chọn Danh mục con --</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.name}>{subCategory.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Gồm</label>
            <select value={selectedSubSubCategory} onChange={handleSubSubCategoryChange} className="select-input" disabled={!selectedSubCategory}>
              <option value="">-- Chọn Danh mục con con --</option>
              {subSubCategories.map((subSubCategory) => (
                <option key={subSubCategory.id} value={subSubCategory.name}>{subSubCategory.name}</option>
              ))}
            </select>
          </div>
        </div>
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
          {activeTab === "Thông tin chung" && renderAddGeneralInfo()}
          {activeTab === "Detail" && renderAddDetail()}
          {activeTab === "Ingredient" && renderAddIngredient()}
        </div>
        <button className="update-button" onClick={handleSubmit}>Thêm mới</button>
      </div>
    </div>
  );
}

export default AddProduct;
