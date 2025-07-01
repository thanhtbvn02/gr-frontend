import React, { useEffect, useState } from 'react';
import axios from 'axios';
import vietnamData from './Vietnam.json';
import './Address.css';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const phoneSchema = Yup.string()
  .matches(/^0\d{9}$/, 'Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số')
  .required('Vui lòng nhập số điện thoại');

const nameSchema = Yup.string().required('Vui lòng nhập tên người nhận');
const addressSchema = Yup.string().required('Vui lòng nhập địa chỉ chi tiết');

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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAddresses();
    setProvinces(vietnamData);
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/addresses/user/${userId}`);
      setAddresses(res.data);
    } catch (err) {
      toast.error('Lỗi khi lấy danh sách địa chỉ!');
    }
  };

  const setAsDefault = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/addresses/${id}/default`);
      fetchAddresses();
      toast.success('Đã đặt làm địa chỉ mặc định!');
    } catch {
      toast.error('Không thể đặt mặc định!');
    }
  };

  const deleteAddress = async (id) => {
    const target = addresses.find(addr => addr.id === id);
    if (target?.is_default) {
      toast.warn('Không thể xóa địa chỉ mặc định.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/addresses/${id}`);
        fetchAddresses();
        toast.success('Xóa địa chỉ thành công!');
      } catch {
        toast.error('Không thể xóa địa chỉ');
      }
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsDefault(false);
    setModalOpen(true);
    setErrors({});
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
    setErrors({});

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
    setErrors({});
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

  const validateForm = async () => {
    try {
      await phoneSchema.validate(phone);
      await nameSchema.validate(recipientName);
      await addressSchema.validate(detailAddress);
      if (!selectedProvince) throw new Error('Vui lòng chọn Tỉnh/Thành phố');
      if (!selectedDistrict) throw new Error('Vui lòng chọn Quận/Huyện');
      if (!selectedWard) throw new Error('Vui lòng chọn Phường/Xã');
      setErrors({});
      return true;
    } catch (err) {
      let errorObj = {};
      if (err.path === undefined || err.name === 'Error') {
        errorObj.general = err.message;
      } else {
        errorObj[err.path] = err.message;
      }
      setErrors(errorObj);
      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      toast.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }
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
        await axios.put(`http://localhost:5000/api/addresses/${editingAddressId}`, data);
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        await axios.post('http://localhost:5000/api/addresses', data);
        toast.success('Thêm địa chỉ thành công!');
      }
      setModalOpen(false);
      fetchAddresses();
    } catch {
      toast.error('Không thể lưu địa chỉ');
    }
  };

  return (
    <div className="address-container">
      <ToastContainer position="top-center" autoClose={1600} />
      <h2>Quản lý địa chỉ</h2>
      <button className="btn-primary" onClick={openAddModal}>+ Thêm địa chỉ mới</button>
      {addresses.map((addr) => (
        <div key={addr.id} className={`address-card${addr.is_default ? ' address-default' : ''}`}>
          <label>
            <input
              type="radio"
              checked={addr.is_default}
              onChange={() => setAsDefault(addr.id)}
            />
            Mặc định
          </label>
          <div className="address-title"><strong>{addr.recipient_name}</strong> - {addr.phone}</div>
          <div className="address-desc">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</div>
          <div className="address-actions">
            <button className="btn-update" onClick={() => openEditModal(addr)}>Cập nhật</button>
            <button className="btn-delete" onClick={() => deleteAddress(addr.id)}>Xóa</button>
          </div>
        </div>
      ))}
      {modalOpen && (
        <div className="modalChangeInfor">
          <div className="overlay" onClick={() => setModalOpen(false)}></div>
          <div className="modalContent">
            <h3>{isEditMode ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}</h3>
            <div className="formGroup">
              <label>Tên người nhận</label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Tên người nhận"
                className={errors.recipientName ? 'input-error' : ''}
              />
              {errors.recipientName && <div className="error-message">{errors.recipientName}</div>}
              <label>Số điện thoại</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
                className={errors.phone ? 'input-error' : ''}
                maxLength={10}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
              <label>Tỉnh/Thành phố</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className={errors.general && selectedProvince === '' ? 'input-error' : ''}
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinces.map((province) => (
                  <option key={province.name} value={province.name}>{province.name}</option>
                ))}
              </select>
              <label>Quận/Huyện</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedProvince}
                className={errors.general && selectedDistrict === '' ? 'input-error' : ''}
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map((district) => (
                  <option key={district.name} value={district.name}>{district.name}</option>
                ))}
              </select>
              <label>Phường/Xã</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                disabled={!selectedDistrict}
                className={errors.general && selectedWard === '' ? 'input-error' : ''}
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map((ward) => (
                  <option key={ward.name} value={ward.name}>{ward.name}</option>
                ))}
              </select>
              <label>Địa chỉ chi tiết</label>
              <input
                type="text"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="Số nhà, tên đường"
                className={errors.detailAddress ? 'input-error' : ''}
              />
              {errors.detailAddress && <div className="error-message">{errors.detailAddress}</div>}
              <label className="default-checkbox">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Đặt làm mặc định
              </label>
              {errors.general && <div className="error-message">{errors.general}</div>}
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
