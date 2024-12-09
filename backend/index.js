require('dotenv').config();
const env = process.env.ENV;
const config = require('./config.json');
const mongoose = require('mongoose');
const logger = require('./logger'); // Import the logger
const connectionString = env === 'deploy' ? process.env.connectionString : config.connectionString;
mongoose.connect(connectionString)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

const User = require('./models/user.model');
const Note = require('./models/note.model');
// checking webhook
const express = require('express');
const cors = require("cors");
const app = express();

const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./utilities');

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.post('/create-account', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    logger.warn('Full Name is required');
    return res.status(400).json({ error: true, message: 'Full Name is required' });
  }
  if (!email) {
    logger.warn('Email is required');
    return res.status(400).json({ error: true, message: 'Email is required' });
  }
  if (!password) {
    logger.warn('Password is required');
    return res.status(400).json({ error: true, message: 'Password is required' });
  }

  const isUser = await User.findOne({ email: email });
  if (isUser) {
    logger.warn('User already exists:', email);
    return res.json({
      error: true,
      message: "User already exists",
    });
  }
  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30m',
  });

  logger.info('User registered successfully:', email);
  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registeration Successful",
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    logger.warn('Email is required');
    return res.status(400).json({ error: true, message: 'Email is required' });
  }
  if (!password) {
    logger.warn('Password is required');
    return res.status(400).json({ error: true, message: 'Password is required' });
  }

  const userInfo = await User.findOne({ email: email });
  if (!userInfo) {
    logger.warn('User not found:', email);
    return res.json({
      error: true,
      message: "User not found",
    });
  }

  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '3600m',
    });

    logger.info('User logged in successfully:', email);
    return res.json({
      error: false,
      message: 'Login Successful',
      email,
      accessToken,
    });
  } else {
    logger.warn('Invalid credentials for:', email);
    return res.json({
      error: true,
      message: 'Invalid Credentials',
    });
  }
});

app.get('/get-user', authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });
  if (!isUser) {
    logger.warn('User not found:', user._id);
    return res.sendStatus(401);
  }
  logger.info('User details retrieved successfully:', user._id);
  return res.json({
    user: {
      _id: isUser._id,
      fullName: isUser.fullName,
      email: isUser.email,
      createdOn: isUser.createdOn,
    },
    message: ""
  });
});

app.post('/add-note', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    logger.warn('Title is required');
    return res.status(400).json({ error: true, message: 'Title is required' });
  }
  if (!content) {
    logger.warn('Content is required');
    return res.status(400).json({ error: true, message: 'Content is required' });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save();
    logger.info('Note added successfully:', note._id);
    return res.json({
      error: false,
      note,
      message: 'Note added successfully',
    });
  } catch (error) {
    logger.error('Error adding note:', error);
    return res.json({
      error: true,
      message: 'Internal server error ',
    });
  }
});

app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    logger.warn('No changes provided');
    return res.status(400).json({
      error: true,
      message: 'No changes provided',
    });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      logger.warn('Note not found:', noteId);
      return res.status(404).json({
        error: true,
        message: "Note not found"
      });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();
    logger.info('Note updated successfully:', noteId);
    return res.json({
      error: false,
      note,
      message: 'Note updated successfully',
    });
  } catch (error) {
    logger.error('Error updating note:', error);
    return res.json({
      error: true,
      message: 'Internal server error',
    });
  }
});

app.get('/get-all-notes', authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id, }).sort({ isPinned: -1 });
    logger.info('All notes retrieved successfully:', user._id);
    return res.json({
      error: false,
      notes,
      message: 'All notes retrieved successfully',
    });
  } catch (error) {
    logger.error('Error retrieving notes:', error);
    return res.json({
      error: true,
      message: 'Internal server error',
    });
  }
});

app.delete('/delete-note/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;
  try {
    const note = await Note.findOne({
      _id: noteId,
      userId: user._id,
    });
    if (!note) {
      logger.warn('Note not found:', noteId);
      return res.status(404).json({
        error: true,
        message: 'Note not found',
      });
    }
    await Note.deleteOne({
      _id: noteId,
      userId: user._id,
    });
    logger.info('Note deleted successfully:', noteId);
    return res.json({
      error: false,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting note:', error);
    return res.json({
      error: true,
      message: 'Internal server error',
    });
  }
});

app.put('/update-note-pinned/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      logger.warn('Note not found:', noteId);
      return res.status(404).json({
        error: true,
        message: "Note not found"
      });
    }
    note.isPinned = !note.isPinned;

    await note.save();
    logger.info('isPinned updated successfully:', noteId);
    return res.json({
      error: false,
      note,
      message: 'isPinned updated successfully',
    });
  } catch (error) {
    logger.error('Error updating isPinned:', error);
    return res.json({
      error: true,
      message: 'Internal server error',
    });
  }
});

app.get('/search-notes', authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { user } = req.user;

  if (!query) {
    logger.warn('Search query is required');
    return res.status(400).json({
      error: true,
      message: "Search query is required"
    });
  }
  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });
    logger.info('Notes matching the search query retrieved successfully:', user._id);
    return res.json({
      error: false,
      notes: matchingNotes,
      message: 'Notes matching the search query retrieved successfully',
    });
  } catch (error) {
    logger.error('Error searching notes:', error);
    return res.json({
      error: true,
      message: 'Internal server error',
    });
  }
});

app.listen(8000, () => {
  logger.info('Server is running on port 8000');
});
module.exports = app;