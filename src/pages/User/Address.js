import React, { useEffect, useState } from 'react';
import axios from 'axios';
import vietnamData from './Vietnam.json';
import './Address.css';

const AddressManager = () => {
  const userId = localStorage.getItem('userId');
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchAddresses();
    setProvinces(vietnamData);
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`https://gr-backend.onrender.com/api/addresses/user/${userId}`);
      setAddresses(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách địa chỉ:', err);
    }
  };

  const setAsDefault = async (id) => {
    try {
      await axios.put(`https://gr-backend.onrender.com/api/addresses/${id}/default`);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAddress = async (id) => {
    const target = addresses.find(addr => addr.id === id);
    if (target?.is_default) {
      alert('Không thể xóa địa chỉ mặc định.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await axios.delete(`https://gr-backend.onrender.com/api/addresses/${id}`);
        fetchAddresses();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa địa chỉ');
      }
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsDefault(false);
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingAddressId(addr.id);
    setIsEditMode(true);
    setRecipientName(addr.recipient_name);
    setPhone(addr.phone);
    setSelectedProvince(addr.province);
    setSelectedDistrict(addr.district);
    setSelectedWard(addr.ward);
    setDetailAddress(addr.street);
    setIsDefault(addr.is_default);

    const provinceObj = vietnamData.find(p => p.name === addr.province);
    if (provinceObj) {
      setDistricts(provinceObj.districts);
      const districtObj = provinceObj.districts.find(d => d.name === addr.district);
      if (districtObj) {
        setWards(districtObj.wards.map(w => ({ name: w })));
      }
    }

    setModalOpen(true);
  };

  const resetForm = () => {
    setRecipientName('');
    setPhone('');
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setDetailAddress('');
    setIsDefault(false);
    setDistricts([]);
    setWards([]);
  };

  useEffect(() => {
    if (!isEditMode) {
      const province = vietnamData.find((p) => p.name === selectedProvince);
      setDistricts(province ? province.districts : []);
      setSelectedDistrict('');
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (!isEditMode) {
      const district = districts.find((d) => d.name === selectedDistrict);
      setWards(district ? district.wards.map((w) => ({ name: w })) : []);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  const handleSubmit = async () => {
    const data = {
      user_id: userId,
      recipient_name: recipientName,
      phone,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      street: detailAddress,
      is_default: isDefault,
    };

    try {
      if (isEditMode) {
        await axios.put(`https://gr-backend.onrender.com/api/addresses/${editingAddressId}`, data);
      } else {
        await axios.post('https://gr-backend.onrender.com/api/addresses', data);
      }
      setModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert('Không thể lưu địa chỉ');
    }
  };

  return (
    <div className="address-container">
      <h2>Quản lý địa chỉ</h2>
      <button className="btn-primary" onClick={openAddModal}>Thêm địa chỉ mới</button>

      {addresses.map((addr) => (
        <div key={addr.id} className="address-card">
          <label>
            <input
              type="radio"
              checked={addr.is_default}
              onChange={() => setAsDefault(addr.id)}
            />
            Mặc định
          </label>
          <div><strong>{addr.recipient_name}</strong> - {addr.phone}</div>
          <div>{addr.street}, {addr.ward}, {addr.district}, {addr.province}</div>
          <button className="btn-update" onClick={() => openEditModal(addr)}>Cập nhật</button>
          <button className="btn-delete" onClick={() => deleteAddress(addr.id)}>Xóa</button>
        </div>
      ))}

      {modalOpen && (
        <div className="modalChangeInfor">
          <div className="overlay" onClick={() => setModalOpen(false)}></div>
          <div className="modalContent">
            <h3>{isEditMode ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}</h3>
            <div className="formGroup">
              <label>Tên người nhận</label>
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Tên người nhận" />
              <label>Số điện thoại</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" />
              <label>Tỉnh/Thành phố</label>
              <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinces.map((province) => (
                  <option key={province.name} value={province.name}>{province.name}</option>
                ))}
              </select>
              <label>Quận/Huyện</label>
              <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedProvince}>
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map((district) => (
                  <option key={district.name} value={district.name}>{district.name}</option>
                ))}
              </select>
              <label>Phường/Xã</label>
              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict}>
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map((ward) => (
                  <option key={ward.name} value={ward.name}>{ward.name}</option>
                ))}
              </select>
              <label>Địa chỉ chi tiết</label>
              <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="Số nhà, tên đường" />
              <label>
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Đặt làm mặc định
              </label>
            </div>
            <div className="buttonGroup">
              <button className="saveBtn" onClick={handleSubmit}>Lưu</button>
              <button className="cancelBtn" onClick={() => setModalOpen(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
