import { User } from "src/schema";

export interface SignupParams {
    email: string;
    phone: string;
    name: string;
    password: string;
}

export interface SignInParams {
    email: string;
    password: string;
}

export interface UserInfoType {
    id: string;
    iat: number;
    epx: number;
}

export interface UserType extends User {
    _id: string;
}


