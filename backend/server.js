console.log('SERVER STARTED');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const Message = require('./models/Message');

const app = express();
// Use environment variable for allowed frontend URLs (comma-separated)
// Example: http://localhost:5173,https://your-site.netlify.app
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes (to be added)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/organizer', require('./routes/organizerAuthRoutes'));
app.use('/api/organizer/events', require('./routes/organizerEventRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));

// Socket.io logic
io.on('connection', (socket) => {
  // Join a game room
  socket.on('joinRoom', (gameId) => {
    socket.join(gameId);
  });

  // Handle chat messages for games
  socket.on('chatMessage', async ({ gameId, userId, message }) => {
    try {
      // Save message to DB
      const msg = await Message.create({ game: gameId, user: userId, message });
      await msg.populate('user', 'name avatar');
      // Emit to all in the room
      io.to(gameId).emit('newMessage', msg);
    } catch (err) {
      // Optionally emit error
    }
  });

  // --- Club chat logic ---
  socket.on('joinClubRoom', (clubId) => {
    socket.join(clubId);
  });

  socket.on('clubChatMessage', async ({ clubId, userId, text }) => {
    console.log('[Socket.io] clubChatMessage received:', { clubId, userId, text });
    try {
      const Club = require('./models/Club');
      const club = await Club.findById(clubId);
      console.log('[Socket.io] Fetched club:', club);
      if (!club) return;
      const message = {
        user: userId,
        text,
        timestamp: new Date(),
      };
      club.chat.push(message);
      await club.save();
      console.log('[Socket.io] Message saved to club.chat');
      await club.populate('chat.user', 'name avatar');
      const lastMsg = club.chat[club.chat.length - 1];
      console.log('[Socket.io] Emitting newClubMessage:', lastMsg);
      io.to(clubId).emit('newClubMessage', lastMsg);
      io.emit('newClubMessage', lastMsg); // Emit globally for notifications
    } catch (err) {
      console.error('[Socket.io] Error in clubChatMessage:', err);
      // Optionally emit error
    }
  });

  socket.on('disconnect', () => {
    // Handle disconnect if needed
  });
});

// Error handling for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5555;
console.log('SERVER STARTED');
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 