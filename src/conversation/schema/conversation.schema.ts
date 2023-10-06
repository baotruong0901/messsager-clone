import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Messages, User } from "src/schema";



export type ConversationDocument = Conversation & Document


@Schema({ timestamps: true })
export class Conversation {
    @Prop({ default: Date.now() })
    lastMessageAt: Date

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Messages' })
    lastMessage: Messages

    @Prop()
    name?: string;

    @Prop({ default: false })
    isGroup: Boolean;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
    users: User[]

    @Prop([
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            deletedAt: { type: Date },
        },
    ])
    deletedBy: { user: User; deletedAt: Date }[];

}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);