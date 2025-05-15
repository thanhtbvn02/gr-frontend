import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Fragment, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDispatch } from 'react-redux';
import { initCart } from './redux/addCart';

import {
  SearchResults,
  Add,
  Update,
  Dashboard,
  AddProduct
}from './pages/Admin';

import {
  Home,
  ProductInformation,
  Login,
  Register,
  LoginSuccess
} from './pages/Home'

import {
  Information,
  Cart
} from './pages/User'

import {
  ManageProduct,
  ManageUser
} from './pages/Admin'


function App() {
  const { isLoggedIn: authLoggedIn } = useAuth();
  const dispatch = useDispatch();

  // Khởi tạo giỏ hàng khi ứng dụng khởi động
  useEffect(() => {
    dispatch(initCart());
  }, [dispatch]);

  return (
    <div className="App">
      <Fragment> 
        <BrowserRouter>
        <Routes>
          <Route path="/add" element={<Add />} />
          <Route path="/update/:id" element={<Update />} />
          <Route path='/productInfor/:id' element={<ProductInformation />} />
          <Route path='/search' element={<SearchResults />} />
          <Route path='/infor/:id' element={<Information />} />
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login-success' element={<LoginSuccess />} />
          <Route path='/admin' element={<Dashboard />} />
          <Route path='/admin/products' element={<ManageProduct />} />
          <Route path='/admin/users' element={<ManageUser />} />
          <Route path='/admin/products/add' element={<AddProduct />} />
          <Route path='/cart' element={<Cart />} />
        </Routes>
      </BrowserRouter>
      </Fragment>
    </div>
  );
}

export default App;
