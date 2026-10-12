import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { blogUtils } from '../utils/blog';
import { useBlogStore } from '../store/useBlogStore';
import { LOCAL_STORAGE_KEYS } from '../constants';

describe('blog utilities', () => {
  describe('generateSlug', () => {
    it('should generate URL-friendly slug from title', () => {
      expect(blogUtils.generateSlug('Hello World')).toBe('hello-world');
      expect(blogUtils.generateSlug('Test Title With Numbers 123')).toBe('test-title-with-numbers-123');
      expect(blogUtils.generateSlug('Special!@# Characters')).toBe('special-characters');
      expect(blogUtils.generateSlug('  Trim  Spaces  ')).toBe('trim-spaces');
      expect(blogUtils.generateSlug('')).toBe('');
    });
  });

  describe('validatePost', () => {
    it('should validate correct post data', () => {
      const validPost = {
        title: 'Valid Title',
        content: '<p>Valid content</p>',
        status: 'draft'
      };
      expect(blogUtils.validatePost(validPost)).toBe(true);
    });

    it('should reject post with empty title', () => {
      const invalidPost = {
        title: '',
        content: '<p>Valid content</p>',
        status: 'draft'
      };
      expect(blogUtils.validatePost(invalidPost)).toBe(false);
    });

    it('should reject post with title exceeding max length', () => {
      const invalidPost = {
        title: 'a'.repeat(101),
        content: '<p>Valid content</p>',
        status: 'draft'
      };
      expect(blogUtils.validatePost(invalidPost)).toBe(false);
    });

    it('should reject post with empty content', () => {
      const invalidPost = {
        title: 'Valid Title',
        content: '',
        status: 'draft'
      };
      expect(blogUtils.validatePost(invalidPost)).toBe(false);
    });

    it('should reject post with invalid status', () => {
      const invalidPost = {
        title: 'Valid Title',
        content: '<p>Valid content</p>',
        status: 'invalid'
      };
      expect(blogUtils.validatePost(invalidPost)).toBe(false);
    });
  });

  describe('isPostOwner', () => {
    it('should return true when user owns the post', () => {
      const post = { authorId: 'user123' };
      expect(blogUtils.isPostOwner(post, 'user123')).toBe(true);
    });

    it('should return false when user does not own the post', () => {
      const post = { authorId: 'user123' };
      expect(blogUtils.isPostOwner(post, 'user456')).toBe(false);
    });
  });

  describe('sanitizeContent', () => {
    it('should remove script tags from content', () => {
      const content = '<p>Safe content</p><script>alert("xss")</script><div>More content</div>';
      expect(blogUtils.sanitizeContent(content)).toBe('<p>Safe content</p><div>More content</div>');
    });

    it('should not modify content without script tags', () => {
      const content = '<p>Safe content</p><div>More content</div>';
      expect(blogUtils.sanitizeContent(content)).toBe(content);
    });

    it('should handle empty content', () => {
      expect(blogUtils.sanitizeContent('')).toBe('');
    });
  });

  describe('formatPostForDisplay', () => {
    it('should truncate long content', () => {
      const post = {
        title: 'Test Post',
        content: 'a'.repeat(300),
        createdAt: '2023-01-01T00:00:00.000Z',
        authorId: 'user123',
        status: 'published'
      };
      const result = blogUtils.formatPostForDisplay(post, 200);
      expect(result.content).toBe('a'.repeat(200) + '...');
      expect(result.formattedDate).toBe('January 1, 2023');
    });

    it('should not truncate short content', () => {
      const post = {
        title: 'Test Post',
        content: 'Short content',
        createdAt: '2023-01-01T00:00:00.000Z',
        authorId: 'user123',
        status: 'published'
      };
      const result = blogUtils.formatPostForDisplay(post, 200);
      expect(result.content).toBe('Short content');
    });
  });
});

