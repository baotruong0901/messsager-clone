import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateConversationDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsBoolean()
    @IsOptional()
    isGroup: boolean;

    @IsArray()
    @IsOptional()
    members: any[];

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name: string
}