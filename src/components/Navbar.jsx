import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTE_PATHS } from '../constants';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Navbar = ({ className }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const { token } = useAuthStore.getState();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTE_PATHS.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={clsx('bg-white shadow-sm border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to={ROUTE_PATHS.HOME}
              className="flex-shrink-0 flex items-center text-xl font-bold text-gray-900"
            >
              Writespace
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                {isAdmin() && (
                  <Link
                    to={ROUTE_PATHS.ADMIN}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to={ROUTE_PATHS.DASHBOARD}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Logout
                </button>
                <div className="flex items-center">
                  <div className="ml-3 relative">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user?.username}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to={ROUTE_PATHS.LOGIN}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  className: PropTypes.string
};

export default Navbar;