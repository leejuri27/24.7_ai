import './App.css';
import Login from './pages/Login';
import Join from './pages/Join'
import Index from './pages/Index';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className='wrap'>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/main' element={<Index/>} />
        <Route path='/join' element={<Join/>} />
      </Routes>
    </div>
  );
}

export default App;
