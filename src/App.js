import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import LayoutWrapper from './components/layout/LayoutWrapper';
import { routes } from './routes/Routes';
import Login from './components/login/Login';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    } else {
      navigate("/login");
    }
    setIsLoading(false); // Data kelgandan keyin loading holatini false qilamiz
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {isLoggedIn ? (
        <Route element={<LayoutWrapper />}>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          <Route path="/*" element={<Navigate to="/login" />} />
        </Route>
      ) : (
        <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      )}
    </Routes>
  );
}

export default App;





