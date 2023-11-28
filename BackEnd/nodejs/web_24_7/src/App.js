import './App.css';
import Login from './pages/Login';
import Join from './pages/Join';
import Index from './pages/Index';
import { Route, Routes } from 'react-router-dom';
import { createContext, useState } from 'react';

export const Trainer = createContext();

function App() {
  const [trainerInfo, setTrainerInfo] = useState({});

  return (
    <div className='wrap'>
      <Trainer.Provider value={{ trainerInfo, setTrainerInfo }}>
        <Routes>
          {!trainerInfo.email ? (
            <Route path='/' element={<Login />} />
          ) : (
            <Route path='/' element={<Index />} />
          )}
          <Route path='/join' element={<Join />} />
        </Routes>
      </Trainer.Provider>
    </div>
  );
}

export default App;
