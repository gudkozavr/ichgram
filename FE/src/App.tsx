import { Route, Routes, Navigate } from 'react-router-dom';
import Menu from './components/menu';
import Login from './pages/login';
import SignIn from './pages/signIn';
import AccountRecovery from './pages/accountRecovery';
import NewPassPage from './pages/newPass';
import Home from './pages/home';
import Search from './pages/search';
import Explore from './pages/explore';
import Messages from './pages/messages';
import Notification from './pages/notification';

import Profile from './pages/profile';
import UpdateProfileInfo from './pages/updateProfileInfo';
import ModalData from './pages/create';



function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {

  return (
    
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignIn />} />
      <Route path="/forgot-password" element={<AccountRecovery />} />
      <Route path="/reset-password" element={<NewPassPage />} />

      {/* Приватные маршруты */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout  />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

// Отдельный компонент для приватных страниц
function MainLayout() {
  return (
    <div className="flex h-screen ">
      <Menu />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/create" element={<ModalData />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/profile-info" element={<UpdateProfileInfo />} />
          <Route path="/create/share" element={<ModalData />} />
          
         
        </Routes>
      </div>
    </div>
  );
}

export default App;
