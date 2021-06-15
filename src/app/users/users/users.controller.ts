import {
  Controller,
  Post,
  Body,
  UsePipes,
  Get,
  Param,
  Query,
  UseFilters,
  UseGuards,
  Request,
  ValidationPipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserDto, UserProfileUpdateDto } from '../dto/users.dto';

import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { HttpExceptionFilter } from 'src/shared/exception-filters/http-exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CgpService } from '../../cgp/cgp/cgp.service';

export const profileStorage = diskStorage({
  destination: './public/profile/profileImage',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // To return particular user by specific id
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpExceptionFilter())
  @Get(':id')
  @ApiParam({ name: 'id' })
  async findOne(@Param() params: any): Promise<ResponseDto> {
    console.log(params.id);
    const id = params.id;
    return await this.usersService.getUserById(id);
  }

  // To return list of Users
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpExceptionFilter())
  @Get()
  async index(
    @Query('page') page = 0,
    @Query('limit') limit = 10,
  ): Promise<ResponseDto> {
    limit = limit > 100 ? 100 : limit;
    return await this.usersService.findAll({ page, limit, route: '' });
  }

  // To return list of Users
  // @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'userId' })
  @Get('/profile/:userId')
  async getUsersProfile(@Param() params: any): Promise<ResponseDto> {
    const userId = params.userId;
    return await this.usersService.getUsersProfile(userId);
  }

  // To create a new User
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('/profile/update')
  async updateUserProfile(
    @Body() userProfileUpdateDto: UserProfileUpdateDto,
    @Request() req: any,
  ) {
    return await this.usersService.updateUserProfile(
      userProfileUpdateDto,
      req.user,
    );
  }

  @Put('/profile/image/:userId')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'userId' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profileImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('profileImage'))
  async uploadProfileImage(
    @UploadedFile('file') profileImage,
    @Param() params: any,
  ): Promise<any> {
    console.log(profileImage);

    const uploadData = await this.usersService.uploadFile(
      profileImage,
      'profileImage',
    );

    this.usersService.updateProfileImage(params.userId, uploadData.url);
    return uploadData;
  }
}
