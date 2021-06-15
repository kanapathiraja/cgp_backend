import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDefined, isNotEmpty, IsNotEmpty, IsNotEmptyObject, IsObject, MinLength, ValidateNested } from "class-validator";


export class CgpTagsListDto {
    @ApiProperty()
    @IsNotEmpty()
    tagId: number;    

    @ApiProperty()
    @IsNotEmpty()
    tagName: string;    
}


export class CreateCgpTagsDto {

    @ApiProperty()	
    @IsArray()
    tags: [];  
}


