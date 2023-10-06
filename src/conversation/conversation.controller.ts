import { Body, Controller, Delete, Get, HttpException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { GetUser } from 'src/user/decorator';
import { CreateConversationDto } from './dto';
import { ConversationService } from './conversation.service';
import mongoose from 'mongoose';
import { User } from 'src/schema';
import { UserType } from 'src/libs/types/user';

@Controller('conversation')
export class ConversationController {

    constructor(private readonly conversationService: ConversationService) { }

    @UseGuards(AuthGuard)
    @Post()
    createConversation(
        @GetUser('id') currentId: string,
        @Body() body: CreateConversationDto,
    ) {
        console.log("Body", body);

        return this.conversationService.createConversation(currentId, body)
    }

    @UseGuards(AuthGuard)
    @Get()
    getConversations(
        @GetUser('id') currentId: string,
        @Query('searchString') searchString: string = "",
        @Query('isGroup') isGroup: boolean = false,
        @Query('pageNumber') pageNumber: number = 1,
        @Query('pageSize') pageSize: number = 20,
    ) {
        return this.conversationService.getConversations(currentId, isGroup, searchString, pageNumber, pageSize)
    }

    @UseGuards(AuthGuard)
    @Post(':conversationId/seen')
    seenMessage(
        @Param('conversationId') conversationId: string,
        @GetUser() currentId: User & { _id: string }
    ) {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            throw new HttpException('Invalid id', 400);
        }
        return this.conversationService.seenMessage(conversationId, currentId)
    }

    @UseGuards(AuthGuard)
    @Get(':conversationId')
    getConversationById(
        @Param('conversationId') conversationId: string
    ) {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            throw new HttpException('Invalid id', 400);
        }
        return this.conversationService.getConversationById(conversationId)
    }

    @UseGuards(AuthGuard)
    @Delete(':conversationId')
    deleteConversationByCurrentUser(
        @GetUser() currentId: UserType,
        @Param('conversationId') conversationId: string
    ) {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            throw new HttpException('Invalid id', 400);
        }
        return this.conversationService.deleteConversationByCurrentUser(currentId, conversationId)
    }
}
