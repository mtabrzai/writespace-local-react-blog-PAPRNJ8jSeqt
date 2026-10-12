import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Card from '../components/Card';
import FeatureCard from '../components/FeatureCard';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import RouteGuard from '../components/RouteGuard';

describe('Avatar Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'user'
  };

  const mockAdminUser = {
    username: 'adminuser',
    role: 'admin'
  };

  it('renders user initials', () => {
    render(<Avatar user={mockUser} />);
    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('renders admin crown icon for admin users', () => {
    render(<Avatar user={mockAdminUser} />);
    expect(screen.getByTestId('crown-icon')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    render(<Avatar user={mockUser} size="small" />);
    expect(screen.getByText('TE')).toHaveClass('w-8 h-8 text-sm');

    render(<Avatar user={mockUser} size="large" />);
    expect(screen.getByText('TE')).toHaveClass('w-16 h-16 text-2xl');
  });

  it('applies custom className', () => {
    render(<Avatar user={mockUser} className="custom-class" />);
    expect(screen.getByText('TE').parentElement).toHaveClass('custom-class');
  });

  it('renders question mark when username is missing', () => {
    render(<Avatar user={{}} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600 text-white hover:bg-blue-700');
  });

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-white border border-gray-300 text-gray-700 hover:bg-gray-50');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger')).toHaveClass('bg-red-600 text-white hover:bg-red-700');
  });

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost')).toHaveClass('bg-transparent text-gray-700 hover:bg-gray-100');
  });

  it('applies correct size classes', () => {
    render(<Button size="small">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('px-2.5 py-1.5 text-xs');

    render(<Button size="large">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('px-4 py-2 text-base');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
    expect(screen.getByText('Disabled')).toHaveClass('disabled:opacity-50');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    await user.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    await user.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card><div>Child Content</div></Card>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Card><div>Content</div></Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('shadow-sm');
  });

  it('applies hoverable variant classes', () => {
    render(<Card variant="hoverable"><div>Content</div></Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('hover:shadow-md');
  });

  it('applies outlined variant classes', () => {
    render(<Card variant="outlined"><div>Content</div></Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('border border-gray-200');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class"><div>Content</div></Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-class');
  });
});

describe('FeatureCard Component', () => {
  it('renders title and description', () => {
    render(<FeatureCard title="Test Feature" description="Test description" icon="rocket" />);
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders correct icon based on icon prop', () => {
    render(<FeatureCard title="Rocket" description="Test" icon="rocket" />);
    expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();

    render(<FeatureCard title="Lock" description="Test" icon="lock" />);
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<FeatureCard title="Test" description="Test" icon="rocket" />);
    expect(screen.getByText('Test').parentElement.parentElement).toHaveClass('shadow-sm');
  });

  it('applies hoverable variant classes', () => {
    render(<FeatureCard title="Test" description="Test" icon="rocket" variant="hoverable" />);
    expect(screen.getByText('Test').parentElement.parentElement).toHaveClass('hover:shadow-lg');
  });

  it('applies outlined variant classes', () => {
    render(<FeatureCard title="Test" description="Test" icon="rocket" variant="outlined" />);
    expect(screen.getByText('Test').parentElement.parentElement).toHaveClass('border border-gray-200');
  });

  it('applies custom className', () => {
    render(<FeatureCard title="Test" description="Test" icon="rocket" className="custom-class" />);
    expect(screen.getByText('Test').parentElement.parentElement).toHaveClass('custom-class');
  });
});

describe('Navbar Component', () => {
  const mockAuthStore = {
    isAuthenticated: vi.fn(),
    isAdmin: vi.fn(),
    user: null,
    logout: vi.fn()
  };

  beforeEach(() => {
    vi.mock('../store/useAuthStore', () => ({
      useAuthStore: () => mockAuthStore
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders logo', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(false);
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Writespace')).toBeInTheDocument();
  });

  it('shows login link when not authenticated', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(false);
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows dashboard and logout links when authenticated', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(true);
    mockAuthStore.user = { username: 'testuser' };
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('shows admin link when user is admin', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(true);
    mockAuthStore.isAdmin.mockReturnValue(true);
    mockAuthStore.user = { username: 'adminuser' };
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(false);
    render(
      <MemoryRouter>
        <Navbar className="custom-class" />
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation')).toHaveClass('custom-class');
  });
});

describe('PostCard Component', () => {
  const mockPost = {
    id: 'post123',
    title: 'Test Post',
    content: 'This is a test post content',
    status: 'published',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    author: {
      username: 'testuser',
      role: 'user'
    }
  };

  it('renders post title, content, and author', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders correct status badge', () => {
    render(
      <MemoryRouter>
        <PostCard post={{...mockPost, status: 'published'}} />
      </MemoryRouter>
    );
    expect(screen.getByText('Published')).toBeInTheDocument();

    render(
      <MemoryRouter>
        <PostCard post={{...mockPost, status: 'draft'}} />
      </MemoryRouter>
    );
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows formatted date', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
  });

  it('shows action buttons when showActions is true', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} showActions={true} />
      </MemoryRouter>
    );
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides action buttons when showActions is false', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} showActions={false} />
      </MemoryRouter>
    );
    expect(screen.queryByText('View')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();
    render(
      <MemoryRouter>
        <PostCard post={mockPost} onDelete={handleDelete} />
      </MemoryRouter>
    );

    await user.click(screen.getByText('Delete'));
    expect(handleDelete).toHaveBeenCalledWith('post123');
  });

  it('truncates long content', () => {
    const longContentPost = {
      ...mockPost,
      content: 'a'.repeat(300)
    };
    render(
      <MemoryRouter>
        <PostCard post={longContentPost} />
      </MemoryRouter>
    );
    expect(screen.getByText(/a{200}\.\.\./)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} className="custom-class" />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Post').closest('.p-6')).toHaveClass('custom-class');
  });
});

describe('RouteGuard Component', () => {
  const mockAuthStore = {
    isAuthenticated: vi.fn(),
    isAdmin: vi.fn()
  };

  beforeEach(() => {
    vi.mock('../store/useAuthStore', () => ({
      useAuthStore: () => mockAuthStore
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to login when not authenticated', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(false);
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(true);
    render(
      <MemoryRouter>
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to dashboard when user does not have required role', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(true);
    mockAuthStore.isAdmin.mockReturnValue(false);
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <RouteGuard roles={['admin']}>
          <div>Admin Content</div>
        </RouteGuard>
      </MemoryRouter>
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    mockAuthStore.isAuthenticated.mockReturnValue(true);
    mockAuthStore.isAdmin.mockReturnValue(true);
    render(
      <MemoryRouter>
        <RouteGuard roles={['admin']}>
          <div>Admin Content</div>
        </RouteGuard>
      </MemoryRouter>
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});