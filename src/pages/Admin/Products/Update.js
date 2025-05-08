import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [details, setDetails] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  // Danh sách các trường muốn hiển thị để chỉnh sửa
  const editableFields = [
    'name', 'unit', 'price', 'description',
    'uses', 'how_use', 'side_effects',
    'notes', 'preserve', 'stock', 'category_name'
  ];


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);

      const detailRes = await axios.get(`http://localhost:5000/api/detail?product_id=${id}`);
      setDetails(detailRes.data);

      const ingredientRes = await axios.get(`http://localhost:5000/api/ingredient?product_id=${id}`);
      setIngredients(ingredientRes.data);
      } catch (err) {
        console.error('Không thể lấy thông tin sản phẩm:', err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, product);
      alert('Cập nhật thành công!');
      navigate('/');
    } catch (err) {
      console.error('Cập nhật thất bại:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto',ontFamily: 'inherit' }}>
      <h2>Cập nhật sản phẩm</h2>

      {editableFields.map((key) => (
        <div key={key} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>{key}</label>

          <textarea
              name={key}
              value={product[key] || ''}
              onChange={handleChange}
              style={{ width: '500px', padding: '20px', minHeight: '100px', ontFamily: 'inherit' }}
            />
        </div>
      ))}

      {details.length > 0 && (
        <table border="1" style={{ width: '100%', marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Thuộc tính</th>
              <th>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, index) => (
              <tr key={index}>
                <td>{detail.key_name}</td>
                <td>{detail.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {ingredients.length > 0 && (
        <table border="1" style={{ width: '100%', marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Thành phần</th>
              <th>Tỉ lệ</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => (
              <tr key={index}>
                <td>{ingredient.name}</td>
                <td>{ingredient.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    <button style={{ padding: '10px 20px' }}>
        <Link to={`/`}>Back</Link>
      </button>

      <button onClick={handleUpdate} style={{ padding: '10px 20px' }}>
        Cập nhật
      </button>
    </div>
  );
};

export default UpdateProduct;
