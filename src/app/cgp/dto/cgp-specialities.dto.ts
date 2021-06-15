import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";


export class SpecialitiesListDto {
    @ApiProperty()
    @Expose()
    specialityId: number;    
}


export class CreateSpecialitesDto {
    @ApiProperty()
    @IsNotEmpty()
    specialities: [];
}


