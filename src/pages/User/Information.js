import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import vietnamData from './Vietnam.json';
import './Information.css';

const Information = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [modalChangeInfor, setModalChangeInfor] = useState(false);
  const [modalChangePass, setModalChangePass] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    birth_date: '',
    phone: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  useEffect(() => {
    setProvinces(vietnamData);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(res.data);
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
          full_name: res.data.full_name || '',
          birth_date: res.data.birth_date || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
      } catch (err) {
        console.error('Không thể lấy thông tin người dùng:', err);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);

    const province = vietnamData.find((p) => p.name === provinceName);
    setDistricts(province ? province.districts : []);
    setSelectedDistrict('');
    setWards([]);
    setSelectedWard('');
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);

    const district = districts.find((d) => d.name === districtName);
    setWards(district ? district.wards.map((w) => ({ name: w })) : []);
    setSelectedWard('');
  };

  const handleWardChange = (e) => {
    setSelectedWard(e.target.value);
  };

  const handleUpdate = async () => {
    let fullAddress = user.address; 
  
    if (detailAddress || selectedWard || selectedDistrict || selectedProvince) {
      fullAddress = `${detailAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`.trim();
    }
  
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${id}`, {
        ...formData,
        address: fullAddress
      });
      console.log(res.data);
      setModalChangeInfor(false);
      setUser({ ...user, ...formData, address: fullAddress });
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Lỗi update user:', err);
      alert('Có lỗi xảy ra khi cập nhật.');
    }
  };  

  const toggleModalChangeInfor = () => {
    if (!modalChangeInfor && user && user.address) {
      const parts = user.address.split(',').map(p => p.trim());
  
      setDetailAddress(parts[0] || '');
      setSelectedWard(parts[1] || '');
      setSelectedDistrict(parts[2] || '');
      setSelectedProvince(parts[3] || '');
  
      const provinceData = vietnamData.find((p) => p.name === parts[3]);
      setDistricts(provinceData ? provinceData.districts : []);
  
      const districtData = provinceData?.districts.find((d) => d.name === parts[2]);
      setWards(districtData ? districtData.wards.map((w) => ({ name: w })) : []);
    }
    setModalChangeInfor(!modalChangeInfor);
  };
  

  const toggleModalChangePass = () => {
    setModalChangePass(!modalChangePass);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng nhập đầy đủ các trường.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/users/${id}/change-password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      console.log(res.data);
      alert('Đổi mật khẩu thành công!');
      setModalChangePass(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  if (!user) {
    return <div>Đang tải thông tin...</div>;
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  

  return (
    <div className="user-information">
      <h2>Thông tin người dùng</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Họ tên:</strong> {user.full_name}</p>
      <p><strong>Ngày sinh:</strong> {formatDate(user.birth_date)}</p>
      <p><strong>Số điện thoại:</strong> {user.phone}</p>
      <p><strong>Địa chỉ:</strong> {user.address}</p>
      <div>
        <button onClick={toggleModalChangeInfor}>Thay đổi thông tin</button>
        <button onClick={toggleModalChangePass}>Đổi mật khẩu</button>
      </div>

      {modalChangeInfor && (
        <div className="modalChangeInfor">
          <div className="overlay" onClick={toggleModalChangeInfor}></div>
          <div className="modalContent">
            <h3>Chỉnh sửa thông tin</h3>
            <div className="formGroup">
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Username" />
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
              <label>Họ tên</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Họ tên" />
              <label>Ngày sinh</label>
              <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} />
              <label>Số điện thoại</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Số điện thoại" />

              <label>Tỉnh/Thành phố</label>
              <select value={selectedProvince} onChange={handleProvinceChange}>
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinces.map((province) => (
                  <option key={province.name} value={province.name}>{province.name}</option>
                ))}
              </select>

              <label>Quận/Huyện</label>
              <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince}>
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map((district) => (
                  <option key={district.name} value={district.name}>{district.name}</option>
                ))}
              </select>

              <label>Phường/Xã</label>
              <select value={selectedWard} onChange={handleWardChange} disabled={!selectedDistrict}>
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map((ward) => (
                  <option key={ward.name} value={ward.name}>{ward.name}</option>
                ))}
              </select>

              <label>Địa chỉ chi tiết</label>
              <input type="text" name="detailAddress" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="Nhập số nhà, tên đường" />
            </div>
            <div className="buttonGroup">
              <button className="saveBtn" onClick={handleUpdate}>Lưu thay đổi</button>
              <button className="cancelBtn" onClick={toggleModalChangeInfor}>Hủy</button>
            </div>
          </div>
        </div>
      )}

    {modalChangePass && (
        <div className="modalChangePass">
          <div className="overlay1" onClick={toggleModalChangePass}></div>
          <div className="modalContent">
            <h3>Đổi mật khẩu</h3>
            <div className="formGroup">
                <div className="inputWithIcon">
                    <input
                    type={showPassword.oldPassword ? "text" : "password"}
                    name="oldPassword"
                    placeholder="Mật khẩu cũ"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    />
                    <span onClick={() => toggleShowPassword('oldPassword')}>
                    {showPassword.oldPassword ? '👁️' : '🙈'}
                    </span>
                </div>

                <div className="inputWithIcon">
                    <input
                    type={showPassword.newPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Mật khẩu mới"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    />
                    <span onClick={() => toggleShowPassword('newPassword')}>
                    {showPassword.newPassword ? '👁️' : '🙈'}
                    </span>
                </div>

                <div className="inputWithIcon">
                    <input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu mới"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    />
                    <span onClick={() => toggleShowPassword('confirmPassword')}>
                    {showPassword.confirmPassword ? '👁️' : '🙈'}
                    </span>
                </div>
                </div>
            <div className="buttonGroup">
              <button className="saveBtn" onClick={handleChangePassword}>Lưu</button>
              <button className="cancelBtn" onClick={toggleModalChangePass}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Information;
