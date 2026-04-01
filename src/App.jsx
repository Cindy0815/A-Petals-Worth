import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Session from './pages/Session';
import CreateFlower from './pages/CreateFlower';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/session/:roomId" element={<Session />} />
        <Route path="/session/:roomId/create" element={<CreateFlower />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
