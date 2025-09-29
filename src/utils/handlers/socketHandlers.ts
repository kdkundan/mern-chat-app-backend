import { Server as SocketIOServer, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getUserChatIds } from "../../services/chat.services";

// Types for better type safety
interface ConnectionInfo {
  userId: string;
  connectedAt: Date;
  rooms: string[];
  username?: string;
}

interface MessageData {
  _id: string;
  chat: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface MessageAck {
  messageId: string;
  chatId: string;
  timestamp: string;
}

interface MessageError {
  messageId: string;
  error: string;
  details?: string;
}

// Connection tracking with proper typing
class ConnectionManager {
  private connections: Map<string, ConnectionInfo>;

  constructor() {
    this.connections = new Map();
  }

  addConnection(socketId: string, info: ConnectionInfo): void {
    this.connections.set(socketId, info);
  }

  removeConnection(socketId: string): void {
    this.connections.delete(socketId);
  }

  addRoomToConnection(socketId: string, roomId: string): void {
    const connection = this.connections.get(socketId);
    if (connection && !connection.rooms.includes(roomId)) {
      connection.rooms.push(roomId);
    }
  }

  getConnectionInfo(socketId: string): ConnectionInfo | undefined {
    return this.connections.get(socketId);
  }

  getStatus() {
    return {
      activeConnections: this.connections.size,
      connections: Array.from(this.connections.entries()).map(
        ([socketId, info]) => ({
          socketId,
          ...info,
        })
      ),
    };
  }
}

// Create a singleton instance
const connectionManager = new ConnectionManager();

// Helper functions
const formatRoomId = (chatId: string): string => `chat:${chatId}`;

const logEvent = (event: string, data: any) => {
  console.log(`${event}:`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

const handleError = (socket: Socket, error: unknown, context: string) => {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";
  console.error(`Error in ${context}:`, error);
  socket.emit("error", { context, message: errorMessage });
};

export const handleConnection = (
  io: SocketIOServer,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  try {
    const userId = socket.handshake.query.userId as string;
    const username = socket.handshake.query.username as string;

    if (!userId) {
      throw new Error("User ID is required for connection");
    }

    // Initialize connection
    connectionManager.addConnection(socket.id, {
      userId,
      username,
      connectedAt: new Date(),
      rooms: [],
    });

    logEvent("🔌 New connection", { socketId: socket.id, userId, username });

    // Automatically join all user's chat rooms
    (async () => {
      try {
        const userChatIds = await getUserChatIds(userId);

        if (userChatIds.length > 0) {
          userChatIds.forEach((chatId) => {
            const roomId = formatRoomId(chatId);
            socket.join(roomId);
            connectionManager.addRoomToConnection(socket.id, chatId);
          });

          logEvent("✅ Auto-joined chats", {
            socketId: socket.id,
            userId,
            chatsCount: userChatIds.length,
            chatIds: userChatIds,
          });
        } else {
          logEvent("ℹ️ No existing chats found", {
            socketId: socket.id,
            userId,
          });
        }
      } catch (error) {
        console.error("Error auto-joining user chats:", error);
      }
    })();

    // Handle joining chat rooms
    socket.on("joinChat", (chatId: string) => {
      try {
        const roomId = formatRoomId(chatId);
        socket.join(roomId);
        connectionManager.addRoomToConnection(socket.id, chatId);

        // Notify other users in the room
        socket.to(roomId).emit("userJoined", {
          userId,
          username,
          timestamp: new Date().toISOString(),
        });

        logEvent("➡️ Join chat success", {
          socketId: socket.id,
          userId,
          chatId,
        });
      } catch (error) {
        handleError(socket, error, "joinChat");
      }
    });

    socket.on("sendMessage", async (messageData: MessageData) => {
      try {
        const roomId = formatRoomId(messageData.chat);
        let room = io.sockets.adapter.rooms.get(roomId);

        // Auto-join room if not already in it
        if (!room || !room.has(socket.id)) {
          socket.join(roomId);
          connectionManager.addRoomToConnection(socket.id, messageData.chat);
          room = io.sockets.adapter.rooms.get(roomId);
        }

        // Add server timestamp
        const enrichedMessage = {
          ...messageData,
          serverTimestamp: new Date().toISOString(),
        };

        // Broadcast message to room
        io.to(roomId).emit("newMessage", enrichedMessage);

        // Send delivery acknowledgment
        const ack: MessageAck = {
          messageId: messageData._id,
          chatId: messageData.chat,
          timestamp: new Date().toISOString(),
        };
        socket.emit("messageDelivered", ack);

        logEvent("✅ Message sent", { messageId: messageData._id, roomId });
      } catch (error) {
        handleError(socket, error, "sendMessage");

        const messageError: MessageError = {
          messageId: messageData._id,
          error: "Failed to send message",
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
        socket.emit("messageError", messageError);
      }
    });

    // Handle typing status
    socket.on("typing", ({ chatId, userId, username }) => {
      socket.to(`chat:${chatId}`).emit("userTyping", { userId, username });
    });

    socket.on("stopTyping", ({ chatId, userId }) => {
      socket.to(`chat:${chatId}`).emit("userStoppedTyping", { userId });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      try {
        const connectionInfo = connectionManager.getConnectionInfo(socket.id);
        if (connectionInfo) {
          // Notify all rooms this user was in
          connectionInfo.rooms.forEach((chatId) => {
            const roomId = formatRoomId(chatId);
            socket.to(roomId).emit("userLeft", {
              userId: connectionInfo.userId,
              username: connectionInfo.username,
              timestamp: new Date().toISOString(),
            });
          });
        }

        connectionManager.removeConnection(socket.id);
        logEvent("❌ Disconnection", { socketId: socket.id, userId });
      } catch (error) {
        console.error("Error in disconnect handler:", error);
      }
    });
  } catch (error) {
    handleError(socket, error, "connection");
    socket.disconnect(true);
  }
};

// Export connection status utility
export const getConnectionStatus = () => connectionManager.getStatus();
