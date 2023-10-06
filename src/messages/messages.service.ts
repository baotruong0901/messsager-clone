import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMessageParamas, MessageResponse } from 'src/libs/types/message';
import { Messages, MessagesDocument, UpdateType } from './schema';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument, User, UserDocument } from 'src/schema';
import { UploadImageService } from 'src/upload-image/upload-image.service';
import { PusherService } from 'src/pusher.service';
import { UserType } from 'src/libs/types/user';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Messages.name) private readonly messagesModel: Model<MessagesDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
        private readonly uploadImageService: UploadImageService,
        private readonly pusherService: PusherService,

    ) { }
    async createMessage(currentId: string, data: CreateMessageParamas) {
        const { message, image, conversationId, like } = data

        let newMessage

        if (image) {
            const imageUpload = await this.uploadImageService.uploadFile(image)
            newMessage = new this.messagesModel({
                body: message,
                image: imageUpload.url,
                conversation: conversationId,
                sender: currentId,
                seens: currentId
            })
        }

        if (like) {
            newMessage = new this.messagesModel({
                body: message,
                like,
                conversation: conversationId,
                sender: currentId,
                seens: currentId
            })
        }

        if (message) {
            newMessage = new this.messagesModel({
                body: message,
                conversation: conversationId,
                sender: currentId,
                seens: currentId
            })
        }

        await this.messagesModel.populate(newMessage, { path: 'sender seens', select: 'avatar name phone email' });


        await newMessage.save();



        const updatedConversation = await this.conversationModel.findByIdAndUpdate(
            conversationId,
            {
                lastMessageAt: new Date(),
                lastMessage: newMessage
            },
            {
                new: true
            }
        ).populate(
            [
                {
                    path: 'lastMessage',
                    populate:
                    {
                        path: 'sender seens',
                        select: 'avatar name phone email'
                    }
                },
                {
                    path: 'users',
                    select: 'avatar name phone email'
                }]
        );



        const lastMessage = updatedConversation?.lastMessage;

        await this.pusherService.trigger(conversationId, 'messages:new', newMessage)

        updatedConversation?.users.map((user) => {
            this.pusherService.trigger(user.email!, 'conversation:update', {
                _id: conversationId,
                lastMessage,
                lastMessageAt: new Date
            })
        })

        updatedConversation?.users.map((user) => {
            if (user.email) {
                this.pusherService.trigger(user.email, 'conversation:new', updatedConversation)
            }
        })

        return newMessage
    }

    async getMessageByConversationId(currentId: string, conversationId: string) {
        try {
            const conversation = await this.conversationModel.findById(conversationId)

            const userIsDeleted = conversation?.deletedBy.findIndex((item) => item.user.toString() === currentId)

            const messages = await this.messagesModel.find({ conversation: conversationId }).populate({
                path: 'sender seens',
                select: 'avatar name phone email'
            }) as MessageResponse[]

            const user = await this.userModel.findById(currentId)

            if (!messages) throw new HttpException('Not Found!', 400)
            const filteredMessages = messages.filter((message) => !message.deleted.includes(user?._id))

            if (userIsDeleted !== -1) {
                // Hiển thị chỉ tin nhắn mới (sau thời điểm cuộc trò chuyện bị xoá)
                const deletedAt = conversation?.deletedBy[userIsDeleted!].deletedAt;
                const filteredMessages = messages.filter(message => message.createdAt > deletedAt! && !message.deleted.includes(user?._id))
                return filteredMessages
            }

            return filteredMessages
        } catch (error: any) {
            throw new HttpException(`Not Found!${error}`, 400)
        }
    }

    async updateMessage(currentId: UserType, messageId: string, type: UpdateType) {


        const message = await this.messagesModel.findById(messageId)


        if (!message) {
            throw new HttpException('Not Found!', 400);
        }

        const user = await this.userModel.findById(currentId)
        if (type === UpdateType.recall) {
            if (currentId?._id.toString() === message.sender.toString()) {
                // Nếu currentId trùng với senderId và type là "recall"
                if (type === UpdateType.recall) {
                    message[type] = true;
                }
            }
            else {
                // Nếu currentId không trùng với senderId và type là "deleted"
                if (type === UpdateType.recall) {

                    throw new HttpException('Authorization', 400)
                }

            }
        }

        if (type === UpdateType.deleted) {
            if (!message.deleted.includes(user?._id)) {
                message.deleted.push(user?._id);
            }
        }



        await this.messagesModel.populate(message, { path: 'sender seens', select: 'avatar name phone email' });

        await message.save();

        const findConversation = await this.conversationModel.findById(message?.conversation)


        if (message.deleted && message.deleted.includes(user?._id)) {
            await this.pusherService.trigger(findConversation?._id.toString(), 'message:deleted', message);
        } else {
            await this.pusherService.trigger(findConversation?._id.toString(), 'message:update', message);
        }


        if (findConversation?.lastMessage.toString() === message?._id.toString()) {
            await this.conversationModel.populate(findConversation, [
                {
                    path: 'lastMessage',
                    populate:
                    {
                        path: 'sender seens',
                        select: 'avatar name phone email'
                    }
                },
                {
                    path: 'users',
                    select: 'avatar name phone email'
                }])
            await findConversation?.users.map((user) => {
                this.pusherService.trigger(user.email!, 'conversation:update', {
                    _id: message?.conversation,
                    lastMessage: message,
                    // lastMessageAt: new Date
                })
            })
        }

        return {
            statusCode: HttpStatus.OK,
            message: 'Update successful!',
            data: message,
        };
    }
}
