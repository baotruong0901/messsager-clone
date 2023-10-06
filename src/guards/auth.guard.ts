import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as jwt from 'jsonwebtoken'
import { Model } from "mongoose";
import { UserInfoType } from "src/libs/types/user";
import { User, UserDocument } from "src/schema";


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context?.switchToHttp()?.getRequest()
            const token = this.extractTokenFromHeader(request)

            if (token) {
                const payload = await jwt.verify(token, process.env.SECRET_KEY!) as UserInfoType
                const user = await this.userModel.findById(payload.id)
                if (!user) throw new HttpException('Unauthorized!', 400)
                request['user'] = user
                return true
            }
            throw new HttpException('Unauthorized!', 400)
        } catch (error: any) {
            throw new HttpException('Unauthorized!', 400)
        }
    }

    private extractTokenFromHeader(request: any) {
        const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}