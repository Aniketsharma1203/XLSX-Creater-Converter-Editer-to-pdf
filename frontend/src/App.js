import './App.css';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Home';
import Data from './Data';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/data' element={<Data />} />
      </Routes>

    </>
  );
}

export default App;
