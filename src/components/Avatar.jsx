import PropTypes from 'prop-types';
import clsx from 'clsx';
import { FaCrown } from 'react-icons/fa';

const Avatar = ({ user, size = 'medium', className }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-sm';
      case 'large':
        return 'w-16 h-16 text-2xl';
      case 'medium':
      default:
        return 'w-12 h-12 text-lg';
    }
  };

  const getInitials = () => {
    if (!user?.username) return '?';
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className={clsx('relative inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium', getSizeClasses(), className)}>
      <span>{getInitials()}</span>
      {user?.role === 'admin' && (
        <FaCrown
          className="absolute -top-1 -right-1 text-yellow-500"
          size={size === 'small' ? 10 : size === 'large' ? 20 : 14}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['user', 'admin']).isRequired
  }),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};

export default Avatar;