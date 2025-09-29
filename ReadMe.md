# 💬 MERN Chat App Backend

A real-time chat application backend built with Node.js, Express, MongoDB, and Socket.IO. Features include user authentication, one-on-one and group chat, real-time messaging, typing indicators, and presence notifications.

## ✨ Features

- 🔐 **User Authentication** - JWT-based authentication system
- 💬 **Real-time Messaging** - Instant message delivery using Socket.IO
- 👥 **One-on-One & Group Chats** - Support for both private and group conversations
- ⌨️ **Typing Indicators** - See when someone is typing
- 📊 **User Presence** - Know when users join or leave chats
- 🔄 **Auto-join Chats** - Automatically join all user's chat rooms on connection
- ✅ **Message Delivery Confirmation** - Get acknowledgments when messages are delivered
- 🔒 **Session Management** - Redis-backed session storage
- 🎯 **Room-based Architecture** - Efficient message routing to specific chat rooms

## 🛠️ Technologies Used

| Technology     | Purpose                               |
| -------------- | ------------------------------------- |
| **Node.js**    | JavaScript runtime environment        |
| **TypeScript** | Type-safe JavaScript                  |
| **Express**    | Web application framework             |
| **MongoDB**    | NoSQL database                        |
| **Mongoose**   | MongoDB object modeling               |
| **Socket.IO**  | Real-time bidirectional communication |
| **JWT**        | Secure authentication tokens          |
| **Redis**      | Session storage and caching           |
| **Bcrypt**     | Password hashing                      |

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── chat/            # Chat-related controllers
│   │   ├── message/         # Message controllers
│   │   └── user/            # User authentication & management
│   ├── models/              # Mongoose schemas
│   │   ├── chat.ts          # Chat model
│   │   ├── message.ts       # Message model
│   │   └── user.ts          # User model
│   ├── routes/              # API route definitions
│   │   ├── subRoutes/       # Organized route modules
│   │   └── index.ts         # Route aggregator
│   ├── services/            # Business logic
│   │   ├── chat.services.ts # Chat-related services
│   │   ├── socket.ts        # Socket.IO setup
│   │   ├── redis.ts         # Redis client
│   │   └── user.services.ts # User services
│   ├── middlewares/         # Express middlewares
│   │   └── session.ts       # Session management
│   ├── utils/               # Utility functions
│   │   └── handlers/        # Various handlers
│   │       ├── socketHandlers.ts  # Socket event handlers
│   │       ├── asyncHandler.ts    # Async error wrapper
│   │       ├── response.ts        # Response formatter
│   │       └── server.ts          # Server initialization
│   └── main.ts              # Application entry point
├── .env.sample              # Environment variables template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── nodemon.json             # Nodemon configuration
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (optional, for session management)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kdkundan/mern-chat-app-backend.git
   cd mern-chat-app-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the sample environment file and configure it with your values:

   ```bash
   cp .env.sample .env
   ```

   Then edit the `.env` file with your actual configuration values. Refer to `.env.sample` for all required variables and their descriptions.

4. **Start MongoDB**

   Make sure MongoDB is running on your system:

   ```bash
   # On macOS/Linux
   mongod

   # On Windows (if installed as a service)
   net start MongoDB
   ```

5. **Start Redis (Optional)**

   ```bash
   redis-server
   ```

### Running the Application

**Development Mode** (with auto-reload):

```bash
npm run dev
```

**Build for Production**:

```bash
npm run build
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`)

### Verify Installation

Once the server starts, you should see:

```
✅✅✅✅✅ Server connected to MongoDB & running on port: 5000 ✅✅✅✅✅
```

Test the health endpoint:

```bash
curl http://localhost:5000/health
```

## 📡 API Endpoints

### User Routes

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| POST   | `/api/user/register`          | Register a new user |
| POST   | `/api/user/login`             | Login user          |
| GET    | `/api/user/:id`               | Get user details    |
| GET    | `/api/user/search?query=name` | Search users        |

