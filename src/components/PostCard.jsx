import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaCalendarAlt } from 'react-icons/fa';
import Card from './Card';
import Button from './Button';
import Avatar from './Avatar';

const PostCard = ({
  post,
  variant = 'default',
  showActions = true,
  className,
  onDelete,
  ...props
}) => {
  const getStatusBadge = () => {
    switch (post.status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card variant={variant} className={clsx('p-6', className)} {...props}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Avatar user={post.author} size="small" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <FaCalendarAlt className="mr-1" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>

      <div className="prose prose-sm max-w-none mb-6">
        <p className="text-gray-600">
          {post.content.length > 200
            ? `${post.content.substring(0, 200)}...`
            : post.content}
        </p>
      </div>

      {showActions && (
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Link to={`/posts/${post.id}`}>
              <Button variant="ghost" size="small">
                <FaEye className="mr-2" />
                View
              </Button>
            </Link>
            <Link to={`/posts/${post.id}/edit`}>
              <Button variant="secondary" size="small">
                <FaEdit className="mr-2" />
                Edit
              </Button>
            </Link>
          </div>
          <Button
            variant="danger"
            size="small"
            onClick={() => onDelete(post.id)}
          >
            <FaTrash className="mr-2" />
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['draft', 'published', 'archived']).isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      username: PropTypes.string.isRequired,
      role: PropTypes.oneOf(['user', 'admin']).isRequired
    }).isRequired
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'hoverable', 'outlined']),
  showActions: PropTypes.bool,
  className: PropTypes.string,
  onDelete: PropTypes.func
};

export default PostCard;