# Writespace

A modern writing platform for creating, sharing, and discovering amazing content.

## Tech Stack

- **Frontend**: React 18 + Vite
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library
- **Build Tool**: Vite
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/writespace.git
cd writespace
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Create a production build
- `npm run preview`: Preview the production build locally
- `npm test`: Run tests
- `npm run test:watch`: Run tests in watch mode

## Folder Structure

```
writespace/
├── public/               # Static assets
├── src/
│   ├── __tests__/        # Test files
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── store/            # Zustand stores
│   ├── utils/            # Utility functions
│   ├── constants.js      # Application constants
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── index.html            # Main HTML file
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite configuration
└── vitest.config.js      # Vitest configuration
```

## Features

- **Easy Writing**: Intuitive editor with rich text formatting
- **Share Your Work**: Publish content or keep it private
- **Collaborate**: Work together with others in real-time
- **Publish Instantly**: One-click publishing
- **Discover Content**: Explore amazing content from other writers
- **Secure & Private**: Your content is safe with us

## Usage

### Authentication

- **Login**: Users can log in with their credentials
- **Admin Login**: Quick admin login with default credentials
- **Registration**: New users can create accounts

### Posts

- **Create**: Write and save drafts or publish immediately
- **Edit**: Update existing posts
- **Delete**: Remove posts
- **View**: Read published posts

### Admin Dashboard

- **User Management**: View, promote, and delete users
- **Post Management**: View, edit, and delete all posts
- **Statistics**: View platform statistics

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.