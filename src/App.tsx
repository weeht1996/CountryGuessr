import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <header>
      </header>
        <Routes>
          <Route path='/' element={<HomePage />}/>
        </Routes>
        <footer>
          <Footer/>
        </footer>
    </div>
  );
}

export default App;
