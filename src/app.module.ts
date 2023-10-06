import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './schema';
import { UploadImageService } from './upload-image/upload-image.service';
import { ConversationModule } from './conversation/conversation.module';
import { MessagesModule } from './messages/messages.module';
import { PusherService } from './pusher.service';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        envFilePath: '.env',
        isGlobal: true
      }
    ),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    ConversationModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, UploadImageService, PusherService],
})
export class AppModule { }
