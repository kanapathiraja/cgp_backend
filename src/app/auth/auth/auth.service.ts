import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { UserRegisterDto, TokenVerifyDto } from '../dto/auth-dto';
import {
  CgpSetPasswordDto,
  LoginUserDto,
  UserPasswordDto,
  UserTokenDto,
} from '../dto/login-user.dto';
import { UsersService } from '../../users/users/users.service';
import { Role, Users } from '../../users/entities/users.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import { JwtCustomService } from 'src/shared/services/jwt-custom.service';
import {
  UserForgotPasswordDto,
  UserListDto,
  UsersDto,
} from 'src/app/users/dto/users.dto';
import { CommonService } from 'src/shared/services/common.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { constant } from 'src/shared/constant/constant';
import { MailServiceTemplateService } from 'src/shared/services/mail-service-template.service';
import { CgpService } from 'src/app/cgp/cgp/cgp.service';
import { MailTemplateCustomService } from 'src/shared/services/mail-template-custom.service';
import { MailTemplateService } from 'src/app/mail-template/mail-template/mail-template.service';
import { Cgp } from "../../cgp/entities/cgp.entity";

const dotenv = require('dotenv');
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Cgp)
    private readonly cgpRepository: Repository<Cgp>,
    private usersService: UsersService,
    private readonly commonService: CommonService,
    private readonly jwtCustomService: JwtCustomService,
    private readonly mailTemplateCustomService: MailTemplateCustomService,
    private mailTemplateService: MailTemplateService,
  ) {}

  // To register public users and send welcome mail service
  async register(userData: UserRegisterDto): Promise<ResponseDto> {
    const { email } = userData;
    const user = await this.userRepository.findOne({ email });
    if (user) {
      throw new HttpException(
        constant.notification.isExsitingEmail,
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser = new Users();
    newUser.firstName = userData.firstName;
    newUser.lastName = userData.lastName;
    newUser.email = userData.email;
    newUser.password = userData.password;
    newUser.passwordFlag = 0;
    newUser.role = Role.USER;
    const errors = await validate(userData); // Validate Fileds
    if (errors.length > 0) {
      const _errors = { username: 'Userinput is not valid.' };
      throw new HttpException(
        { message: constant.notification.invalidInput, _errors },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const updatedUserData = await this.userRepository.save(newUser);
      this.mailTemplateCustomService.mailUserRegister(
        updatedUserData,
        userData.password,
      ); // send registered mail service
      return this.commonService.buildCustomResponse(
        [],
        constant.notification.registerSuccessMessage,
        HttpStatus.CREATED.toString(),
      );
    }
  }

  // To authenticate all users and CGP with their credentials
  async authenticate({ email, password }: LoginUserDto): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({ email });
    console.log('file: auth.service.ts - line 65 - AuthService - user', user);
    if (!user)
      throw new HttpException(
        constant.notification.userNotFound,
        HttpStatus.UNAUTHORIZED,
      );
    if (user.role === 'CGP') {
      const cgp = await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.cgp', 'cgp')
        .where('users.id = :id', { id: user.id })
        .getOne();

      user['cgpId'] = cgp.cgp ? cgp.cgp[0]['id'] : '';

      const cgpTeams = await this.cgpRepository
        .createQueryBuilder('cgp')
        .leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams')
        .where('cgp.id = :id and cgpTeams.email = :email', { id: user['cgpId'], email: email })
        .getOne();

      console.log(cgpTeams)

      user['cgpTeams'] = cgpTeams.cgpTeams;
    }
    if (bcrypt.compareSync(password, user.password)) {
      const userData = plainToClass(UserTokenDto, user);
      return this.buildCustomResponse(
        userData,
        constant.notification.isLoginSuccessFul,
        HttpStatus.OK.toString(),
        userData,
      );
    }
    throw new HttpException(
      constant.notification.invalidLogin,
      HttpStatus.UNAUTHORIZED,
    );
  }

  // To create a password for first time CGP Users
  async createPassword(
    userPasswordData: UserPasswordDto,
    currentUser: any,
  ): Promise<ResponseDto> {
    const { email } = currentUser.data;
    const user = await this.userRepository.findOne({ email });
    user.password = bcrypt.hashSync(userPasswordData.password, 10);
    user.passwordFlag = 1;
    const savedUser = await this.userRepository.save(user);
    const userData = plainToClass(UserRegisterDto, savedUser);
    return this.commonService.buildCustomResponse(
      userData,
      'Password created successfully',
      HttpStatus.OK.toString(),
    );
  }

  // To send the token for verify email address
  async generateAccessToken(data: any): Promise<any> {
    const token = await this.jwtCustomService.jwtSign(data, '4h');
    const tokenData = {
      token: token,
    };
    return tokenData;
  }

  // To check email verify and  token is valid or not
  async verifyAccessToken(token: string): Promise<ResponseDto> {
    let data = '';
    try {
      data = await this.jwtCustomService.jwtVerify(token);
    } catch (err) {
      throw new HttpException(
        constant.notification.inValidToken,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const userData = plainToClass(UsersDto, data);
    return this.commonService.buildCustomResponse(
      userData,
      constant.notification.validToken,
      HttpStatus.OK.toString(),
    );
  }

  /** User Forgot the password and generate new password update the user and send to mail */
  async forgotPassword(userData: UserForgotPasswordDto): Promise<ResponseDto> {
    const validationErrors = await validate(userData);
    let errors = '';
    if (validationErrors.length > 0) {
      errors = 'Please enter the email address.';
      throw new HttpException(errors.toString(), HttpStatus.BAD_REQUEST);
    }
    const { email } = userData;

    const user = await this.userRepository.findOne({ email });
    if (!user)
      throw new HttpException(
        constant.notification.userNotFound,
        HttpStatus.UNAUTHORIZED,
      );

    const token = await this.generateAccessToken(user);

    // this.mailTemplateCustomService.mailForgotPassword(user, token.token); // send to forgot password

    this.mailTemplateService.mailForgotPassword(user, token.token); // send to forgot password

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isForgotSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async changePassword(
    userPasswordData: UserPasswordDto,
    userId: any,
  ): Promise<ResponseDto> {
    const validationErrors = await validate(userPasswordData);
    const errors = '';
    if (validationErrors.length > 0) {
      throw new HttpException(errors.toString(), HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new HttpException(
        constant.notification.userNotFound,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!bcrypt.compareSync(userPasswordData.oldPassword, user.password)) {
      throw new HttpException(
        constant.notification.wrongOldPassword,
        HttpStatus.UNAUTHORIZED,
      );
    }

    user.password = bcrypt.hashSync(userPasswordData.password, 10);
    this.userRepository.save(user);

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.passwordChangeSuccess,
      HttpStatus.OK.toString(),
    );
  }

  async resetPassword(
    cgpSetPasswordData: CgpSetPasswordDto,
    token: any,
  ): Promise<ResponseDto> {
    const validationErrors = await validate(cgpSetPasswordData);
    let errors = '';
    if (validationErrors.length > 0) {
      errors = 'Please enter the email address.';
      throw new HttpException(errors.toString(), HttpStatus.BAD_REQUEST);
    }
    let data = [];
    try {
      data = await this.jwtCustomService.jwtVerify(token);
      const user = await this.userRepository.findOne({ id: data['id'] });
      if (!user) {
        throw new HttpException(
          constant.notification.userNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }
      user.password = bcrypt.hashSync(cgpSetPasswordData.password, 10);
      this.userRepository.save(user);
      const userData = plainToClass(UsersDto, user);
      return this.commonService.buildCustomResponse(
        userData,
        constant.notification.passwordResetSuccess,
        HttpStatus.OK.toString(),
      );
    } catch (err) {
      throw new HttpException(
        constant.notification.inValidToken,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async checkIfPasswordUpdated(userId: any): Promise<ResponseDto> {
    const users = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.cgp', 'cgp')
      .where('users.id = :id', { id: userId })
      .getOne();

    if (!users) {
      throw new HttpException(
        constant.notification.userNotFound,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const data = {
      passwordFlag: users.passwordFlag,
      companyName: users.cgp['establishmentName'],
    };
    return this.commonService.buildCustomResponse(
      data,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async setPassword(
    CgpSetPasswordata: CgpSetPasswordDto,
    userId: any,
  ): Promise<ResponseDto> {
    const validationErrors = await validate(CgpSetPasswordata);
    console.log(
      'file: auth.service.ts - line 148 - AuthService - validationErrors',
      validationErrors,
    );
    let errors = '';
    if (validationErrors.length > 0) {
      errors = 'Please enter the email address.';
      throw new HttpException(errors.toString(), HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new HttpException(
        constant.notification.userNotFound,
        HttpStatus.UNAUTHORIZED,
      );
    }

    user.password = bcrypt.hashSync(CgpSetPasswordata.password, 10);
    user.passwordFlag = 1;
    await this.userRepository.save(user);

    const loginUserDto = new LoginUserDto();
    loginUserDto.email = user.email;
    loginUserDto.password = CgpSetPasswordata.password;
    const loginUser = await this.authenticate(loginUserDto);
    const cgp = await this.getCGPProfile(user.id);
    this.mailTemplateCustomService.mailCGPSetPassword(user, cgp); // send to Email Notification

    return this.commonService.buildCustomResponse(
      loginUser,
      '',
      HttpStatus.OK.toString(),
    );
  }

  async getCGPProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ id: userId });

    const errors = { user: ' User not found' };
    if (!user) throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);

    const qb = await this.userRepository.createQueryBuilder('users');
    qb.leftJoinAndSelect('users.cgp', 'cgp');
    qb.where('users.id = :id', { id: userId });

    const cgpData = await qb.getOne();
    console.log(
      'file: auth.service.ts - line 202 - AuthService - cgpData',
      cgpData,
    );

    return cgpData.cgp;
  }

  async buildCustomResponse(
    data: object,
    message: string,
    status: string,
    userData?: Object,
  ) {
    const dto = new ResponseDto();
    dto.status = status;
    dto.message = message;
    dto.data = data;
    if (userData) {
      dto.token = this.jwtService.sign({ userData });
    }
    return dto;
  }

  public generateJWT(data: any) {
    return this.jwtService.sign({ data });
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // To authenticate all users and CGP with their credentials
  async authEmailValidation(email: string, role: any): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        email,
        role,
      },
    });

    if (user) {
      return this.commonService.buildCustomResponse(
        user,
        constant.notification.emailExists,
        HttpStatus.NOT_FOUND.toString(),
      );
    } else {
      return this.commonService.buildCustomResponse(
        user,
        constant.notification.emailNotExists,
        HttpStatus.OK.toString(),
      );
    }
  }
}
