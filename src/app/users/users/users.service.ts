import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository, getRepository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
const jwt = require('jsonwebtoken');
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import {
  CreateUserDto,
  UsersDto,
  UserListDto,
  UpdateUserDto,
  UserSearchDto,
  UserProfileUpdateDto,
  UserProfileDto,
} from '../dto/users.dto';
import { Users } from '../entities/users.entity';
import { plainToClass } from 'class-transformer';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { constant } from 'src/shared/constant/constant';
import { UserDetails } from '../entities/users-details.entity';
import * as AWS from 'aws-sdk';
import config from '../../../config/config';

@Injectable()
export class UsersService {
  s3: AWS.S3;
  cdnUrl;
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(UserDetails)
    private readonly userDetailsRepository: Repository<UserDetails>,
  ) {
    this.cdnUrl = config.aws.consoleLogin;
    AWS.config.update({
      accessKeyId: config.aws.accessKey,
      secretAccessKey: config.aws.secretKey,
    });
    this.s3 = new AWS.S3();
  }

  async create(
    userData: CreateUserDto,
    currentUser: any,
  ): Promise<ResponseDto> {
    console.log('UsersService -> currentUser', currentUser);
    // check uniqueness of username/email
    const { email } = userData;

    const qb = getRepository(Users)
      .createQueryBuilder('users')
      .where('users.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      const errors = constant.notification.isExsitingEmail;
      throw new HttpException(errors, HttpStatus.CONFLICT);
    }
    // create new user
    const newUser = new Users();
    newUser.firstName = userData.firstName;
    newUser.lastName = userData.lastName;
    newUser.email = userData.email;
    newUser.password = userData.password;

    const errors = await validate(userData);
    if (errors.length > 0) {
      const _errors = { username: 'Userinput is not valid.' };
      throw new HttpException(
        { message: 'Input data validation failed', _errors },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const savedUser = await this.userRepository.save(newUser);
      const userData = this.buildUserDto(savedUser);
      return this.buildCustomResponse(
        userData,
        constant.notification.cgpRequestSuccess,
        HttpStatus.OK.toString(),
      );
    }
  }

  async getUserById(userId: string): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({ id: userId });

    const errors = { user: ' User not found' };
    if (!user) throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);

    const userData = this.buildUserDto(user);
    return this.buildCustomResponse(
      userData,
      'Successfully received',
      HttpStatus.OK.toString(),
    );
  }

  async findByEmail(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({ email: email });

    const errors = { user: ' User not found' };
    if (!user) throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);

    return user;
  }

  async findAll(options: IPaginationOptions): Promise<ResponseDto> {
    const queryBuilder = await this.userRepository.createQueryBuilder('users');
    queryBuilder.select(['users.id', 'users.firstName']);
    queryBuilder.leftJoinAndSelect('users.company', 'company');
    queryBuilder.orderBy('users.id', 'DESC'); // Or whatever you need to do

    const usersList = await paginate<Users>(queryBuilder, options);
    return this.buildCustomResponse(
      usersList,
      'Successfully received',
      HttpStatus.OK.toString(),
    );
  }

  async getUserList(userSearchDto: UserSearchDto): Promise<ResponseDto> {
    const users = await this.userRepository.find({
      firstName: Like('%' + userSearchDto.firstName + '%'),
    });
    return this.buildCustomResponse(
      users,
      'Successfully received',
      HttpStatus.OK.toString(),
    );
  }

  async getUsersDetailsForKyc(userId: any): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({ id: userId });

    const errors = { user: ' User not found' };
    if (!user) throw new HttpException({ errors }, HttpStatus.NOT_FOUND);

    const qb = await this.userRepository.createQueryBuilder('user');
    qb.leftJoinAndSelect('user.classes', 'classes');
    qb.leftJoinAndSelect('classes.department', 'department');
    qb.leftJoinAndSelect('classes.category', 'category');
    qb.leftJoinAndSelect('classes.course', 'course');
    qb.leftJoinAndSelect('classes.classKyc', 'classKyc');
    qb.where('user.id = :id', { id: userId });

    const users = await qb.getOne();
    console.log('UsersService -> users', users);
    const userData = plainToClass(UserListDto, users);

    return this.buildCustomResponse(
      userData,
      'Successfully received',
      HttpStatus.OK.toString(),
    );
  }

  async getUsersProfile(userId: string): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({ id: userId });
    console.log(
      'file: users.service.ts - line 125 - UsersService - user',
      user,
    );

    const errors = { user: ' User not found' };
    if (!user) throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);

    const userData = plainToClass(UserProfileDto, user);
    return this.buildCustomResponse(
      userData,
      'Successfully received',
      HttpStatus.OK.toString(),
    );
  }

  async updateUserProfile(
    userProfileUpdateData: UserProfileUpdateDto,
    currentUser: any,
  ): Promise<ResponseDto> {
    const { id } = currentUser.userData;
    const user = await this.userRepository.findOne({ id });

    user.firstName = userProfileUpdateData.firstName;
    user.lastName = userProfileUpdateData.lastName;
    user.function = userProfileUpdateData.function;
    user.gender = userProfileUpdateData.gender;

    const errors = await validate(userProfileUpdateData);
    if (errors.length > 0) {
      const _errors = { username: 'Userinput is not valid.' };
      throw new HttpException(
        { message: 'Input data validation failed', _errors },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      this.userRepository.save(user);

      return this.buildCustomResponse(
        [],
        'Successfully Updated',
        HttpStatus.CREATED.toString(),
      );
    }
  }

  async updateProfileImage(
    userId: string,
    filePath: string,
  ): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      const errors = { cgp: 'Cgp  is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    if (filePath) {
      user.profileImage = filePath;
    }

    this.userRepository.update(userId, user);

    return this.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  private buildUserDto(user: Users) {
    const dto = new UsersDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    return dto;
  }

  private buildCustomResponse(data: object, message: string, status: string) {
    const dto = new ResponseDto();
    dto.status = status;
    dto.message = message;
    dto.data = data;
    return dto;
  }

  async findOne(username: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ email: username });
  }

  async findByIdNew(id: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ id: id });
  }

  // file upload
  async uploadFile(file: any, type: string): Promise<any> {
    try {
      const base64data = new Buffer(file.buffer, 'binary');
      const params: AWS.S3.Types.PutObjectRequest = {
        Bucket: config.aws.bucket.profileImage,
        Key: `${Date.now().toString()}_${file.originalname}`,
        Body: base64data,
        // ACL: UPLOAD_WITH_ACL,
      };

      const result = new Promise((resolve, reject) => {
        this.s3.upload(params, (err, data: AWS.S3.ManagedUpload.SendData) => {
          if (err) {
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
          } else {
            const res = data.Key.split('/');
            const fileName = res[1].split('_');
            const path = res.length > 0 ? res[1] : '';
            resolve({
              uploaded: 1,
              url: `${this.cdnUrl}/${data.Key}`,
              file: `${this.cdnUrl}/${data.Key}`,
              fileName: fileName.length ? fileName[1] : path,
            });
          }
        });
      });
      return result;
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
