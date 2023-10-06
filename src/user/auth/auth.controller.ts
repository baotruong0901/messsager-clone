import { Body, Controller, HttpCode, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SignInDto, SignupDto, UpdateUserDto } from '../dto';
import * as bcrypt from 'bcryptjs'
import { UserService } from '../user.service';
import { UserType } from '../schema';
import { RefreshGuard } from 'src/guards/refresh.guard';


@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService) { }


    @HttpCode(200)
    @Post('/signup/:userType')
    async signup(
        @Body() body: SignupDto,
        @Param('userType') userType: UserType
    ) {
        return await this.userService.signup(body, userType)
    }

    @HttpCode(200)
    @Post('/signin')
    async signin(@Body() body: SignInDto) {
        return await this.userService.signin(body)
    }

    @UseGuards(RefreshGuard)
    @Post('refresh')
    refreshToken(
        @Req() req: any
    ) {
        return this.userService.refreshToken(req.user._id)
    }
}
