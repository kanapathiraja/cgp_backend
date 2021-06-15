import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreatePracticalInfoDto {

    @ApiProperty()
    @IsNotEmpty()
    dayName: string;

    @ApiProperty()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty()
    @IsNotEmpty()
    endTime: string;

}
