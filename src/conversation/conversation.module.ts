import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema, Messages, MessagesSchema, User, UserSchema } from 'src/schema';
import { PusherService } from 'src/pusher.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService, PusherService]
})
export class ConversationModule { }
