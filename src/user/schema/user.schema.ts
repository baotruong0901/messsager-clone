import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Conversation } from "src/schema";

export enum UserType {
    USER = 'USER',
    ADMIN = 'ADMIN',
}


export type UserDocument = User & Document


@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop()
    phone: string;

    @Prop({ unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop({ type: String, enum: UserType, default: UserType.USER })
    userType: UserType;

    @Prop({ default: '' })
    avatar: string;

    @Prop({ default: '' })
    description: string

    @Prop({ default: false })
    onBoarding: boolean

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }])
    conversations: Conversation[]
}

export const UserSchema = SchemaFactory.createForClass(User);