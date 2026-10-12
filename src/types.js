import PropTypes from 'prop-types';

export const UserPropTypes = {
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['user', 'admin']).isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired
};

export const PostPropTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['draft', 'published', 'archived']).isRequired
};

export const SessionPropTypes = {
  token: PropTypes.string.isRequired,
  user: PropTypes.shape(UserPropTypes).isRequired,
  expiresAt: PropTypes.string.isRequired
};

export const DocumentPropTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  isPublic: PropTypes.bool.isRequired
};

export const UserPreferencesPropTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'system']).isRequired,
  fontSize: PropTypes.oneOf(['small', 'medium', 'large']).isRequired,
  fontFamily: PropTypes.string.isRequired,
  lineHeight: PropTypes.number.isRequired,
  autoSave: PropTypes.bool.isRequired
};