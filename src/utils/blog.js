import { DocumentPropTypes, PostPropTypes } from '../types.js';
import { APP_CONSTANTS } from '../constants.js';

export const blogUtils = {
  /**
   * Generate a URL-friendly slug from a post title
   * @param {string} title
   * @returns {string}
   */
  generateSlug: (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Validate post data before saving
   * @param {Object} post
   * @param {string} post.title
   * @param {string} post.content
   * @param {string} post.status
   * @returns {boolean}
   */
  validatePost: (post) => {
    if (!post.title || post.title.length > APP_CONSTANTS.MAX_DOCUMENT_TITLE_LENGTH) {
      return false;
    }
    if (!post.content || typeof post.content !== 'string') {
      return false;
    }
    if (!['draft', 'published', 'archived'].includes(post.status)) {
      return false;
    }
    return true;
  },

  /**
   * Check if a user owns a post
   * @param {Object} post
   * @param {string} userId
   * @returns {boolean}
   */
  isPostOwner: (post, userId) => {
    return post.authorId === userId;
  },

  /**
   * Sanitize post content by removing potentially harmful HTML tags
   * @param {string} content
   * @returns {string}
   */
  sanitizeContent: (content) => {
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },

  /**
   * Format post for display (truncate content if needed)
   * @param {Object} post
   * @param {number} maxLength
   * @returns {Object}
   */
  formatPostForDisplay: (post, maxLength = 200) => {
    const truncatedContent = post.content.length > maxLength
      ? post.content.substring(0, maxLength) + '...'
      : post.content;

    return {
      ...post,
      content: truncatedContent,
      formattedDate: new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }
};

export const BlogPropTypes = {
  generateSlug: PropTypes.func.isRequired,
  validatePost: PropTypes.func.isRequired,
  isPostOwner: PropTypes.func.isRequired,
  sanitizeContent: PropTypes.func.isRequired,
  formatPostForDisplay: PropTypes.func.isRequired
};