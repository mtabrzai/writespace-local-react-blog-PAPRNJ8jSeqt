import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBlogStore } from '../store/useBlogStore';
import { ROUTE_PATHS } from '../constants';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '../components/Button';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import { FaEdit, FaTrash, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';

const BlogPostPage = ({ className }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const { currentPost, isLoading, error, fetchPost, deletePost, clearCurrentPost } = useBlogStore();
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    fetchPost(id);
    return () => {
      clearCurrentPost();
    };
  }, [id, fetchPost, clearCurrentPost]);

  useEffect(() => {
    if (currentPost && user) {
      setIsAuthor(currentPost.author.id === user.id || isAdmin());
    }
  }, [currentPost, user, isAdmin]);

  const handleDelete = async () => {
    try {
      await deletePost(id);
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={clsx('min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8', className)}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8', className)}>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <FaExclamationCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 mb-4">Failed to load post. Please try again later.</p>
            <Button onClick={() => fetchPost(id)}>Retry</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className={clsx('min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8', className)}>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <p className="text-gray-600">Post not found.</p>
            <Link to={ROUTE_PATHS.DASHBOARD} className="mt-4 inline-block">
              <Button variant="secondary">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to={ROUTE_PATHS.DASHBOARD}>
            <Button variant="ghost" size="small">
              <FaArrowLeft className="mr-2" />
              Back to Posts
            </Button>
          </Link>
        </div>

        <Card className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <Avatar user={currentPost.author} size="large" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentPost.title}</h1>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <FaCalendarAlt className="mr-1" />
                  <span>Published on {formatDate(currentPost.createdAt)}</span>
                </div>
              </div>
            </div>
            {isAuthor && (
              <div className="flex space-x-2">
                <Link to={`/posts/${currentPost.id}/edit`}>
                  <Button variant="secondary" size="small">
                    <FaEdit className="mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="small"
                  onClick={handleDelete}
                >
                  <FaTrash className="mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-3">
              <Avatar user={currentPost.author} size="small" />
              <div>
                <p className="font-medium text-gray-900">{currentPost.author.username}</p>
                <p className="text-sm text-gray-500">
                  {currentPost.author.role === 'admin' ? 'Administrator' : 'Author'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

BlogPostPage.propTypes = {
  className: PropTypes.string
};

export default BlogPostPage;