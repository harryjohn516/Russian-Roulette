import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Game } from './pages/Game';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;