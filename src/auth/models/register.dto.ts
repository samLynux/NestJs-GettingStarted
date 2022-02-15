import {IsEmail, IsNotEmpty} from "class-validator";

export class RegisterDTO{
    @IsNotEmpty()
    firstname:string;

    @IsNotEmpty()
    lastname:string;

    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    password:string;

    @IsNotEmpty()
    passwordconfirm:string;
}