describe('useBlogStore', () => {
  const mockPost = {
    id: 'post123',
    title: 'Test Post',
    content: '<p>Test content</p>',
    status: 'draft',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    author: {
      id: 'user123',
      username: 'testuser',
      role: 'user'
    }
  };

  const mockPosts = [
    mockPost,
    {
      id: 'post456',
      title: 'Another Post',
      content: '<p>Another content</p>',
      status: 'published',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
      author: {
        id: 'user456',
        username: 'anotheruser',
        role: 'user'
      }
    }
  ];

  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const store = useBlogStore.getState();
    expect(store).toEqual({
      posts: [],
      currentPost: null,
      isLoading: false,
      error: null,
      lastSaved: null
    });
  });

  describe('fetchPosts', () => {
    it('should fetch posts successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ posts: mockPosts })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { fetchPosts } = useBlogStore.getState();
      await fetchPosts();

      const store = useBlogStore.getState();
      expect(store.posts).toEqual(mockPosts);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/posts', {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should handle fetch error', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Failed to fetch' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { fetchPosts } = useBlogStore.getState();
      await expect(fetchPosts()).rejects.toThrow('Failed to fetch');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to fetch posts');
      expect(store.isLoading).toBe(false);
    });

    it('should handle network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const { fetchPosts } = useBlogStore.getState();
      await expect(fetchPosts()).rejects.toThrow('Network error');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to fetch posts');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('fetchPost', () => {
    it('should fetch a single post successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ post: mockPost })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { fetchPost } = useBlogStore.getState();
      await fetchPost('post123');

      const store = useBlogStore.getState();
      expect(store.currentPost).toEqual(mockPost);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post123', {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should handle fetch error for single post', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Post not found' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { fetchPost } = useBlogStore.getState();
      await expect(fetchPost('post123')).rejects.toThrow('Post not found');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to fetch post');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('createPost', () => {
    it('should create a new post successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ post: mockPost })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { createPost } = useBlogStore.getState();
      const result = await createPost({
        title: 'Test Post',
        content: '<p>Test content</p>',
        status: 'draft'
      });

      const store = useBlogStore.getState();
      expect(store.posts).toContainEqual(mockPost);
      expect(store.currentPost).toEqual(mockPost);
      expect(result).toEqual(mockPost);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Post',
          content: '<p>Test content</p>',
          status: 'draft'
        })
      });
    });

    it('should handle post creation error', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Creation failed' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { createPost } = useBlogStore.getState();
      await expect(createPost({
        title: 'Test Post',
        content: '<p>Test content</p>'
      })).rejects.toThrow('Creation failed');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to create post');
      expect(store.isLoading).toBe(false);
    });

    it('should reject invalid post data', async () => {
      const { createPost } = useBlogStore.getState();
      await expect(createPost({
        title: '',
        content: '<p>Test content</p>'
      })).rejects.toThrow('Invalid post data');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to create post');
    });
  });

  describe('updatePost', () => {
    beforeEach(() => {
      useBlogStore.setState({
        posts: mockPosts,
        currentPost: mockPost
      });
    });

    it('should update an existing post successfully', async () => {
      const updatedPost = {
        ...mockPost,
        title: 'Updated Title',
        content: '<p>Updated content</p>'
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ post: updatedPost })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { updatePost } = useBlogStore.getState();
      const result = await updatePost('post123', {
        title: 'Updated Title',
        content: '<p>Updated content</p>'
      });

      const store = useBlogStore.getState();
      expect(store.posts.find(p => p.id === 'post123')).toEqual(updatedPost);
      expect(store.currentPost).toEqual(updatedPost);
      expect(result).toEqual(updatedPost);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mockPost,
          title: 'Updated Title',
          content: '<p>Updated content</p>'
        })
      });
    });

    it('should handle post update error', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Update failed' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { updatePost } = useBlogStore.getState();
      await expect(updatePost('post123', {
        title: 'Updated Title'
      })).rejects.toThrow('Update failed');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to update post');
      expect(store.isLoading).toBe(false);
    });

    it('should reject when post not found', async () => {
      useBlogStore.setState({
        posts: [],
        currentPost: null
      });

      const { updatePost } = useBlogStore.getState();
      await expect(updatePost('nonexistent', {
        title: 'Updated Title'
      })).rejects.toThrow('Post not found');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to update post');
    });
  });

  describe('deletePost', () => {
    beforeEach(() => {
      useBlogStore.setState({
        posts: mockPosts,
        currentPost: mockPost
      });
    });

    it('should delete a post successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({})
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { deletePost } = useBlogStore.getState();
      await deletePost('post123');

      const store = useBlogStore.getState();
      expect(store.posts.find(p => p.id === 'post123')).toBeUndefined();
      expect(store.currentPost).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post123', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should handle post deletion error', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Deletion failed' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const { deletePost } = useBlogStore.getState();
      await expect(deletePost('post123')).rejects.toThrow('Deletion failed');

      const store = useBlogStore.getState();
      expect(store.error).toBe('Failed to delete post');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('state management', () => {
    it('should set current post', () => {
      const { setCurrentPost } = useBlogStore.getState();
      setCurrentPost(mockPost);

      const store = useBlogStore.getState();
      expect(store.currentPost).toEqual(mockPost);
    });

    it('should clear current post', () => {
      useBlogStore.setState({ currentPost: mockPost });
      const { clearCurrentPost } = useBlogStore.getState();
      clearCurrentPost();

      const store = useBlogStore.getState();
      expect(store.currentPost).toBeNull();
    });

    it('should clear error', () => {
      useBlogStore.setState({ error: 'Some error' });
      const { clearError } = useBlogStore.getState();
      clearError();

      const store = useBlogStore.getState();
      expect(store.error).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should persist posts and currentPost to localStorage', () => {
      useBlogStore.setState({
        posts: mockPosts,
        currentPost: mockPost
      });

      const persistedState = JSON.parse(localStorage.getItem('writespace_blog_store') || '{}');
      expect(persistedState.state.posts).toEqual(mockPosts);
      expect(persistedState.state.currentPost).toEqual(mockPost);
    });

    it('should initialize from localStorage', () => {
      localStorage.setItem('writespace_blog_store', JSON.stringify({
        state: {
          posts: mockPosts,
          currentPost: mockPost
        },
        version: 0
      }));

      const store = useBlogStore.getState();
      expect(store.posts).toEqual(mockPosts);
      expect(store.currentPost).toEqual(mockPost);
    });
  });
});