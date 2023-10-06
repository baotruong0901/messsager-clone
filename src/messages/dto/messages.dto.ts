import { IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsString()
    image?: Express.Multer.File;

    @IsString()
    conversationId: string;

    @IsOptional()
    like?: boolean;
}

export class GetMessagesDto {
    @IsString()
    conversationId: string;
}

export class UpdateMessageDto {
    @IsString()
    type: string
}