import './App.css';
import MainStadium from './pages/StadiumPage';
import RestaurantPage from './pages/RestaurantPage';
import SignupForm from './components/auth/SignupForm';
import Main from './components/main/Main';
import LoginForm from './components/auth/LoginForm';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import FindIdForm from './components/auth/FindIdForm';
function App() {
  return (
      <Routes>
      {/* <RestaurantPage /> */}
      {/* <MainStadium /> */}
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/findId" element={<FindIdForm />} />
      <Route path='/login' element={<LoginForm />} />
      <Route path='/' element={<MainPage />} />
      </Routes>
  );
}

export default App;
