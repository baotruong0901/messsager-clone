import { ObjectId } from "mongoose";
import { Conversation, User } from "src/schema";
import { UserType } from "./user";

export interface CreateConversationParams {
    userId?: string,
    isGroup?: boolean,
    members?: string[],
    name?: string,
}
