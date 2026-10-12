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
import { FaUsers, FaFileAlt, FaChartBar, FaSearch, FaExclamationCircle, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import RouteGuard from '../components/RouteGuard';

const AdminDashboardPage = ({ className }) => {
  const { isAdmin, user } = useAuthStore();
  const { posts, isLoading, error, fetchPosts, deletePost } = useBlogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    calculateStats();
  }, [fetchPosts]);

  useEffect(() => {
    calculateStats();
    filterPosts();
  }, [posts, searchTerm]);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      setUsersError(error.message || 'Failed to fetch users');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const calculateStats = () => {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.status === 'published').length;
    const draftPosts = posts.filter(post => post.status === 'draft').length;
    setStats({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers: users.length
    });
  };

  const filterPosts = () => {
    if (posts.length > 0) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts([]);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
      setUsersError(err.message || 'Failed to delete user');
    }
  };

  const promoteToAdmin = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to promote user');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === userId ? updatedUser.user : u));
    } catch (err) {
      console.error('Failed to promote user:', err);
      setUsersError(err.message || 'Failed to promote user');
    }
  };

  return (
    <RouteGuard roles={['admin']}>
      <div className={clsx('min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8', className)}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Admin Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                  <FaChartBar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                  <FaFileAlt className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Published Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
                  <FaFileAlt className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Draft Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
                  <FaUsers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search posts, users, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Posts Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">All Posts</h2>
              <Link to={`${ROUTE_PATHS.DOCUMENT.replace(':id', 'new')}`}>
                <Button variant="primary">
                  <FaPlus className="mr-2" />
                  New Post
                </Button>
              </Link>
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
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600">No posts found matching your search.</p>
              </Card>
            )}
          </div>

          {/* Users Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>

            {isUsersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : usersError ? (
              <Card className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <FaExclamationCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-600 mb-4">Failed to load users. Please try again later.</p>
                <Button onClick={fetchUsers}>Retry</Button>
              </Card>
            ) : users.length > 0 ? (
              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={clsx(
                              'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                              user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => promoteToAdmin(user.id)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Promote
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600">No users found.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
};

AdminDashboardPage.propTypes = {
  className: PropTypes.string
};

export default AdminDashboardPage;