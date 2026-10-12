import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBlogStore } from '../store/useBlogStore';
import { ROUTE_PATHS } from '../constants';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '../components/Button';
import Card from '../components/Card';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';
import { FaPlus, FaExclamationCircle, FaSearch } from 'react-icons/fa';

const BlogListPage = ({ className }) => {
  const { isAdmin, user } = useAuthStore();
  const { posts, isLoading, error, fetchPosts, deletePost } = useBlogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (posts.length > 0) {
      const filtered = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = isAdmin() ? true : post.author.id === user?.id;
        return matchesSearch && matchesRole;
      });
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts([]);
    }
  }, [posts, searchTerm, isAdmin, user]);

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <div className={clsx('min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isAdmin() ? 'All Posts' : 'My Posts'}
          </h1>
          <Link to={`${ROUTE_PATHS.DOCUMENT.replace(':id', 'new')}`}>
            <Button variant="primary">
              <FaPlus className="mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <FaExclamationCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 mb-4">Failed to load posts. Please try again later.</p>
            <Button onClick={fetchPosts}>Retry</Button>
          </Card>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                variant="hoverable"
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600 mb-4">
              {isAdmin() ? 'No posts available yet.' : 'You haven\'t created any posts yet.'}
            </p>
            <Link to={`${ROUTE_PATHS.DOCUMENT.replace(':id', 'new')}`}>
              <Button variant="primary">
                <FaPlus className="mr-2" />
                Create Your First Post
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

BlogListPage.propTypes = {
  className: PropTypes.string
};

export default BlogListPage;