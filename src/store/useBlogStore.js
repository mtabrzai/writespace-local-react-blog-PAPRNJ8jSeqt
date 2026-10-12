import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LOCAL_STORAGE_KEYS, APP_CONSTANTS } from '../constants.js';
import { blogUtils } from '../utils/blog.js';
import { DocumentPropTypes, PostPropTypes } from '../types.js';
import PropTypes from 'prop-types';

const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  lastSaved: null
};

export const useBlogStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Fetch all posts
       * @returns {Promise<void>}
       */
      fetchPosts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/posts', {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch posts');
          }

          const data = await response.json();
          set({
            posts: data.posts,
            isLoading: false,
            lastSaved: new Date().toISOString()
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to fetch posts',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Fetch a single post by ID
       * @param {string} postId
       * @returns {Promise<void>}
       */
      fetchPost: async (postId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/posts/${postId}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch post');
          }

          const data = await response.json();
          set({
            currentPost: data.post,
            isLoading: false,
            lastSaved: new Date().toISOString()
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to fetch post',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Create a new post
       * @param {Object} postData
       * @param {string} postData.title
       * @param {string} postData.content
       * @param {string} [postData.status='draft']
       * @returns {Promise<Object>} The created post
       */
      createPost: async (postData) => {
        set({ isLoading: true, error: null });
        try {
          const post = {
            title: postData.title,
            content: blogUtils.sanitizeContent(postData.content),
            status: postData.status || 'draft'
          };

          if (!blogUtils.validatePost(post)) {
            throw new Error('Invalid post data');
          }

          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create post');
          }

          const data = await response.json();
          set((state) => ({
            posts: [...state.posts, data.post],
            currentPost: data.post,
            isLoading: false,
            lastSaved: new Date().toISOString()
          }));
          return data.post;
        } catch (error) {
          set({
            error: error.message || 'Failed to create post',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Update an existing post
       * @param {string} postId
       * @param {Object} updates
       * @param {string} [updates.title]
       * @param {string} [updates.content]
       * @param {string} [updates.status]
       * @returns {Promise<Object>} The updated post
       */
      updatePost: async (postId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const currentPost = get().currentPost || get().posts.find(p => p.id === postId);
          if (!currentPost) {
            throw new Error('Post not found');
          }

          const updatedPost = {
            ...currentPost,
            ...updates,
            content: updates.content ? blogUtils.sanitizeContent(updates.content) : currentPost.content
          };

          if (!blogUtils.validatePost(updatedPost)) {
            throw new Error('Invalid post data');
          }

          const response = await fetch(`/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPost),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update post');
          }

          const data = await response.json();
          set((state) => ({
            posts: state.posts.map(p => p.id === postId ? data.post : p),
            currentPost: data.post,
            isLoading: false,
            lastSaved: new Date().toISOString()
          }));
          return data.post;
        } catch (error) {
          set({
            error: error.message || 'Failed to update post',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Delete a post
       * @param {string} postId
       * @returns {Promise<void>}
       */
      deletePost: async (postId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete post');
          }

          set((state) => ({
            posts: state.posts.filter(p => p.id !== postId),
            currentPost: state.currentPost?.id === postId ? null : state.currentPost,
            isLoading: false,
            lastSaved: new Date().toISOString()
          }));
        } catch (error) {
          set({
            error: error.message || 'Failed to delete post',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Set current post
       * @param {Object|null} post
       */
      setCurrentPost: (post) => {
        set({ currentPost: post });
      },

      /**
       * Clear current post
       */
      clearCurrentPost: () => {
        set({ currentPost: null });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'writespace_blog_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        posts: state.posts,
        currentPost: state.currentPost
      })
    }
  )
);

export const BlogStorePropTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape(PostPropTypes)).isRequired,
  currentPost: PropTypes.shape(PostPropTypes),
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  lastSaved: PropTypes.string,
  fetchPosts: PropTypes.func.isRequired,
  fetchPost: PropTypes.func.isRequired,
  createPost: PropTypes.func.isRequired,
  updatePost: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  setCurrentPost: PropTypes.func.isRequired,
  clearCurrentPost: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired
};