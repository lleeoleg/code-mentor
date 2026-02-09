import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import CourseLearn from './pages/CourseLearn';
import MyLearning from './pages/MyLearning';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import WhatsNew from './pages/WhatsNew';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="courses"
              element={
                <ProtectedRoute>
                  <CourseList />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/:id"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/:id/learn"
              element={
                <ProtectedRoute>
                  <CourseLearn />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-learning"
              element={
                <ProtectedRoute>
                  <MyLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/email"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/social"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/social-links"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/password"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/details"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="whats-new"
              element={
                <ProtectedRoute>
                  <WhatsNew />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}
