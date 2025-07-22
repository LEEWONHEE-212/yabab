import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
function App() {
  return (
      <Routes>
        <Route path='/auth/*' element={<AuthPage />} />
        <Route path='/' element={<MainPage />} />
      </Routes>
  );
}

export default App;
