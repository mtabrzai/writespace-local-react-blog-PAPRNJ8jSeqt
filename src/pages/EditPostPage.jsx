import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBlogStore } from '../store/useBlogStore';
import { ROUTE_PATHS, APP_CONSTANTS } from '../constants';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '../components/Button';
import Card from '../components/Card';
import { FaArrowLeft, FaExclamationCircle, FaSave, FaRocket } from 'react-icons/fa';

const EditPostPage = ({ className }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { currentPost, isLoading, error, fetchPost, updatePost, clearCurrentPost, clearError } = useBlogStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(ROUTE_PATHS.LOGIN, { state: { from: window.location.pathname } });
    }
    fetchPost(id);
    return () => {
      clearCurrentPost();
    };
  }, [id, isAuthenticated, navigate, fetchPost, clearCurrentPost]);

  useEffect(() => {
    if (currentPost) {
      setTitle(currentPost.title);
      setContent(currentPost.content);
      setIsAuthor(currentPost.author.id === user?.id);
    }
  }, [currentPost, user]);

  const validateForm = () => {
    let isValid = true;
    setTitleError('');
    setContentError('');

    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else if (title.length > APP_CONSTANTS.MAX_DOCUMENT_TITLE_LENGTH) {
      setTitleError(`Title must be less than ${APP_CONSTANTS.MAX_DOCUMENT_TITLE_LENGTH} characters`);
      isValid = false;
    }

    if (!content.trim()) {
      setContentError('Content is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    if (!isAuthor) {
      setTitleError('You are not authorized to edit this post');
      return;
    }

    try {
      await updatePost(id, {
        title,
        content,
        status: publish ? 'published' : currentPost.status
      });

      navigate(`${ROUTE_PATHS.DOCUMENT.replace(':id', id)}`);
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  const handleSaveDraft = (e) => {
    handleSubmit(e, false);
  };

  const handlePublish = (e) => {
    handleSubmit(e, true);
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
          <Link to={`${ROUTE_PATHS.DOCUMENT.replace(':id', id)}`}>
            <Button variant="ghost" size="small">
              <FaArrowLeft className="mr-2" />
              Back to Post
            </Button>
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className={clsx(
                  'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                  titleError ? 'border-red-300' : 'border-gray-300'
                )}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading || !isAuthor}
                maxLength={APP_CONSTANTS.MAX_DOCUMENT_TITLE_LENGTH}
              />
              {titleError && (
                <p className="mt-1 text-sm text-red-600">{titleError}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {title.length}/{APP_CONSTANTS.MAX_DOCUMENT_TITLE_LENGTH} characters
              </p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={15}
                className={clsx(
                  'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                  contentError ? 'border-red-300' : 'border-gray-300'
                )}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading || !isAuthor}
              />
              {contentError && (
                <p className="mt-1 text-sm text-red-600">{contentError}</p>
              )}
            </div>

            {isAuthor ? (
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  <FaSave className="mr-2" />
                  Save
                </Button>
                {currentPost.status !== 'published' && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handlePublish}
                    disabled={isLoading}
                  >
                    <FaRocket className="mr-2" />
                    {isLoading ? 'Publishing...' : 'Publish'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You are not authorized to edit this post.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

EditPostPage.propTypes = {
  className: PropTypes.string
};

export default EditPostPage;