### Chat Routes

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | `/api/chat`         | Create new chat      |
| GET    | `/api/chat/:userID` | Get all user's chats |

### Message Routes

| Method | Endpoint               | Description                |
| ------ | ---------------------- | -------------------------- |
| POST   | `/api/message`         | Send a message             |
| GET    | `/api/message/:chatID` | Get all messages in a chat |

## 🔌 Socket.IO Events

### Client → Server (Emit from Frontend)

| Event         | Payload                                     | Description                 |
| ------------- | ------------------------------------------- | --------------------------- |
| `connection`  | `{ userId, username }` (query params)       | Establish socket connection |
| `sendMessage` | `{ _id, chat, sender, content, timestamp }` | Send a message              |
| `joinChat`    | `chatId` (string)                           | Join a specific chat room   |
| `typing`      | `{ chatId, userId, username }`              | Start typing indicator      |
| `stopTyping`  | `{ chatId, userId }`                        | Stop typing indicator       |

### Server → Client (Listen on Frontend)

| Event               | Payload                                                      | Description                   |
| ------------------- | ------------------------------------------------------------ | ----------------------------- |
| `newMessage`        | `{ _id, chat, sender, content, timestamp, serverTimestamp }` | Receive new message           |
| `messageDelivered`  | `{ messageId, chatId, timestamp }`                           | Message delivery confirmation |
| `messageError`      | `{ messageId, error, details }`                              | Message send failed           |
| `userJoined`        | `{ userId, username, timestamp }`                            | User joined chat              |
| `userLeft`          | `{ userId, username, timestamp }`                            | User left chat                |
| `userTyping`        | `{ userId, username }`                                       | User is typing                |
| `userStoppedTyping` | `{ userId }`                                                 | User stopped typing           |
| `error`             | `{ context, message }`                                       | General error                 |

## 🔐 Authentication Flow

1. User registers/logs in via REST API
2. Server returns JWT token
3. Frontend stores token and uses it for authenticated requests
4. For Socket.IO connection, pass `userId` in query parameters
5. Server automatically joins user to all their chat rooms

## 🏗️ Architecture Overview

### Socket Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Frontend connects with userId & username                │
├─────────────────────────────────────────────────────────────┤
│  2. Backend validates userId                                │
├─────────────────────────────────────────────────────────────┤
│  3. Backend auto-joins user to all their chat rooms         │
├─────────────────────────────────────────────────────────────┤
│  4. User can now send/receive messages in real-time         │
├─────────────────────────────────────────────────────────────┤
│  5. On disconnect, notify all rooms user was in             │
└─────────────────────────────────────────────────────────────┘
```

### Message Delivery Flow

```
User A                    Backend                    User B
  │                         │                          │
  ├──sendMessage────────────>│                          │
  │                         │                          │
  │                         ├──newMessage──────────────>│
  │                         │                          │
  │<───messageDelivered─────┤                          │
  │                         │                          │
```

## 🧪 Testing the Application

### Using REST API

Test the REST endpoints using tools like Postman, Insomnia, or cURL. Start by registering a user, then logging in to get a JWT token for authenticated requests.

### Using Socket.IO

Test real-time functionality by connecting from your frontend application. The socket connection requires `userId` and `username` as query parameters. Once connected, the server automatically joins you to all your chat rooms, and you can start sending and receiving messages in real-time.

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check the `MONGO_DB_URL` in your `.env` file
- Verify MongoDB port (default: 27017)

### Socket.IO Connection Issues

- Check CORS settings in `src/utils/handlers/server.ts`
- Ensure frontend is using the correct backend URL
- Verify userId is being passed in connection query

### Port Already in Use

```bash
# Find and kill the process using port 5000
# On macOS/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📝 Scripts

| Script          | Description                               |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start development server with auto-reload |
| `npm run build` | Compile TypeScript to JavaScript          |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

## 👨‍💻 Author

**Your Name**

- GitHub: [@kdkundan](https://github.com/kdkundan)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB for flexible data storage
- Express.js for robust web framework
