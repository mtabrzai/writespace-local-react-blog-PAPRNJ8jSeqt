import PropTypes from 'prop-types';
import clsx from 'clsx';
import { FaRocket, FaLock, FaUsers, FaEdit, FaShareAlt, FaSearch } from 'react-icons/fa';

const iconMap = {
  rocket: FaRocket,
  lock: FaLock,
  users: FaUsers,
  edit: FaEdit,
  share: FaShareAlt,
  search: FaSearch
};

const FeatureCard = ({
  title,
  description,
  icon,
  variant = 'default',
  className,
  ...props
}) => {
  const IconComponent = iconMap[icon] || FaRocket;

  const getVariantClasses = () => {
    switch (variant) {
      case 'hoverable':
        return 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1';
      case 'outlined':
        return 'border border-gray-200';
      case 'default':
      default:
        return 'shadow-sm';
    }
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-lg p-6 flex flex-col items-center text-center',
        getVariantClasses(),
        className
      )}
      {...props}
    >
      <div className="mb-4 p-3 rounded-full bg-blue-50 text-blue-600">
        <IconComponent className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.oneOf(['rocket', 'lock', 'users', 'edit', 'share', 'search']),
  variant: PropTypes.oneOf(['default', 'hoverable', 'outlined']),
  className: PropTypes.string
};

export default FeatureCard;