import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import OwnerPage from './pages/OwnerPage';
import AddRestaurantPage from './pages/AddRestaurantPage';
import StadiumPage from './pages/StadiumPage';
import FeedPage from './pages/FeedPage';

function App() {
  return (
      <Routes>
        <Route path='/auth/*' element={<AuthPage />} />
        <Route path='/' element={<MainPage />} />
        <Route path='/owner' element={<OwnerPage />} />
        <Route path='/add-AddRestaurant' element={<AddRestaurantPage/>} />
<<<<<<< HEAD
        <Route path='/stadium' element={<StadiumPage />} />
        <Route path='/feed/*' element={<FeedPage />} />
=======
        <Route path='/stadium/:stadiumId' element={<StadiumPage />} />
>>>>>>> 66f5af3 (예약하기 기능추가)
      </Routes>
  );
}

export default App;
