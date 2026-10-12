import PropTypes from 'prop-types';
import clsx from 'clsx';

const Card = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'hoverable':
        return 'transition-shadow duration-200 hover:shadow-md';
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
        'bg-white rounded-lg overflow-hidden',
        getVariantClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'hoverable', 'outlined']),
  className: PropTypes.string
};

export default Card;