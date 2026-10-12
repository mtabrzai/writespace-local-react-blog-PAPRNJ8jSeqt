import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTE_PATHS } from './constants';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RouteGuard from './components/RouteGuard';
import Navbar from './components/Navbar';
import PropTypes from 'prop-types';

const AppRoutes = [
  {
    path: ROUTE_PATHS.HOME,
    element: <LandingPage />,
  },
  {
    path: ROUTE_PATHS.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTE_PATHS.DASHBOARD,
    element: (
      <RouteGuard>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <BlogListPage />
        </div>
      </RouteGuard>
    ),
  },
  {
    path: ROUTE_PATHS.DOCUMENT,
    element: (
      <RouteGuard>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <BlogPostPage />
        </div>
      </RouteGuard>
    ),
  },
  {
    path: `${ROUTE_PATHS.DOCUMENT.replace(':id', 'new')}`,
    element: (
      <RouteGuard>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <CreatePostPage />
        </div>
      </RouteGuard>
    ),
  },
  {
    path: `${ROUTE_PATHS.DOCUMENT}/edit`,
    element: (
      <RouteGuard>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <EditPostPage />
        </div>
      </RouteGuard>
    ),
  },
  {
    path: ROUTE_PATHS.ADMIN,
    element: (
      <RouteGuard roles={['admin']}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <AdminDashboardPage />
        </div>
      </RouteGuard>
    ),
  },
];

const router = createBrowserRouter(AppRoutes);

const App = () => {
  return <RouterProvider router={router} />;
};

App.propTypes = {};

export default App;