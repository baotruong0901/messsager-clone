import { Body, Controller, Get, Param, Patch, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto';
import { multerOptions } from 'src/config';
import { AuthGuard } from 'src/guards/auth.guard';
import { GetUser } from './decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard)
    @Get()
    getUser(
        @GetUser('id') currentId: string,
    ) {
        return this.userService.getUser(currentId)
    }

    @UseGuards(AuthGuard)
    @Get('all')
    getAllUser(
        @GetUser('id') currentId: string,
        @Query('searchString') searchString: string = "",
        @Query('pageNumber') pageNumber: number = 1,
        @Query('pageSize') pageSize: number = 20,
    ) {
        return this.userService.getAllUser(currentId, searchString, pageNumber, pageSize)
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    @UseInterceptors(FileInterceptor("avatar"))
    updateUser(
        @Param('id') userId: string,
        @UploadedFile() avatar: Express.Multer.File,
        @Body() body: UpdateUserDto,
    ) {
        const updatedData: Partial<UpdateUserDto> = {
            ...body,
            avatar: avatar && avatar
        };

        return this.userService.updateUser(updatedData, userId)
    }
}
