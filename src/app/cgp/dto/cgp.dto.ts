import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreatePracticalInfoDto } from './cgp-practicalinfo.dto';
import { CgpStatus } from '../entities/cgp.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { CgpInfoForArticle } from './cgp-articles.dto';

// Request DTO
export class CreateCgpDto {
  @ApiProperty()
  @IsNotEmpty()
  establishmentName: string;

  @ApiProperty()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  eSiret: string;

  @ApiProperty()
  @IsNotEmpty()
  hOrias: string;

  @ApiProperty()
  @IsNotEmpty()
  hCif: boolean;

  @ApiProperty()
  @IsNotEmpty()
  contactNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  hCompanyRcsSiren: string;

  @ApiProperty()
  @IsNotEmpty()
  hCoa: boolean;

  @ApiProperty()
  addressComplement: string;

  @ApiProperty()
  addressType: string;

  @ApiProperty()
  @IsNotEmpty()
  addressNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  addressStreet: string;

  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  @IsNotEmpty()
  designation: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  contactPersonEmail: string;

  geoLocation: string;
}

// Request DTO
export class UpdateCgpDto {
  @ApiProperty()
  establishmentName: string;

  @ApiProperty()
  companyAddress: string;

  @ApiProperty()
  website: string;

  @ApiProperty()
  foundedYear: string;

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
  logo: string;
}

// Request DTO
export class CgpSpecialitiesDto {
  @ApiProperty()
  speciality_name: string;
}

// Request DTO
export class CGPStatusUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  status: CgpStatus;

  @ApiProperty()
  reason: string;
}

// Request DTO
export class DescriptionCgpDto {
  @ApiProperty()
  @IsNotEmpty()
  presentationText: string;
}

// Request DTO
export class CGPSocialWebsiteDto {
  @ApiProperty()
  linkedIn: string;

  @ApiProperty()
  facebook: string;

  @ApiProperty()
  twitter: string;

  @ApiProperty()
  youtube: string;

  @ApiProperty()
  instagram: string;

  @ApiProperty()
  cgpPracticalInfo: CreatePracticalInfoDto[];
}

// Response DTO
@Exclude()
export class CGPInfoDto {
  @ApiProperty()
  @Expose()
  establishmentName: string;

  @ApiProperty()
  @Expose()
  companyAddress: string;

  @ApiProperty()
  @Expose()
  website: string;

  @ApiProperty()
  @Expose()
  foundedYear: string;

  @ApiProperty()
  @Expose()
  linkedIn: string;

  @ApiProperty()
  @Expose()
  facebook: string;

  @ApiProperty()
  @Expose()
  twitter: string;

  @ApiProperty()
  @Expose()
  youtube: string;

  @ApiProperty()
  @Expose()
  instagram: string;

  @ApiProperty()
  @Expose()
  logo: string;

  @ApiProperty()
  @Expose()
  addressComplement: string;

  @ApiProperty()
  @Expose()
  addressType: string;

  @ApiProperty()
  @Expose()
  addressNumber: string;

  @ApiProperty()
  @Expose()
  addressStreet: string;

  @ApiProperty()
  @Expose()
  city: string;

  @ApiProperty()
  @Expose()
  country: string;

  @ApiProperty()
  @Expose()
  postalCode: string;
}

// Request DTO
export class CGPSearchListReqDto {
  @ApiProperty()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  dayName: string;

  @ApiProperty()
  time: any;
}

@Exclude()
export class CgpInfoForLogin {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  establishmentName: string;

  @ApiProperty()
  @Expose()
  eSiret: any;

  @ApiProperty()
  @Expose()
  @Type(() => CGPRole)
  cgpTeams: CGPRole[];
}

@Exclude()
export class CGPRole {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  role: string;
}


@Exclude()
export class CgpAddressInfoDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  companyAddress: string;

  @ApiProperty()
  @Expose()
  addressComplement: string;

  @ApiProperty()
  @Expose()
  addressType: string;

  @ApiProperty()
  @Expose()
  addressNumber: string;

  @ApiProperty()
  @Expose()
  addressStreet: string;

  @ApiProperty()
  @Expose()
  city: string;

  @ApiProperty()
  @Expose()
  country: string;

  @ApiProperty()
  @Expose()
  postalCode: string;
}
