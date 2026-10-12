import { Link } from 'react-router-dom';
import { FaPen, FaUsers, FaRocket } from 'react-icons/fa';
import { useBlogStore } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTE_PATHS } from '../constants';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import FeatureCard from '../components/FeatureCard';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import Card from '../components/Card';

const LandingPage = ({ className }) => {
  const { posts, isLoading, error, fetchPosts } = useBlogStore();
  const { isAuthenticated } = useAuthStore();

  const latestPosts = posts
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className={clsx('min-h-screen bg-gray-50', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to Writespace
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              A modern writing platform for creating, sharing, and discovering amazing content.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              {isAuthenticated() ? (
                <Link to={ROUTE_PATHS.DASHBOARD}>
                  <Button size="large" variant="secondary">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to={ROUTE_PATHS.LOGIN}>
                    <Button size="large">Get Started</Button>
                  </Link>
                  <Link to={ROUTE_PATHS.LOGIN}>
                    <Button size="large" variant="secondary">
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Features</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Everything you need to create and share your content
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="edit"
              title="Easy Writing"
              description="Our intuitive editor makes writing a breeze with rich text formatting and distraction-free mode."
            />
            <FeatureCard
              icon="share"
              title="Share Your Work"
              description="Publish your content to the world or keep it private - you're in control."
            />
            <FeatureCard
              icon="users"
              title="Collaborate"
              description="Work together with others in real-time on your documents."
            />
            <FeatureCard
              icon="rocket"
              title="Publish Instantly"
              description="One click to publish your content and share it with your audience."
            />
            <FeatureCard
              icon="search"
              title="Discover Content"
              description="Explore amazing content from other writers in our community."
            />
            <FeatureCard
              icon="lock"
              title="Secure & Private"
              description="Your content is safe with us. We take privacy and security seriously."
            />
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Latest Posts</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Check out the newest content from our community
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <Card className="p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load posts. Please try again later.</p>
              <Button onClick={fetchPosts}>Retry</Button>
            </Card>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  variant="hoverable"
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No posts available yet. Be the first to create one!</p>
            </Card>
          )}

          <div className="mt-12 text-center">
            {isAuthenticated() ? (
              <Link to={ROUTE_PATHS.DASHBOARD}>
                <Button size="large">View All Posts</Button>
              </Link>
            ) : (
              <Link to={ROUTE_PATHS.LOGIN}>
                <Button size="large">Join Now</Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

LandingPage.propTypes = {
  className: PropTypes.string
};

export default LandingPage;