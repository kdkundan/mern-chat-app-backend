import ChatModel from "../models/chat";

/**
 * Fetch all chats that a user is a member of
 * @param userId - The ID of the user
 * @returns Array of chat documents
 */
export const getUserChats = async (userId: string) => {
  try {
    const chats = await ChatModel.find({
      members: { $in: [userId] },
    }).select("_id chatName isGroupChat members");

    return chats;
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }
};

/**
 * Get all chat IDs for a user
 * @param userId - The ID of the user
 * @returns Array of chat IDs as strings
 */
export const getUserChatIds = async (userId: string): Promise<string[]> => {
  try {
    const chats = await getUserChats(userId);
    return chats.map((chat) => chat._id.toString());
  } catch (error) {
    console.error("Error fetching user chat IDs:", error);
    return [];
  }
};
