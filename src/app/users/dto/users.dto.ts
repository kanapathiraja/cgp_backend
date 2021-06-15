import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Exclude, Expose, Type } from "class-transformer";
import { Gender } from "../entities/users.entity";
import { CgpInfoForArticle } from "../../cgp/dto/cgp-articles.dto";

// Request DTO
export class CreateUserDto {

    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    mobileNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    confirmPassword: string;
}

export class UpdateUserDto {

    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    mobile: string;

}

export class UserProfileUpdateDto {

    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    function: string;

    @ApiProperty()
    @IsNotEmpty()
    gender: Gender;

}

// Response DTO
@Exclude()
export class UsersDto {

    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    firstName: string;

    @ApiProperty()
    @Expose()
    lastName: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    token: string;

    @ApiProperty()
    @Expose()
    role: string;
}

// Response DTO
@Exclude()
export class UserListDto {

    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    firstName: string;

    @ApiProperty()
    @Expose()
    lastName: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    role: string;

    @ApiProperty()
    @Expose()
    function: string;

    @ApiProperty()
    @Expose()
    gender: string;

    @ApiProperty()
    @Expose()
    profileImage: string;

}

// Response DTO
@Exclude()
export class UserProfileDto {

    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    firstName: string;

    @ApiProperty()
    @Expose()
    lastName: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    role: string;

    @ApiProperty()
    @Expose()
    function: string;

    @ApiProperty()
    @Expose()
    gender: string;

    @ApiProperty()
    @Expose()
    profileImage: string;
}

@Exclude()
export class UserDetailsDto {

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    designation: string;

    @ApiProperty()
    @Expose()
    mobile: string;
}

// Request DTO
export class UserForgotPasswordDto {

    @ApiProperty()
    @IsNotEmpty()
    email: string;
}

// Request DTO
export class UserSearchDto {

    @ApiProperty()
    email: string;

    @ApiProperty()
    firstName: string;
}
