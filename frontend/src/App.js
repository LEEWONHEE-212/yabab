import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import OwnerPage from './pages/OwnerPage';
import AddRestaurantPage from './pages/AddRestaurantPage';
import StadiumPage from './pages/StadiumPage';
import FeedPage from './pages/FeedPage';
import MyPage from './pages/MyPage';

function App() {
  return (
      <Routes>
        <Route path='/auth/*' element={<AuthPage />} />
        <Route path='/' element={<MainPage />} />
        <Route path='/owner' element={<OwnerPage />} />
        <Route path='/add-AddRestaurant' element={<AddRestaurantPage/>} />

        <Route path='/stadium' element={<StadiumPage />} />
        <Route path='/feed/*' element={<FeedPage />} />
        <Route path='/stadium/:stadiumId' element={<StadiumPage />} />
        <Route path='/myPage' element={<MyPage />} />
      </Routes>
  );
}

export default App;
