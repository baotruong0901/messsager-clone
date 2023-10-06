export interface CreateMessageParamas {
    message?: string;
    image?: Express.Multer.File;
    conversationId: string;
    like?: boolean;
}

export interface MessageResponse {
    _id: ObjectId;
    image: string;
    seens: ObjectId[];
    sender: ObjectId;
    conversation: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deleted: ObjectId[];
    recall: boolean;
    __v: number;
}