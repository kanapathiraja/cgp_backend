import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export enum Roles {
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
  DIRECTOR = 'DIRECTOR'
}

// Create CGPTeam Dto
export class CreateCgpTeamDto {
  @ApiProperty()
  @IsNotEmpty()
  cgpId: string;

  @ApiProperty()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  // @IsNotEmpty()
  role: Roles;

  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  designation: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  addressComplement: string;

  @ApiProperty()
  addressType: string;

  @ApiProperty()
  addressNumber: string;

  @ApiProperty()
  addressStreet: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  address: string;
}

// Update CGPTeam Dto
export class UpdateCgpTeamDto {
  @ApiProperty()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  // @IsNotEmpty()
  role: Roles;

  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  designation: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  addressComplement: string;

  @ApiProperty()
  addressType: string;

  @ApiProperty()
  addressNumber: string;

  @ApiProperty()
  addressStreet: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  cgpId: string;
}

export class UpdateTeamRoles {

  @ApiProperty()
  role: Roles
}

// View CGP Team
export class CgpTeamListDto {}


export class TeamInviteListDto {

  @ApiProperty()
  emailId: Array<any>;

}

export class CreateNewCgpTeamDto {
  @ApiProperty()
  @IsNotEmpty()
  cgpId: string;

  @ApiProperty()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  // @IsNotEmpty()
  role: Roles;

  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  designation: string;


  @ApiProperty()
  password: string;

  @ApiProperty()
  function: string;

  @ApiProperty()
  gender: string;

}
