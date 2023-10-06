import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Conversation, User } from "src/schema";

export enum UpdateType {
    deleted = "deleted",
    recall = "recall"
}

export type MessagesDocument = Messages & Document


@Schema({ timestamps: true })
export class Messages {
    @Prop()
    body?: string

    @Prop()
    image?: string;

    @Prop()
    like?: boolean;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
    seens: User[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    sender: User

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' })
    conversation: Conversation

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
    deleted: User[];

    @Prop({ default: false })
    recall: boolean

}


export const MessagesSchema = SchemaFactory.createForClass(Messages);
