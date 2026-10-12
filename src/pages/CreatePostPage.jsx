import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBlogStore } from '../store/useBlogStore';
import { ROUTE_PATHS, APP_CONSTANTS } from '../constants';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '../components/Button';
import Card from '../components/Card';
import { FaArrowLeft, FaExclamationCircle, FaSave, FaRocket } from 'react-icons/fa';

const CreatePostPage = ({ className }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { createPost, isLoading, error, clearError } = useBlogStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(ROUTE_PATHS.LOGIN, { state: { from: window.location.pathname } });
    }
  }, [isAuthenticated, navigate]);

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

    try {
      const post = await createPost({
        title,
        content,
        status: publish ? 'published' : 'draft'
      });

      navigate(`${ROUTE_PATHS.DOCUMENT.replace(':id', post.id)}`);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleSaveDraft = (e) => {
    handleSubmit(e, false);
  };

  const handlePublish = (e) => {
    handleSubmit(e, true);
  };

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

        <Card className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>

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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              {contentError && (
                <p className="mt-1 text-sm text-red-600">{contentError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                <FaSave className="mr-2" />
                Save Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handlePublish}
                disabled={isLoading}
              >
                <FaRocket className="mr-2" />
                {isLoading ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

CreatePostPage.propTypes = {
  className: PropTypes.string
};

export default CreatePostPage;