import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationParams } from 'src/libs/types/conversation';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, ConversationDocument } from './schema/conversation.schema';
import { Model } from 'mongoose';
import { Messages, MessagesDocument, User, UserDocument } from 'src/schema';
import { PusherService } from 'src/pusher.service';
import { UserType } from 'src/libs/types/user';

@Injectable()
export class ConversationService {

    constructor(
        @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Messages.name) private readonly messagesModel: Model<MessagesDocument>,
        private readonly pusherService: PusherService,
    ) { }

    async createConversation(currentId: string, data: CreateConversationParams) {
        try {
            const { userId, isGroup, members, name } = data

            if (currentId === userId) throw new HttpException('error', 400)

            if (isGroup && (!members || members.length < 2 || !name)) {
                return new HttpException("Invalid data!", 400)
            }

            if (isGroup) {
                const newConversation = new this.conversationModel({
                    name,
                    isGroup,
                    users: [...members, currentId]
                })
                await newConversation.save()
                await this.conversationModel.populate(newConversation, {
                    path: "users",
                    select: "-password -__v"
                })


                newConversation.users.map((user) => {
                    if (user.email) {
                        this.pusherService.trigger(user.email, 'conversation:new', newConversation)
                    }
                })

                return newConversation
            }

            const exisitingSingleConversations = await this.conversationModel.findOne({
                $and: [
                    {
                        users: { $all: [userId, currentId] },
                    },
                    {
                        isGroup: false
                    },
                ],
            })

            if (exisitingSingleConversations) {
                return exisitingSingleConversations
            }

            const newConversation = new this.conversationModel({
                users: [userId, currentId]
            })

            await this.conversationModel.populate(newConversation, {
                path: "users",
                select: "-password -__v"
            })

            await newConversation.save()

            newConversation.users.map((user) => {
                if (user.email) {
                    this.pusherService.trigger(user.email, 'conversation:new', newConversation)
                }
            })

            return newConversation
        } catch (error: any) {
            throw new HttpException(error, 400)
        }
    }

    async seenMessage(conversationId: string, currentId: User & { _id: string }) {
        try {
            const conversation = await this.conversationModel.findById(conversationId).populate({
                path: 'lastMessage',
                populate: {
                    path: "seens",
                    select: 'avatar name phone email'
                }
            })

            const updatedMessage = await this.messagesModel.findByIdAndUpdate(
                conversation.lastMessage,
                {
                    $addToSet: { seens: currentId?._id }
                },
                { new: true }
            ).populate(
                { path: 'sender seens', select: 'avatar name phone email' }
            );

            await this.pusherService.trigger(currentId.email!, 'conversation:update', {
                _id: conversationId,
                lastMessage: updatedMessage,
                lastMessageAt: conversation.lastMessageAt
            })

            await this.pusherService.trigger(conversationId!, 'message:update', updatedMessage);

            return updatedMessage

        } catch (error: any) {
            throw new HttpException(error, 400)
        }

    }

    async getConversations(currentId: string, isGroup: boolean = false, searchString: string, pageNumber: number, pageSize: number) {
        const query: any = { users: { $in: currentId } };

        if (!isGroup) {
            if (searchString) {
                query.users = {
                    $in: await this.userModel.find({
                        $or: [
                            { "name": { $regex: searchString, $options: "i" } },
                            { "phone": { $regex: searchString, $options: "i" } },
                            { "email": { $regex: searchString, $options: "i" } }
                        ]
                    }).distinct("_id")
                };
            }
        } else {
            if (searchString) {
                query.$or = [
                    { "name": { $regex: searchString, $options: "i" } },
                    {
                        "users": {
                            $in: await this.userModel.find({
                                $or: [
                                    { "name": { $regex: searchString, $options: "i" } },
                                    { "phone": { $regex: searchString, $options: "i" } },
                                    { "email": { $regex: searchString, $options: "i" } }
                                ]
                            }).distinct("_id")
                        }
                    }
                ];
            }
            query.isGroup = isGroup
        }

        const conversations = await this.conversationModel.find(query)
            .sort({ lastMessageAt: 'desc' })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .populate({
                path: "users",
                select: "phone name email avatar"
            })
            .populate({
                path: "lastMessage",
                select: "body image like seens sender",
                populate: [{
                    path: "seens",
                    select: "phone name email avatar"
                }, {
                    path: "sender",
                    select: "phone name email avatar"
                }
                ]
            })
            .exec()

        return conversations
    }

    async getConversationById(conversationId: string) {
        const conversation = await this.conversationModel.findById(conversationId)
            .populate({
                path: "users",
                select: "phone name email avatar"
            }).exec()
        if (!conversation) throw new HttpException('Not Found', 400)

        return conversation
    }

    async deleteConversationByCurrentUser(currentId: UserType, conversationId: string) {
        const user = await this.userModel.findById(currentId._id);

        const conversation = await this.conversationModel.findById(conversationId)
        if (!conversation) {
            throw new HttpException('Not found!', 400);
        }
        // Kiểm tra xem userId đã tồn tại trong deletedBy chưa
        const findDeletedBy = conversation.deletedBy.findIndex(
            item => item.user.toString() === currentId?._id.toString()
        );

        if (findDeletedBy !== -1) {
            // Nếu đã tồn tại, cập nhật deletedAt của user này
            conversation.deletedBy[findDeletedBy].deletedAt = new Date();
        } else {
            // Nếu chưa tồn tại, thêm mới user vào deletedBy
            conversation.deletedBy.push({
                user: user._id,
                deletedAt: new Date(),
            });
        }


        await conversation.save();

        const payload = {
            _id: conversation._id,
            deletedBy: {
                user: user._id,
                deletedAt: conversation.deletedBy[findDeletedBy].deletedAt,
            },
        };

        await this.pusherService.trigger(user.email!, 'conversation:delete', payload);

        return conversation
    }
}
