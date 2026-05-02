import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import SubNav from './components/SubNav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import TagResultsSection from './pages/TagResultsSection';
import HomePage from './pages/HomePage';
import TechPage from './pages/TechPage';
import HorizonsPage from './pages/HorizonsPage';
import SocialPage from './pages/SocialPage';
import PodcastPage from './pages/PodcastPage';
import ArticlePage from './pages/ArticlePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EpisodePage from './pages/EpisodePage';
import ReelPage from './pages/ReelPage';
import LoginPageUsears from './pages/LoginPageUsears';
import AllArticlesPage from './pages/AllArticlesPage';
import DocumentaryPage from './pages/DocumentaryPage';   // ← جديد

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <i className="fa-solid fa-spinner fa-spin text-[#CCF47F] text-3xl" />
    </div>
  );
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"              element={<><Header /><SubNav /><HomePage /><Footer /><ScrollToTop /></>} />
      <Route path="/tech"          element={<><Header /><SubNav /><TechPage /><Footer /><ScrollToTop /></>} />
      <Route path="/horizons"      element={<><Header /><SubNav /><HorizonsPage /><Footer /><ScrollToTop /></>} />
      <Route path="/social"        element={<><Header /><SubNav /><SocialPage /><Footer /><ScrollToTop /></>} />
      <Route path="/podcast"       element={<><Header /><SubNav /><PodcastPage /><Footer /><ScrollToTop /></>} />
      <Route path="/documentary"   element={<><Header /><SubNav /><DocumentaryPage /><Footer /><ScrollToTop /></>} />  {/* ← جديد */}
      <Route path="/tag-results"   element={<><Header /><SubNav /><TagResultsSection /><Footer /><ScrollToTop /></>} />
      <Route path="/article/:id"   element={<><Header /><ArticlePage /><Footer /></>} />
      <Route path="/podcast/:id"   element={<><Header /><EpisodePage /><Footer /></>} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/login-usears"  element={<LoginPageUsears />} />
      <Route path="/register"      element={<RegisterPage />} />
      <Route path="/articles"      element={<><Header /><SubNav /><AllArticlesPage /><Footer /><ScrollToTop /></>} />
      <Route path="/reel/:id"      element={<><Header /><ReelPage /><Footer /></>} />

      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div
            className="bg-[#161616] min-h-screen text-[#FCF2ED] overflow-x-hidden w-full"
            style={{ fontFamily: "'Ko Sans', sans-serif" }}
          >
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;