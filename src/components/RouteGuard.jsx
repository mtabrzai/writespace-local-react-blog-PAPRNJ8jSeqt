import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTE_PATHS } from '../constants';

const RouteGuard = ({ children, roles = [] }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  if (roles.length > 0) {
    const userRole = isAdmin() ? 'admin' : 'user';
    if (!roles.includes(userRole)) {
      return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
    }
  }

  return children;
};

RouteGuard.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.oneOf(['user', 'admin']))
};

export default RouteGuard;