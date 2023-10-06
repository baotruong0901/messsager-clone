import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserType } from './schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { SignInParams, SignupParams } from 'src/libs/types/user';
import { UpdateUserDto } from './dto';
import { UploadImageService } from 'src/upload-image/upload-image.service';


const EXPIRE_TIME = 10 * 60 * 60 * 1000


@Injectable()
export class UserService {
    constructor(
        private readonly uploadImageService: UploadImageService, @InjectModel(User.name) private readonly userModel: Model<UserDocument>

    ) { }

    async signup(
        data: SignupParams,
        userType: UserType
    ) {
        const { email, password, name, phone } = data

        const userExists = await this.userModel.findOne({ email })

        if (userExists) {
            throw new HttpException("User already exists!", 400)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await this.userModel.create({
            email,
            name,
            phone,
            password: hashedPassword,
            userType,
        })


        return await this.generateJWT(user._id)
    }

    async signin(
        data: SignInParams
    ) {
        const { email, password } = data

        const user = await this.userModel.findOne({ email })

        if (!user) {
            throw new HttpException("Invalid credentials!", 400)
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            throw new HttpException("Wrong password!", 400)
        }

        return await this.generateJWT(user._id)
    }

    async getUser(userId: string) {
        return await this.userModel.findById(userId).select('-password -__v -createdAt -updatedAt')
    }

    async getAllUser(currentId: string, searchString: string, pageNumber: number, pageSize: number) {

        const query: any = { _id: { $ne: currentId } };

        if (searchString) {
            query.$or = [
                { name: { $regex: new RegExp(searchString, 'i') } },
                { phone: { $regex: new RegExp(searchString, 'i') } },
                { email: { $regex: new RegExp(searchString, 'i') } },
            ];
        }
        console.log(query);



        const users = await this.userModel
            .find(query)
            .select('name phone email avatar')
            .sort("decs")
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        return users
    }

    async updateUser(data: UpdateUserDto, userId: string) {

        const { avatar } = data

        if (avatar) {
            const image = await this.uploadImageService.uploadFile(avatar)

            const updateUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    ...data,
                    avatar: image.url,
                    onBoarding: true
                },
                { new: true }
            ).select('-password -__v -createdAt')
            return updateUser
        }

        const updateUser = await this.userModel.findByIdAndUpdate(
            userId,
            {
                ...data,
                onBoarding: true
            },
            { new: true }
        ).select('-password -__v -createdAt')

        return updateUser
    }

    async refreshToken(userId: string) {
        return this.generateJWT(userId)
    }

    private async generateJWT(id: string) {
        const user = await this.userModel.findById(id).select("name phone email avatar onBoarding description")

        return {
            user,
            tokens: {
                accessToken: await jwt.sign(
                    {
                        id
                    }, process.env.SECRET_KEY!,
                    {
                        expiresIn: '10h'
                    }
                ),
                refreshToken: await jwt.sign(
                    {
                        id
                    }, process.env.REFRESH_TOKEN_KEY!,
                    {
                        expiresIn: '7d'
                    }
                ),
                expriesIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME)
            }
        }
    }
}
