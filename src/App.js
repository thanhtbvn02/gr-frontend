import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Fragment } from 'react';
import {
  SearchResults,
  Add,
  Update,
  Dashboard
}from './pages/Admin';

import {
  Home,
  ProductInformation,
  Login,
  Register,
  LoginSuccess
} from './pages/Home'

import {
  Information
} from './pages/User'

function App() {
  return (
    <div className="App">
      <Fragment> 
        <BrowserRouter>
        <Routes>
          <Route path="/add" element={<Add />} />
          <Route path="/update/:id" element={<Update />} />
          <Route path='/productInfor/:id' element={<ProductInformation />} />
          <Route path='/search' element={<SearchResults />} />
          {/* <Route path='/home' element={<Main />} /> */}
          <Route path='/infor/:id' element={<Information />} />
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login-success' element={<LoginSuccess />} />
          <Route path='/admin' element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      </Fragment>
      
    </div>
  );
}

export default App;
