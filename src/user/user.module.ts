import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthController } from './auth/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema';
import { UploadImageService } from 'src/upload-image/upload-image.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ])
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, UploadImageService],
})
export class UserModule { }
