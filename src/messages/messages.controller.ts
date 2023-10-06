import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { GetUser } from 'src/user/decorator';
import { CreateMessageDto, GetMessagesDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config';
import { MessagesService } from './messages.service';
import { UpdateType } from './schema';
import { UserType } from 'src/libs/types/user';

@Controller('messages')
export class MessagesController {

    constructor(private readonly messagesService: MessagesService) { }

    @UseGuards(AuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor("image", multerOptions))
    createMessage(
        @GetUser('id') currentId: string,
        @UploadedFile() image: Express.Multer.File,
        @Body() body: CreateMessageDto
    ) {
        const isLike = body?.like?.toString() === 'true';
        const data: CreateMessageDto = {
            ...body,
            like: isLike,
            image: image && image
        }

        return this.messagesService.createMessage(currentId, data)
    }



    @UseGuards(AuthGuard)
    @Get(':conversationId')
    getMessageByConversationId(
        @GetUser('id') currentId: string,
        @Param("conversationId") conversationId: string
    ) {
        return this.messagesService.getMessageByConversationId(currentId, conversationId)
    }

    @UseGuards(AuthGuard)
    @Patch(':type/:messageId')
    updateMessage(
        @GetUser() currentId: UserType,
        @Param('messageId') messageId: string,
        @Param('type') type: UpdateType,
    ) {
        return this.messagesService.updateMessage(currentId, messageId, type)
    }
}
