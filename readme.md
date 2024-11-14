# Notes Management Application

A full-stack notes management application built with React, Node.js, Express, and MongoDB. This application allows users to create, edit, delete, search, and organize notes with features like tagging, pinning, and dark mode. User authentication is implemented using JWT.

## Features

- User authentication (sign up, login, logout)
- Create, edit, delete, and search notes
- Tagging and pinning notes

## Live Demo

Check out the live demo [here](https://notes-frontend-murex.vercel.app/).

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/TheRodzz/notes.git
cd notes
```

2. **Install dependencies for both frontend and backend**

```bash
# For the frontend
cd frontend/notes
npm install

# For the backend
cd ../../backend
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `backend` directory and add the following:

```env
# .env
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_jwt_secret
```

Create a `.env` file in the `frontend/notes` directory and add the following:

```env
# .env
REACT_APP_API_URL=your_backend_url
```

### Running the Application

1. **Start the backend**

```bash
cd backend
npm start
```

2. **Start the frontend**

```bash
cd frontend/notes
npm start
```

## Project Structure

```plaintext
notes-management-app/
│
├── frontend/               # React frontend
|   ├──notes/
│      ├── public/
│      ├── src/
│      │   ├── assets/       # Images, icons, etc.
│      │   ├── components/   # Reusable components
│      │   ├── pages/        # Application pages
│      │   ├── utils/        # Utility functions
│      │   ├── App.jsx
│      └── package.json
│
├── backend/               # Node.js backend
│   ├── models/           # Mongoose models
│   ├── index.js
│   ├── utilities.js
│   └── package.json
├── README.md
└── package.json
```

## Usage

### Authentication

- **Sign Up**: Register a new user.
- **Login**: Authenticate an existing user and get a JWT token.
- **Logout**: Clear the JWT token from local storage.

### Notes Management

- **Create Note**: Add a new note with a title, content, and tags.
- **Edit Note**: Update an existing note.
- **Delete Note**: Remove a note from the list.
- **Search Notes**: Find notes by title or content.
- **Tagging**: Add and manage tags for notes.
- **Pinning**: Pin notes to keep them at the top of the list.

## Planned Features

- Dark Mode
- Categories and folders
- Rich text editing
- File attachments
- Export notes

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure that your code adheres to the project's coding standards and passes all tests.

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)
