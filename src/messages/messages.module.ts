import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from './schema';
import { Conversation, ConversationSchema, User, UserSchema } from 'src/schema';
import { UploadImageService } from 'src/upload-image/upload-image.service';
import { PusherService } from 'src/pusher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, UploadImageService, PusherService]
})
export class MessagesModule { }
