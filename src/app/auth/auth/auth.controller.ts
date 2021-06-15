import { Controller, UseGuards, Post, Request, Get, UsePipes, ValidationPipe, Body, UseFilters, Put, Param } from '@nestjs/common';
import { UserRegisterDto, TokenVerifyDto } from '../dto/auth-dto';
import { CgpSetPasswordDto, LoginUserDto, UserPasswordDto } from '../dto/login-user.dto';
import { ApiBody, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserForgotPasswordDto } from 'src/app/users/dto/users.dto';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { HttpExceptionFilter } from 'src/shared/exception-filters/http-exception.filter';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
   
  constructor(private authService: AuthService) {}

    // User authentication    
    @UseFilters(new HttpExceptionFilter())
    @UsePipes(new ValidationPipe())
    @Post('login')
    @ApiBody({ type: LoginUserDto})
    async authenticate(@Body() loginUserDto: LoginUserDto): Promise<ResponseDto> {
        return await this.authService.authenticate(loginUserDto);
    }

    // User register
    @UseFilters(new HttpExceptionFilter())
    @UsePipes(new ValidationPipe())
    @Post('register')
    @ApiBody({ type: UserRegisterDto})
    async register(@Body() userRegisterDto: UserRegisterDto): Promise<ResponseDto>{
      return await this.authService.register(userRegisterDto);
    }

    // User create password for first time 
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe())
    @Post('password/create')
    async createPassword(@Body() userPasswordData: UserPasswordDto, @Request() req: any): Promise<ResponseDto>{
      console.log(userPasswordData)
      console.log(req)
      return await this.authService.createPassword(userPasswordData, req.user);
    }

    // User forgot password - send verification mail
    @UsePipes(new ValidationPipe())
    @Post('password/forgot')
    async forgotPassword(@Body() userData: UserForgotPasswordDto): Promise<ResponseDto>{
      return await this.authService.forgotPassword(userData);
    }

    @ApiParam({ name: 'userId' })
    @UsePipes(new ValidationPipe())
    @Put('password/change/:userId')
    async changePassword(@Body() userPasswordData: UserPasswordDto, @Param() params: any): Promise<ResponseDto>{
      console.log("file: auth.controller.ts - line 57 - AuthController - params", params);
      return await this.authService.changePassword(userPasswordData, params.userId);
    }

    @ApiParam({ name: 'token' })
    @UsePipes(new ValidationPipe())
    @Put('password/reset/:token')
    async resetPassword(@Body() cgpSetPasswordData: CgpSetPasswordDto, @Param() params: any): Promise<ResponseDto>{
      return await this.authService.resetPassword(cgpSetPasswordData, params.token);
    }

    // User forgot password - check user verification
    @UseFilters(new HttpExceptionFilter())
    @UsePipes(new ValidationPipe())
    @Get('token/verify/:token')
    @ApiParam({ name: 'token' })
    async verifyAccessToken(@Param() params: any): Promise<ResponseDto>{      
      return await this.authService.verifyAccessToken(params.token);
    }


    @ApiParam({ name: 'userId' })
    @UsePipes(new ValidationPipe())
    @Get('password/check/update/:userId')
    async checkIfPasswordUpdated(@Param() params: any): Promise<ResponseDto>{
      return await this.authService.checkIfPasswordUpdated(params.userId);
    }

    @ApiParam({ name: 'userId' })
    @UsePipes(new ValidationPipe())
    @Put('password/set/:userId')
    async setPassword(@Body() cgpSetPasswordData: CgpSetPasswordDto, @Param() params: any): Promise<ResponseDto>{
      return await this.authService.setPassword(cgpSetPasswordData, params.userId);
    }

  @UsePipes(new ValidationPipe())
  @Get('emailValidate/:email/:role')
  @ApiParam({ name: 'email' })
  @ApiParam({ name: 'role' })
  async emailValidate(@Param() params: any): Promise<ResponseDto>{
    return await this.authService.authEmailValidation(
      params.email,
      params.role,
    );
  }

}
