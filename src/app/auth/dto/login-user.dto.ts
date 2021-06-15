import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { Match } from 'src/shared/decorators/match.decorator';
import { Roles } from "../../cgp/entities/cgp-teams.entity";

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

@Exclude()
export class UserTokenDto {
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
  mobileNumber: string;

  @ApiProperty()
  @Expose()
  token: string;

  @ApiProperty()
  @Expose()
  passwordFlag: number;

  @ApiProperty()
  @Expose()
  emailVerify: number;

  @ApiProperty()
  @Expose()
  googleAuth: number;

  @ApiProperty()
  @Expose()
  facebookAuth: number;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  cgpId: string;

  @ApiProperty()
  @Expose()
  @Type(() => CgpTeams)
  cgpTeams: CgpTeams[];
}

@Exclude()
export class CgpTeams {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  role: Roles;
}

export class CgpSetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  // @MinLength(4)
  // @MaxLength(20)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  // @MinLength(4)
  // @MaxLength(20)
  @Match('password')
  confirmPassword: string;
}

// Request DTO
export class UserPasswordDto extends CgpSetPasswordDto {
  @ApiProperty()
  oldPassword: string;
}
