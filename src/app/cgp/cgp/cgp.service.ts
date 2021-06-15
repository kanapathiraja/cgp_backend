import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { CommonService } from 'src/shared/services/common.service';
import { getConnection, ILike, Not, Repository } from 'typeorm';
import {
  CgpAddressInfoDto,
  CGPInfoDto,
  CgpInfoForLogin,
  CGPSearchListReqDto,
  CGPSocialWebsiteDto,
  CGPStatusUpdateDto,
  CreateCgpDto,
  DescriptionCgpDto,
  UpdateCgpDto,
} from '../dto/cgp.dto';
import { Cgp, CgpStatus } from '../entities/cgp.entity';
import { CgpTeams } from '../entities/cgp-teams.entity';
import {
  CreateCgpTeamDto,
  CreateNewCgpTeamDto,
  UpdateCgpTeamDto,
  UpdateTeamRoles,
} from '../dto/cgp-teams.dto';
import { CgpPracticalInfo } from '../entities/cgp-practicalInfo.entity';
import { CgpSpecialities } from '../entities/cgp-specialities.entity';
import { CgpClients } from '../entities/cgp-clients.entity';
import { CreateClientsDto } from '../dto/cgp-clients.dto';
import { Gender, Role, Users } from 'src/app/users/entities/users.entity';
import { plainToClass } from 'class-transformer';
import { CreateSpecialitesDto } from '../dto/cgp-specialities.dto';
import { CgpPartners } from '../entities/cgp-partners.entity';
import { CreatePartnersDto } from '../dto/cgp-partners.dto';
import { Specialties } from '../entities/specialties.entity';
import { constant } from 'src/shared/constant/constant';
import { CgpSubtopics } from '../entities/cgp-subtopics.entity';
import { CreateCgpTagsDto } from '../dto/cgp-tags.dto';
import { CgpTags } from '../entities/cgp-tags.entity';
import { CreateCgpSubtopicsDto } from '../dto/cgp-subtopics.dto';
import { Subtopics } from '../entities/subtopics.entity';
import {
  ArticleInfoDto,
  CreateArticleDto,
  UpdateArticleDto,
} from '../dto/cgp-articles.dto';
import { CgpArticles } from '../entities/cgp_articles.entity';
import { CgpArticlesTags } from '../entities/cgp-articles-tags.entity';
import { MailTemplateCustomService } from 'src/shared/services/mail-template-custom.service';
import config from 'src/config/config';
import { SubtopicTags } from '../entities/subtopic-tags.entity';
import * as AWS from 'aws-sdk';
import { Faqs } from '../entities/faq.entity';
import * as bcrypt from 'bcryptjs';
import { CgpExists, OpenStatus } from '../entities/cgp-exists.entity';
import { PrivacyPolicies } from '../entities/privacy-policies.entity';
import { CgpArticlesSpecialities } from '../entities/cgp-articles-specialities.entity';
import { CgpArticlesSubtopics } from '../entities/cgp-articles-subtopics.entity';
import { createConversationDto } from 'src/app/conversation/dto/create-conversation.dto';
import { Partners } from '../entities/partners.entity';

export enum Roles {
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
  DIRECTOR = 'DIRECTOR',
}

const uniqid = require('uniqid');

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  apiKey: config.googleApiKey,
  formatter: null, // 'gpx', 'string', ...
};

@Injectable()
export class CgpService {
  s3: AWS.S3;
  cdnUrl;
  constructor(
    @InjectRepository(Cgp)
    private readonly cgpRepository: Repository<Cgp>,
    @InjectRepository(CgpTeams)
    private readonly cgpTeamRepository: Repository<CgpTeams>,
    @InjectRepository(CgpPracticalInfo)
    private readonly cgpPracticalInfoRepository: Repository<CgpPracticalInfo>,
    @InjectRepository(CgpSpecialities)
    private readonly cgpSpecialitiesRepository: Repository<CgpSpecialities>,
    @InjectRepository(CgpClients)
    private readonly cgpClientsRepository: Repository<CgpClients>,
    @InjectRepository(CgpPartners)
    private readonly cgpPartnersRepository: Repository<CgpPartners>,
    @InjectRepository(Specialties)
    private readonly specialityRepository: Repository<Specialties>,
    private readonly commonService: CommonService,
    private readonly mailTemplateCustomService: MailTemplateCustomService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(CgpSubtopics)
    private readonly cgpSubtopicsRepository: Repository<CgpSubtopics>,
    @InjectRepository(Subtopics)
    private readonly subtopicsRepository: Repository<Subtopics>,
    @InjectRepository(SubtopicTags)
    private readonly subtopicTagsRepository: Repository<SubtopicTags>,
    @InjectRepository(CgpTags)
    private readonly cgpTagsRepository: Repository<CgpTags>,
    @InjectRepository(CgpArticles)
    private readonly cgpArticlesRepository: Repository<CgpArticles>,
    @InjectRepository(CgpArticlesTags)
    private readonly cgpArticlesTagsRepository: Repository<CgpArticlesTags>,
    @InjectRepository(Faqs)
    private readonly FaqRepository: Repository<Faqs>,
    @InjectRepository(CgpExists)
    private readonly cgpExistsRepository: Repository<CgpExists>,
    @InjectRepository(PrivacyPolicies)
    private readonly privacyPoliciesRepository: Repository<PrivacyPolicies>,
    @InjectRepository(CgpArticlesSpecialities)
    private readonly cgpArticlesSpecialitiesRepository: Repository<CgpArticlesSpecialities>,
    @InjectRepository(CgpArticlesSubtopics)
    private readonly cgpArticlesSubtopicsRepository: Repository<CgpArticlesSubtopics>,
    @InjectRepository(Partners)
    private readonly partnersRepository: Repository<Partners>,
  ) {
    this.cdnUrl = config.aws.consoleLogin;
    AWS.config.update({
      accessKeyId: config.aws.accessKey,
      secretAccessKey: config.aws.secretKey,
    });
    this.s3 = new AWS.S3();
  }

  // To CGP User Request register and check Already Exsit Mail
  async requestCGP(cgpData: CreateCgpDto): Promise<ResponseDto> {
    const { eSiret } = cgpData;
    const cgp = await this.cgpRepository.findOne({ eSiret });

    if (cgp) {
      if (cgp.status === CgpStatus.APPROVED) {
        throw new HttpException(
          constant.notification.isExsitingSiret,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const cgpExists = new CgpExists();
        const newCgpExistsValue = Object.assign(cgpExists, cgpData);
        newCgpExistsValue.status = OpenStatus.pending;
        const errors = await validate(cgpData);
        if (errors.length > 0) {
          const _errors = { username: 'Userinput is not valid.' };
          throw new HttpException(
            { message: constant.notification.invalidInput, _errors },
            HttpStatus.BAD_REQUEST,
          );
        } else {
          const cgpValue = await this.cgpExistsRepository.save(
            newCgpExistsValue,
          );
          return this.commonService.buildCustomResponse(
            [],
            constant.notification.cgpRequestSuccess,
            HttpStatus.CREATED.toString(),
          );
        }
      }
    } else {
      let latitude = 0;
      let longitude = 0;

      // find latitude and longitude from company address
      const geocoder = NodeGeocoder(options);
      const geoCode = await geocoder.geocode(cgpData.companyAddress);
      if (Object.keys(geoCode).length !== 0) {
        // throw new HttpException(constant.notification.inValidAddress, HttpStatus.BAD_REQUEST);
        latitude = geoCode[0].latitude;
        longitude = geoCode[0].longitude;
      }

      const newCgp = new Cgp();
      const newCgpValue = Object.assign(newCgp, cgpData);
      const errors = await validate(cgpData);
      if (errors.length > 0) {
        const _errors = { username: 'Userinput is not valid.' };
        throw new HttpException(
          { message: constant.notification.invalidInput, _errors },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const cgpValue = await this.cgpRepository.save(newCgpValue);

        this.updateGeoLocation(latitude, longitude, cgpValue);

        // const { cgpId } = cgpValue.id;
        const cgp = await this.cgpRepository.findOne({ id: cgpValue.id });

        const cgpTeam = new CgpTeams();
        cgpTeam.cgp = cgp;
        cgpTeam.firstname = cgpData.firstname;
        cgpTeam.lastname = cgpData.lastname;
        cgpTeam.role = Roles.ADMIN;
        cgpTeam.email = cgpData.contactPersonEmail;
        cgpTeam.designation = cgpData.designation;
        cgpTeam.addressComplement = cgpData.addressComplement;
        cgpTeam.addressType = cgpData.addressType;
        cgpTeam.addressNumber = cgpData.addressNumber;
        cgpTeam.addressStreet = cgpData.addressStreet;
        cgpTeam.city = cgpData.city;
        cgpTeam.country = cgpData.country;
        cgpTeam.postalCode = cgpData.postalCode;
        cgpTeam.address = cgpData.companyAddress;

        this.cgpTeamRepository.save(cgpTeam);

        const data = cgpValue;
        data['firstName'] = cgpTeam.firstname;
        data['lastName'] = cgpTeam.lastname;
        data['contactEmail'] = cgpTeam.email;
        this.mailTemplateCustomService.mailCGPRequest(data);
        return this.commonService.buildCustomResponse(
          [],
          constant.notification.cgpRequestSuccess,
          HttpStatus.CREATED.toString(),
        );
      }
    }
  }

  updateGeoLocation(latitude: number, longitude: number, cgpValue: Cgp): void {
    getConnection()
      .createQueryBuilder()
      .update(Cgp)
      .set({
        geoLocation: () => 'ST_MakePoint(' + latitude + ',' + longitude + ')',
      })
      .where('id = :id', { id: cgpValue.id })
      .execute();
  }

  // CGP veriy and Approve or Reject status
  /** CGP Approve new user create and send mail notification */
  async cgpStatusUpdate(
    cgpStatusUpdateData: CGPStatusUpdateDto,
    cgpId: string,
  ): Promise<ResponseDto> {
    const cgp = await this.cgpRepository.findOne({ id: cgpId });
    if (!cgp) {
      const errors = { username: 'Cgp is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const cgpTeam = await this.cgpTeamRepository.findOne({
      where: {
        cgp: cgpId,
        role: Roles.ADMIN,
      },
    });
    if (!cgpTeam) {
      const errors = { username: 'Cgp Team is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    let status = '';

    const updateTeam = {
      status: 1,
    };
    const teamChanges = new CgpTeams();
    const newTeamUpdate = Object.assign(teamChanges, updateTeam);
    const statusUpdate = await this.cgpTeamRepository.update(
      cgpTeam.id,
      newTeamUpdate,
    );

    if (cgpStatusUpdateData.status === CgpStatus.APPROVED) {
      const userData = await this.userRepository.findOne({
        email: cgpTeam.email,
      });

      if (userData) {
        const newCgpValue = Object.assign(cgp, cgpStatusUpdateData);
        newCgpValue.users = userData;
        this.cgpRepository.update(cgp.id, newCgpValue);

        status = constant.notification.isCGPApproved;
        const data = cgp;
        data['firstName'] = cgpTeam.firstname;
        data['lastName'] = cgpTeam.lastname;
        data['contactEmail'] = cgpTeam.email;
        this.mailTemplateCustomService.mailCGPUserApproved(data, userData); // send to Email Notification
      } else {
        const newUser = new Users();
        newUser.email = cgpTeam.email;
        newUser.firstName = cgpTeam.firstname;
        newUser.lastName = cgpTeam.lastname;
        newUser.function = cgpTeam.designation;
        newUser.password = await this.generatePassword();
        newUser.role = Role.CGP;
        const user = await this.userRepository.save(newUser);
        console.log(
          'file: cgp.service.ts - line 107 - CgpService - user',
          user,
        );

        const newCgpValue = Object.assign(cgp, cgpStatusUpdateData);
        newCgpValue.users = user;
        this.cgpRepository.update(cgp.id, newCgpValue);

        status = constant.notification.isCGPApproved;
        const data = cgp;
        data['firstName'] = cgpTeam.firstname;
        data['lastName'] = cgpTeam.lastname;
        data['contactEmail'] = cgpTeam.email;
        this.mailTemplateCustomService.mailCGPUserApproved(data, user); // send to Email Notification
      }
    } else {
      status = constant.notification.isCGPRejected;
    }
    return this.commonService.buildCustomResponse(
      [],
      status,
      HttpStatus.CREATED.toString(),
    );
  }

  // CGP veriy and Approve or Reject status
  /** CGP Approve new user create and send mail notification */
  async updateCgpInfo(
    updateCgpData: UpdateCgpDto,
    cgpId: string,
  ): Promise<ResponseDto> {
    console.log('file: cgp.service.ts - line 103 - CgpService - cgpId', cgpId);
    console.log(
      'file: cgp.service.ts - line 101 - CgpService - updateCgpData',
      updateCgpData,
    );

    const cgp = await this.cgpRepository.findOne({ id: cgpId });
    if (!cgp) {
      const errors = constant.notification.CGPNotFound;
      throw new HttpException(errors, HttpStatus.NOT_FOUND);
    }
    console.log(cgp.id);
    // const { establishmentName } = updateCgpData;
    console.log(updateCgpData.establishmentName);
    if (updateCgpData.establishmentName) {
      const cgpName = await this.cgpRepository.findOne({
        establishmentName: updateCgpData.establishmentName,
      });

      if (cgpName && cgp.id !== cgpName.id) {
        const errors = constant.notification.isCgpNameExists;
        throw new HttpException(errors, HttpStatus.BAD_REQUEST);
      }
    }

    let latitude = 0;
    let longitude = 0;

    // find latitude and longitude from company address
    const geocoder = NodeGeocoder(options);
    const geoCode = await geocoder.geocode(updateCgpData.companyAddress);
    if (Object.keys(geoCode).length !== 0) {
      // throw new HttpException(constant.notification.inValidAddress, HttpStatus.BAD_REQUEST);
      latitude = geoCode[0].latitude;
      longitude = geoCode[0].longitude;
    }

    const newCgp = new Cgp();
    const newCgpValue = Object.assign(newCgp, updateCgpData);
    const updatedCGP = await this.cgpRepository.update(cgp.id, newCgpValue);

    this.updateGeoLocation(latitude, longitude, cgp);
    console.log(
      'file: cgp.service.ts - line 110 - CgpService - updatedCGP',
      updatedCGP,
    );

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.CGPUpdateSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  /** CGP Description (Presentation) Update  based on CGP Login User */
  async updateCGPDescription(
    descriptionData: DescriptionCgpDto,
    cgpId: string,
  ): Promise<ResponseDto> {
    const user = await this.cgpRepository.findOne({ id: cgpId });
    if (!user) {
      const errors = { username: 'Cgp is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    user.presentationText = descriptionData.presentationText;
    this.cgpRepository.save(user);
    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** CGP Team Create  based on CGP Login User */
  async createCGPTeam(
    createCgpTeamData: CreateCgpTeamDto,
    filePath: string,
  ): Promise<ResponseDto> {
    console.log(
      'file: cgp.service.ts - line 136 - CgpService - createCgpTeamData',
      createCgpTeamData,
    );
    const { email , cgpId } = createCgpTeamData;

    const cgpTeams = await this.cgpTeamRepository.find({
      where: {
        cgp: cgpId,
        email: email
      }
    });

    if(cgpTeams.length) {
      throw new HttpException(constant.notification.emailExists, HttpStatus.BAD_REQUEST );
    }

    const cgp = await this.cgpRepository.findOne({ id: cgpId });

    const cgpTeam = new CgpTeams();
    cgpTeam.cgp = cgp;
    cgpTeam.firstname = createCgpTeamData.firstname;
    cgpTeam.lastname = createCgpTeamData.lastname;
    cgpTeam.role = createCgpTeamData.role
      ? createCgpTeamData.role
      : Roles.COLLABORATOR;
    cgpTeam.city = createCgpTeamData.city;
    cgpTeam.email = createCgpTeamData.email;
    cgpTeam.designation = createCgpTeamData.designation;
    cgpTeam.description = createCgpTeamData.description;
    cgpTeam.addressComplement = createCgpTeamData.addressComplement;
    cgpTeam.addressType = createCgpTeamData.addressType;
    cgpTeam.addressNumber = createCgpTeamData.addressNumber;
    cgpTeam.addressStreet = createCgpTeamData.addressStreet;
    cgpTeam.city = createCgpTeamData.city;
    cgpTeam.country = createCgpTeamData.country;
    cgpTeam.postalCode = createCgpTeamData.postalCode;
    cgpTeam.address = createCgpTeamData.address;
    cgpTeam.status = 0;

    if (filePath) {
      console.log(
        'file: cgp.service.ts - line 147 - CgpService - filePath',
        filePath,
      );
      cgpTeam.bannerUrl = filePath;
    }

    this.cgpTeamRepository.save(cgpTeam);
    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** CGP Team Update  based on CGP Login User */
  async updateCGPTeam(
    updateCgpTeamData: UpdateCgpTeamDto,
    teamId: string,
    filePath: string,
  ): Promise<ResponseDto> {
    const cgpTeam = await this.cgpTeamRepository.findOne({ id: teamId });
    if (!cgpTeam) {
      throw new HttpException(constant.notification.teamNotFount, HttpStatus.BAD_REQUEST );
    }

    const { email, cgpId } = updateCgpTeamData;
    if (email && cgpId) {
      const cgpEmail = await this.cgpTeamRepository.findOne({ where: {
        email: email,
        cgp: cgpId,
        id: Not(teamId) }
      });
      if (cgpEmail) {
        throw new HttpException(constant.notification.emailExists, HttpStatus.BAD_REQUEST );
      }
    }

    cgpTeam.firstname = updateCgpTeamData.firstname;
    cgpTeam.lastname = updateCgpTeamData.lastname;
    cgpTeam.email = updateCgpTeamData.email;
    cgpTeam.designation = updateCgpTeamData.designation;
    cgpTeam.description = updateCgpTeamData.description;
    cgpTeam.addressComplement = updateCgpTeamData.addressComplement;
    cgpTeam.addressType = updateCgpTeamData.addressType;
    cgpTeam.addressNumber = updateCgpTeamData.addressNumber;
    cgpTeam.addressStreet = updateCgpTeamData.addressStreet;
    cgpTeam.city = updateCgpTeamData.city;
    cgpTeam.country = updateCgpTeamData.country;
    cgpTeam.postalCode = updateCgpTeamData.postalCode;
    cgpTeam.address = updateCgpTeamData.address;
    cgpTeam.status = 0;

    if (filePath) {
      console.log(
        'file: cgp.service.ts - line 171 - CgpService - filePath',
        filePath,
      );
      cgpTeam.bannerUrl = filePath;
    }

    this.cgpTeamRepository.update(cgpTeam.id, cgpTeam);
    return this.commonService.buildCustomResponse(
      updateCgpTeamData,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** CGP Practical info Update  and  Social Medial link update CGP Table  based on CGP Login User */
  async updateCGPPracticalInfo(
    cgpSocialWebsiteData: CGPSocialWebsiteDto,
    cgpId: any,
  ): Promise<ResponseDto> {
    const cgpPracticalInfo = await this.cgpPracticalInfoRepository.findOne({
      cgp: cgpId,
    });

    if (cgpPracticalInfo) {
      await this.cgpPracticalInfoRepository.delete({ cgp: cgpId }); //Delete CGP Practical info after update new details
    }
    const cgp = await this.cgpRepository.findOne({ id: cgpId });
    if (!cgp) {
      const errors = { username: 'Cgp is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    cgp.twitter = cgpSocialWebsiteData.twitter;
    cgp.facebook = cgpSocialWebsiteData.facebook;
    cgp.linkedIn = cgpSocialWebsiteData.linkedIn;
    cgp.instagram = cgpSocialWebsiteData.instagram;
    cgp.youtube = cgpSocialWebsiteData.youtube;
    this.cgpRepository.update(cgp.id, cgp); // Stored CGP User Social Media links

    if (cgpSocialWebsiteData.cgpPracticalInfo.length > 0) {
      const errors = await validate(cgpSocialWebsiteData.cgpPracticalInfo);
      if (errors.length > 0) {
        throw new HttpException(
          { message: 'Input data validation failed' },
          HttpStatus.BAD_REQUEST,
        );
      }
      this.cgpPracticalInfoRepository.save(
        cgpSocialWebsiteData.cgpPracticalInfo,
      );
    }
    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** Get the Information CGP and team, practical info, clients based on CGP Id  */
  async getCGPInformation(
    name: any,
    cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    // const cgpInfo = await this.cgpRepository.findOne({ id: cgpId });

    const qbcgp = await this.cgpRepository.createQueryBuilder('cgp');
    qbcgp.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );
    qbcgp.where(' cgp.establishmentName = (:name)', {
      name: name,
      latitude: latitude,
      longitude: longitude,
      distance: distance,
    });

    const cgpInfo = await qbcgp.getOne();

    if (!cgpInfo) {
      const errors = { cgp: 'Cgp is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    cgpInfo.cgpTeams = await this.cgpTeamRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });
    cgpInfo.cgpPracticalInfo = await this.cgpPracticalInfoRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });
    cgpInfo.cgpSpecialities = await this.cgpSpecialitiesRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
      join: {
        alias: 'cgpSpecialty',
        leftJoinAndSelect: {
          specialties: 'cgpSpecialty.specialties',
        },
      },
    });

    cgpInfo.cgpClients = await this.cgpClientsRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });
    cgpInfo.cgpPartners = await this.cgpPartnersRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });

    const qb = await this.cgpSubtopicsRepository.createQueryBuilder(
      'cgpSubtopic',
    );
    qb.leftJoinAndSelect('cgpSubtopic.subtopics', 'subtopics');
    qb.leftJoinAndSelect('subtopics.specialties', 'specialties');
    qb.where(' cgpSubtopic.cgp_id = (:cgpId)', {
      cgpId: cgpInfo.id,
    });

    cgpInfo.cgpSubtopics = await qb.getMany();

    cgpInfo.cgpTags = await this.cgpTagsRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
      join: {
        alias: 'cgpSubtopicTags',
        leftJoinAndSelect: {
          subtopicTags: 'cgpSubtopicTags.subtopicTags',
        },
      },
    });

    const cgpData = plainToClass(CGPInfoDto, cgpInfo);
    console.log(
      'file: cgp.service.ts - line 197 - CgpService - cgpData',
      cgpData,
    );

    return this.commonService.buildCustomResponse(
      cgpInfo,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** Get the Information CGP and team, practical info, clients based on CGP email  */
  async getCGPEmailInformation(
    cgpId: any,
    cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    // const cgpInfo = await this.cgpRepository.findOne({ email: email });

    const qbcgp = await this.cgpRepository.createQueryBuilder('cgp');
    qbcgp.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qbcgp.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );
    qbcgp.where(' cgp.id = (:cgpId)', {
      cgpId: cgpId,
      latitude: latitude,
      longitude: longitude,
      distance: distance,
    });

    const cgpInfo = await qbcgp.getOne();

    if (!cgpInfo) {
      const errors = { cgp: 'Cgp is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    cgpInfo.cgpTeams = await this.cgpTeamRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });
    cgpInfo.cgpPracticalInfo = await this.cgpPracticalInfoRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });
    cgpInfo.cgpSpecialities = await this.cgpSpecialitiesRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
      join: {
        alias: 'cgpSpecialty',
        leftJoinAndSelect: {
          specialties: 'cgpSpecialty.specialties',
        },
      },
    });

    cgpInfo.cgpClients = await this.cgpClientsRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });
    cgpInfo.cgpPartners = await this.cgpPartnersRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
    });

    // cgpInfo.cgpSubtopics = await this.cgpSubtopicsRepository.find({
    //   where: { cgp: cgpInfo },
    //   order: { createdAt: 'DESC' },
    //   join: {
    //     alias: 'cgpSubtopic',
    //     leftJoinAndSelect: {
    //       subtopics: 'cgpSubtopic.subtopics',
    //     },
    //   },
    // });

    const qb = await this.cgpSubtopicsRepository.createQueryBuilder(
      'cgpSubtopic',
    );
    qb.leftJoinAndSelect('cgpSubtopic.subtopics', 'subtopics');
    qb.leftJoinAndSelect('subtopics.specialties', 'specialties');
    qb.where(' cgpSubtopic.cgp_id = (:cgpId)', {
      cgpId: cgpInfo.id,
    });

    cgpInfo.cgpSubtopics = await qb.getMany();

    cgpInfo.cgpTags = await this.cgpTagsRepository.find({
      where: { cgp: cgpInfo },
      order: { createdAt: 'DESC' },
      join: {
        alias: 'cgpSubtopicTags',
        leftJoinAndSelect: {
          subtopicTags: 'cgpSubtopicTags.subtopicTags',
        },
      },
    });

    return this.commonService.buildCustomResponse(
      cgpInfo,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** Get the Information CGP and team, practical info, clients based on CGP email  */
  async getCGPAddressInformation(
    cgpId: any,
  ): Promise<ResponseDto> {

    // const cgpInfo = await this.cgpRepository.findOne({ email: email });

    const qbcgp = await this.cgpRepository.createQueryBuilder('cgp');

    qbcgp.where(' cgp.id = (:cgpId)', {
      cgpId: cgpId,
    });

    const cgpInfo = await qbcgp.getOne();

    if (!cgpInfo) {
      const errors = { cgp: 'Cgp is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const cgpData = plainToClass(CgpAddressInfoDto, cgpInfo);

    return this.commonService.buildCustomResponse(
      cgpData,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getCGPDescriptionInformation(cgpId: any): Promise<ResponseDto> {
    const cgpDescriptionInfo = await this.cgpRepository.findOne({ id: cgpId });
    if (!cgpDescriptionInfo) {
      const errors = { cgp: 'Cgp is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpDescriptionInfo,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getTeamList(cgpId: string, start, length): Promise<ResponseDto> {
    const cgpTeamInfo = await this.cgpTeamRepository.find({
      where: {
        cgp: cgpId,
        active: true,
      },
      skip: start,
      take: length,
    });

    const totalCount = await this.cgpTeamRepository.find({
      where: {
        cgp: cgpId,
        active: true,
      },
    });
    const data = {
      recordsTotal: totalCount.length,
      recordsFiltered: cgpTeamInfo.length,
      list: cgpTeamInfo,
    };
    if (!cgpTeamInfo) {
      const errors = { cgp: 'Cgp Team is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      data,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async getCGPTeam(teamId: string): Promise<ResponseDto> {
    const cgpTeamInfo = await this.cgpTeamRepository.findOne({ id: teamId });
    if (!cgpTeamInfo) {
      const errors = { cgp: 'Cgp Team is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpTeamInfo,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async deleteTeam(id: string): Promise<ResponseDto> {
    const cgpTeamInfo = await this.cgpTeamRepository.findOne({ id: id });
    if (!cgpTeamInfo) {
      const errors = { cgp: 'Cgp Team is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const updateTeam = {
      active: false,
    };
    const teamChanges = new CgpTeams();
    const newTeamUpdate = Object.assign(teamChanges, updateTeam);
    const deleteAricle = await this.cgpTeamRepository.update(
      id,
      newTeamUpdate,
    );

    return this.commonService.buildCustomResponse(
      cgpTeamInfo,
      constant.notification.teamRemovedSuccess,
      HttpStatus.OK.toString(),
    );
  }

  async getPracticalInformation(cgpId: any): Promise<ResponseDto> {
    const cgpInfo = await this.cgpRepository.findOne({ id: cgpId });
    if (!cgpInfo) {
      const errors = { cgp: 'Cgp Team is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    cgpInfo.cgpPracticalInfo = await this.cgpPracticalInfoRepository.find({
      cgp: cgpId,
    });

    return this.commonService.buildCustomResponse(
      cgpInfo,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getCGPClients(cgpId: any): Promise<ResponseDto> {
    const cgpClient = await this.cgpClientsRepository.find({ cgp: cgpId });
    if (!cgpClient) {
      const errors = { cgp: 'Cgp Clients is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpClient,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** Update CGP Client Information  */
  /** To delete old data after store the value in  selected */
  async updateCGPClient(
    createClientsData: CreateClientsDto,
    cgpId: any,
  ): Promise<ResponseDto> {
    const cgpClients = await this.cgpClientsRepository.findOne({ cgp: cgpId });
    if (cgpClients) {
      await this.cgpClientsRepository.delete({ cgp: cgpId });
    }

    if (createClientsData.clients.length > 0) {
      const errors = await validate(createClientsData.clients);
      if (errors.length > 0) {
        throw new HttpException(
          { message: 'Input data validation failed' },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const clientsData = [];
    createClientsData.clients.forEach((element) => {
      const newCgpClient = new CgpClients();
      newCgpClient.clientId = element;
      newCgpClient.cgp = cgpId;
      clientsData.push(newCgpClient);
    });

    console.log(
      'file: cgp.service.ts - line 280 - CgpService - createClientsData',
      createClientsData,
    );

    const savedClientData = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CgpClients)
      .values(clientsData)
      .execute();
    console.log(
      'file: cgp.service.ts - line 280 - CgpService - savedClientData',
      savedClientData,
    );

    return this.commonService.buildCustomResponse(
      savedClientData,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getCGPSpecialities(cgpId: any): Promise<ResponseDto> {
    console.log('file: cgp.service.ts - line 275 - CgpService - cgpId', cgpId);

    const cgpSpecialities = await this.cgpSpecialitiesRepository.find({
      cgp: cgpId,
    });
    console.log(
      'file: cgp.service.ts - line 276 - CgpService - cgpSpecialities',
      cgpSpecialities,
    );
    if (!cgpSpecialities) {
      const errors = { cgp: 'cgpSpecialities is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpSpecialities,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** Update CGP Client Information  */
  /** To delete old data after store the value in  selected */
  async updateCGPSpecialities(
    createSpecialitesData: CreateSpecialitesDto,
    cgpId: any,
  ): Promise<ResponseDto> {
    const cgpSpecialities = await this.cgpSpecialitiesRepository.findOne({
      cgp: cgpId,
    });
    if (cgpSpecialities) {
      await this.cgpSpecialitiesRepository.delete({ cgp: cgpId });
    }

    if (createSpecialitesData.specialities.length > 0) {
      const errors = await validate(createSpecialitesData.specialities);
      if (errors.length > 0) {
        throw new HttpException(
          { message: 'Input data validation failed' },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const specialitiesData = [];
    createSpecialitesData.specialities.forEach((element) => {
      const newCgpSpecialities = new CgpSpecialities();
      newCgpSpecialities.specialties = element;
      newCgpSpecialities.cgp = cgpId;
      specialitiesData.push(newCgpSpecialities);
    });

    const savedspecialitiesData = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CgpSpecialities)
      .values(specialitiesData)
      .execute();

    return this.commonService.buildCustomResponse(
      specialitiesData,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getCGPPartners(cgpId: any): Promise<ResponseDto> {
    const cgpPartners = await this.cgpPartnersRepository.find({ cgp: cgpId });
    console.log(
      'file: cgp.service.ts - line 343 - CgpService - cgpPartners',
      cgpPartners,
    );
    if (!cgpPartners) {
      const errors = { cgp: 'Cgp Partners is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpPartners,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  /** Update CGP Client Information  */
  /** To delete old data after store the value in  selected */
  async updateCGPPartner(
    createPartnersData: CreatePartnersDto,
    cgpId: any,
  ): Promise<ResponseDto> {
    const cgpPartners = await this.cgpPartnersRepository.findOne({
      cgp: cgpId,
    });
    if (cgpPartners) {
      await this.cgpPartnersRepository.delete({ cgp: cgpId });
    }

    if (createPartnersData.partners.length > 0) {
      const errors = await validate(createPartnersData.partners);
      if (errors.length > 0) {
        throw new HttpException(
          { message: 'Input data validation failed' },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const partnersData = [];
    createPartnersData.partners.forEach((element) => {
      const newCgpPartner = new CgpPartners();
      newCgpPartner.partnerId = element;
      newCgpPartner.cgp = cgpId;
      partnersData.push(newCgpPartner);
    });

    console.log(
      'file: cgp.service.ts - line 280 - CgpService - createPartnersData',
      createPartnersData,
    );

    const savedPartnersData = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CgpPartners)
      .values(partnersData)
      .execute();
    console.log(
      'file: cgp.service.ts - line 280 - CgpService - savedClientData',
      savedPartnersData,
    );

    return this.commonService.buildCustomResponse(
      savedPartnersData,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async updateBannerImage(cgpId: any, filePath: string): Promise<ResponseDto> {
    const cgp = await this.cgpRepository.findOne({ id: cgpId });
    if (!cgp) {
      const errors = { cgp: 'Cgp  is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    if (filePath) {
      console.log(
        'file: cgp.service.ts - line 171 - CgpService - filePath',
        filePath,
      );
      cgp.bannerImage = filePath;
    }

    this.cgpRepository.update(cgpId, cgp);

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async updateCgpLogoImage(cgpId: any, filePath: string): Promise<ResponseDto> {
    const cgp = await this.cgpRepository.findOne({ id: cgpId });
    if (!cgp) {
      const errors = { cgp: 'Cgp  is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    if (filePath) {
      console.log(
        'file: cgp.service.ts - line 171 - CgpService - filePath',
        filePath,
      );
      cgp.logo = filePath;
    }

    this.cgpRepository.update(cgpId, cgp);

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async generatePassword() {
    let randNumber = Math.round(Date.now() / 1000).toString();
    randNumber = randNumber.substr(randNumber.length - 7);
    let randUniqid = uniqid().toUpperCase();
    randUniqid = randUniqid.substr(randUniqid.length - 7);
    const userCode = randUniqid + randNumber;
    return userCode;
  }

  async getCGPSubtopics(cgpId: any): Promise<ResponseDto> {
    console.log('file: cgp.service.ts - line 275 - CgpService - cgpId', cgpId);

    const cgpSubtopics = await this.cgpSubtopicsRepository.find({ cgp: cgpId });

    if (!cgpSubtopics) {
      const errors = { cgp: 'cgpSubtopics is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpSubtopics,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  /** Update CGP Client Information  */
  /** To delete old data after store the value in  selected */
  async updateCGPSubtopics(
    createCgpSubtopicsDto: CreateCgpSubtopicsDto,
    cgpId: any,
  ): Promise<ResponseDto> {
    console.log(
      'file: cgp.service.ts - line 491 - CgpService - createCgpSubtopicsDto',
      createCgpSubtopicsDto,
    );

    const errors = await validate(createCgpSubtopicsDto.subtopics);
    if (errors.length > 0) {
      // throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    let savedData: any;
    if (createCgpSubtopicsDto.subtopics.length) {
      const cgpSubtopics = await this.cgpSubtopicsRepository.findOne({
        cgp: cgpId,
      });
      if (cgpSubtopics) {
        await this.cgpSubtopicsRepository.delete({ cgp: cgpId });
      }

      const subtopicsData = [];
      createCgpSubtopicsDto.subtopics.forEach((element) => {
        const newCgpSubtopics = new CgpSubtopics();
        newCgpSubtopics.subtopics = element;
        newCgpSubtopics.cgp = cgpId;
        subtopicsData.push(newCgpSubtopics);
      });

      savedData = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(CgpSubtopics)
        .values(subtopicsData)
        .execute();
    } else {
      const cgpSubtopics = await this.cgpSubtopicsRepository.findOne({
        cgp: cgpId,
      });
      if (cgpSubtopics) {
        await this.cgpSubtopicsRepository.delete({ cgp: cgpId });
      }
    }

    return this.commonService.buildCustomResponse(
      savedData,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getCGPTags(cgpId: any): Promise<ResponseDto> {
    const cgpTags = await this.cgpTagsRepository.find({ cgp: cgpId });

    if (!cgpTags) {
      const errors = { cgp: 'cgpTags is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpTags,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  /** Update CGP Client Information  */
  /** To delete old data after store the value in  selected */
  async updateCGPTags(
    createCgpTagsDto: CreateCgpTagsDto,
    cgpId: any,
  ): Promise<ResponseDto> {
    const errors = await validate(createCgpTagsDto.tags);
    if (errors.length > 0) {
      // throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    let savedData: any;

    if (createCgpTagsDto.tags.length) {
      const cgpTags = await this.cgpTagsRepository.findOne({ cgp: cgpId });

      if (cgpTags) {
        await this.cgpTagsRepository.delete({ cgp: cgpId });
      }

      const tagsData = [];
      createCgpTagsDto.tags.forEach((element) => {
        const newCgpTags = new CgpTags();
        newCgpTags.subtopicTags = element;
        newCgpTags.cgp = cgpId;
        tagsData.push(newCgpTags);
      });

      savedData = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(CgpTags)
        .values(tagsData)
        .execute();
    } else {
      const cgpTags = await this.cgpTagsRepository.findOne({ cgp: cgpId });

      if (cgpTags) {
        await this.cgpTagsRepository.delete({ cgp: cgpId });
      }
    }

    return this.commonService.buildCustomResponse(
      savedData,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getCgpBasedonSpeciality(
    search: any,
    cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    const qb = await this.cgpRepository.createQueryBuilder('cgp');
    qb.leftJoinAndSelect('cgp.cgpPracticalInfo', 'cgpPracticalInfo');
    qb.leftJoinAndSelect('cgp.cgpSpecialities', 'cgpSpecialities');
    qb.leftJoinAndSelect('cgpSpecialities.specialties', 'specialties');
    qb.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qb.leftJoinAndSelect('cgp.cgpSubtopics', 'cgpSubtopics');
    qb.leftJoinAndSelect('cgpSubtopics.subtopics', 'subtopics');
    qb.leftJoinAndSelect('cgp.cgpTags', 'cgpTags');
    qb.leftJoinAndSelect('cgpTags.subtopicTags', 'subtopicTags');
    qb.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );
    if (cgpSearchListReqData.dayName) {
      let time = '';
      cgpSearchListReqData.time.forEach((element) => {
        time = time
          ? time +
            " or (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') "
          : " ( (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') ";
      });
      time = time + ' ) ';

      const days = cgpSearchListReqData.dayName.split(',');
      let value = '';
      days.forEach((element) => {
        value = value ? value + ",'" + element + "'" : "'" + element + "'";
      });

      const practicalInfo =
        'cgpPracticalInfo.dayName in ( ' + value + ') and ' + time;

      const where =
        ' cgp.status = (:status) and cgp.visibility = true and (round(CAST((6371 * acos (\n' +
        '       cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '        ) * 0.621371 AS NUMERIC), 1) < :distance) and (cgp.establishmentName ILike (:establishmentName) or specialties.specialtyName ILike (:specialtyName) or subtopics.subtopicTitle ILike (:subtopicTitle) ' +
        ' or subtopicTags.tagTitle ILike (:tagTitle)) and ' +
        practicalInfo;
      qb.where(where, {
        status: 'APPROVED',
        establishmentName: '%' + search + '%',
        specialtyName: '%' + search + '%',
        subtopicTitle: '%' + search + '%',
        tagTitle: '%' + search + '%',
        latitude: latitude,
        longitude: longitude,
        distance: distance,
      });
    } else {
      qb.where(
        ' cgp.status = (:status) and cgp.visibility = true and (round(CAST((6371 * acos (\n' +
          '       cos ( radians(:latitude) )\n' +
          '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
          '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
          '        + sin ( radians(:latitude) )\n' +
          '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
          '        )\n' +
          '        ) * 0.621371 AS NUMERIC), 1) < :distance) and (cgp.establishmentName ILike (:establishmentName) or specialties.specialtyName ILike (:specialtyName) or subtopics.subtopicTitle ILike (:subtopicTitle) ' +
          ' or subtopicTags.tagTitle ILike (:tagTitle)) ',
        {
          status: 'APPROVED',
          establishmentName: '%' + search + '%',
          specialtyName: '%' + search + '%',
          subtopicTitle: '%' + search + '%',
          tagTitle: '%' + search + '%',
          latitude: latitude,
          longitude: longitude,
          distance: distance,
        },
      );
    }
    qb.orderBy(
      'round(CAST((6371 * acos (\n' +
        '          cos ( radians(:latitude) )\n' +
        '                  * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '                  * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '                  + sin ( radians(:latitude) )\n' +
        '                  * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '                  )\n' +
        '                  ) * 0.621371 AS NUMERIC), 1)',
      'ASC',
    );

    const cgpList = await qb.getMany();
    if (!cgpList) {
      const errors = { cgp: 'Cgp List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpList,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getCgpBasedonId(
    specialityId: any,
    limit: any,
    cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    let qb;
    qb = await this.cgpRepository.createQueryBuilder('cgp');
    qb.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qb.leftJoinAndSelect('cgp.cgpPracticalInfo', 'cgpPracticalInfo');
    qb.leftJoinAndSelect('cgp.cgpSpecialities', 'cgpSpecialities');
    qb.leftJoinAndSelect('cgpSpecialities.specialties', 'specialties');
    qb.leftJoinAndSelect('specialties.subtopics', 'subtopics');
    qb.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );

    if (cgpSearchListReqData.dayName) {
      let time = '';
      cgpSearchListReqData.time.forEach((element) => {
        time = time
          ? time +
            " or (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') "
          : " ( (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') ";
      });
      time = time + ' ) ';

      const days = cgpSearchListReqData.dayName.split(',');
      let value = '';
      days.forEach((element) => {
        value = value ? value + ",'" + element + "'" : "'" + element + "'";
      });

      const practicalInfo =
        'cgpPracticalInfo.dayName in ( ' + value + ') and ' + time;

      const where =
        'cgp.status = (:status) and cgp.visibility = true and subtopics.id = (:specialityId) and ' +
        '(round(CAST((6371 * acos (\n' +
        'cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '        ) * 0.621371 AS NUMERIC), 1) < :distance) and ' +
        practicalInfo;
      qb.where(where, {
        status: 'APPROVED',
        specialityId: specialityId,
        latitude: latitude,
        longitude: longitude,
        distance: distance,
      });
    } else {
      qb.where(
        'cgp.status = (:status) and cgp.visibility = true and subtopics.id = (:specialityId) and ' +
          '(round(CAST((6371 * acos (\n' +
          'cos ( radians(:latitude) )\n' +
          '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
          '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
          '        + sin ( radians(:latitude) )\n' +
          '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
          '        )\n' +
          '        ) * 0.621371 AS NUMERIC), 1) < :distance)',
        {
          status: 'APPROVED',
          specialityId: specialityId,
          latitude: latitude,
          longitude: longitude,
          distance: distance,
        },
      );
    }

    qb.orderBy(
      'round(CAST((6371 * acos (\n' +
        '          cos ( radians(:latitude) )\n' +
        '                  * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '                  * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '                  + sin ( radians(:latitude) )\n' +
        '                  * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '                  )\n' +
        '                  ) * 0.621371 AS NUMERIC), 1)',
      'ASC',
    );

    limit ? qb.limit(limit) : '';
    const cgpList = await qb.getMany();
    if (!cgpList) {
      const errors = { cgp: 'Cgp List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpList,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async nearbyCGP(
    cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    console.log(bcrypt.hashSync('Ctl@1234', 10));
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    const qb = await this.cgpRepository.createQueryBuilder('cgp');
    qb.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qb.leftJoinAndSelect('cgp.cgpPracticalInfo', 'cgpPracticalInfo');
    qb.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );
    // qb.addSelect('cgpTeams', 'cgpTeams');

    if (cgpSearchListReqData.dayName) {
      let time = '';
      cgpSearchListReqData.time.forEach((element) => {
        time = time
          ? time +
            " or (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') "
          : " ( (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') ";
      });
      time = time + ' ) ';

      const days = cgpSearchListReqData.dayName.split(',');
      let value = '';
      days.forEach((element) => {
        value = value ? value + ",'" + element + "'" : "'" + element + "'";
      });

      const practicalInfo =
        'cgpPracticalInfo.dayName in ( ' + value + ') and ' + time;

      const where =
        'cgp.status = (:status) and cgp.visibility = true and ' +
        'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1) < :distance  and ' +
        practicalInfo;
      qb.where(where, {
        status: 'APPROVED',
        latitude: latitude,
        longitude: longitude,
        distance: distance,
      });
    } else {
      qb.where(
        'cgp.status = (:status) and cgp.visibility = true and ' +
          'round(CAST((6371 * acos (\n' +
          '        cos ( radians(:latitude) )\n' +
          '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
          '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
          '        + sin ( radians(:latitude) )\n' +
          '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
          '        )\n' +
          '      ) * 0.621371 AS NUMERIC), 1) < :distance ',
        {
          status: 'APPROVED',
          latitude: latitude,
          longitude: longitude,
          distance: distance,
        },
      );
    }

    qb.orderBy(
      'round(CAST((6371 * acos (\n' +
        '          cos ( radians(:latitude) )\n' +
        '                  * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '                  * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '                  + sin ( radians(:latitude) )\n' +
        '                  * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '                  )\n' +
        '                  ) * 0.621371 AS NUMERIC), 1)',
      'ASC',
    );

    const cgpList = await qb.getMany();
    if (!cgpList) {
      const errors = { cgp: 'Cgp List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpList,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async cgpListByLocation(
    cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    const errors = await validate(cgpSearchListReqData);
    if (errors.length > 0) {
      const _errors = errors;
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const qb = await this.cgpRepository.createQueryBuilder('cgp');

    qb.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qb.leftJoinAndSelect('cgp.cgpPracticalInfo', 'cgpPracticalInfo');
    qb.select('cgp', 'cgp');
    qb.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );
    qb.addSelect('cgpTeams', 'cgpTeams');

    if (cgpSearchListReqData.dayName) {
      let time = '';
      cgpSearchListReqData.time.forEach((element) => {
        time = time
          ? time +
            " or (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') "
          : " ( (cgpPracticalInfo.startTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "' or cgpPracticalInfo.endTime between '" +
            element.startTime +
            "' and '" +
            element.endTime +
            "') ";
      });
      time = time + ' ) ';

      const days = cgpSearchListReqData.dayName.split(',');
      let value = '';
      days.forEach((element) => {
        value = value ? value + ",'" + element + "'" : "'" + element + "'";
      });

      const practicalInfo =
        'cgpPracticalInfo.dayName in ( ' + value + ') and ' + time;

      const where =
        'cgp.status = (:status) and cgp.visibility = true and ' +
        'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1) < :distance and ' +
        practicalInfo;
      qb.where(where, {
        status: 'APPROVED',
        latitude: latitude,
        longitude: longitude,
        distance: distance,
      });
    } else {
      qb.where(
        'cgp.status = (:status) and cgp.visibility = true and ' +
          'round(CAST((6371 * acos (\n' +
          '        cos ( radians(:latitude) )\n' +
          '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
          '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
          '        + sin ( radians(:latitude) )\n' +
          '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
          '        )\n' +
          '      ) * 0.621371 AS NUMERIC), 1) < :distance',
        {
          status: 'APPROVED',
          latitude: latitude,
          longitude: longitude,
          distance: distance,
        },
      );
    }

    qb.orderBy(
      'round(CAST((6371 * acos (\n' +
        '          cos ( radians(:latitude) )\n' +
        '                  * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '                  * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '                  + sin ( radians(:latitude) )\n' +
        '                  * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '                  )\n' +
        '                  ) * 0.621371 AS NUMERIC), 1)',
      'ASC',
    );

    const cgpList = await qb.getMany();

    if (!cgpList) {
      const errors = { cgp: 'Cgp List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpList,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async cgplistwithoutOwn(
    cgpSearchListReqData: CGPSearchListReqDto,
    cgpId,
  ): Promise<ResponseDto> {
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    const errors = await validate(cgpSearchListReqData);
    if (errors.length > 0) {
      const _errors = errors;
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const qb = await this.cgpRepository.createQueryBuilder('cgp');
    qb.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qb.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );
    qb.where(
      'cgp.status = (:status) and cgp.visibility = true and cgp.id != (:cgpId) and ' +
        'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1) < :distance',
      {
        status: 'APPROVED',
        latitude: latitude,
        longitude: longitude,
        distance: distance,
        cgpId: cgpId,
      },
    );
    // qb.andWhere("st_distance(a.geom,b.geom) as dist");

    qb.orderBy(
      'round(CAST((6371 * acos (\n' +
        '          cos ( radians(:latitude) )\n' +
        '                  * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '                  * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '                  + sin ( radians(:latitude) )\n' +
        '                  * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '                  )\n' +
        '                  ) * 0.621371 AS NUMERIC), 1)',
      'ASC',
    );

    const cgpList = await qb.getMany();

    if (!cgpList) {
      const errors = { cgp: 'Cgp List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      cgpList,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getSpecialityList(searchKey): Promise<ResponseDto> {
    let specialityList = [];
    if (searchKey) {
      const specialty = await this.specialityRepository.find({
        where: [{ specialtyName: ILike('%' + searchKey + '%') }],
        select: ['specialtyName'],
      });
      specialty.map((data) => {
        specialityList.push(data.specialtyName);
      });

      //   let tagsList = await this.cgpTagsRepository.find({
      //     where: [{ tagName: ILike('%' + searchKey + '%') }],
      //     select: ['tagName'],
      //   });
      //   tagsList.map(data => {
      //     specialityList.push(data.tagName)
      //   })

      const subTopicList = await this.subtopicsRepository.find({
        where: [{ subtopicTitle: ILike('%' + searchKey + '%') }],
        select: ['subtopicTitle'],
      });
      subTopicList.map((data) => {
        specialityList.push(data.subtopicTitle);
      });
    } else {
      specialityList = await this.specialityRepository.find({
        active: true,
      });
    }

    if (!specialityList) {
      const errors = { cgp: 'Speciality List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    return this.commonService.buildCustomResponse(
      specialityList,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getSpecialityandSubtopicsList(specialityId: any): Promise<ResponseDto> {
    let qb;
    if (specialityId) {
      qb = await this.specialityRepository.createQueryBuilder('specialties');
      qb.leftJoinAndSelect('specialties.subtopics', 'subtopics');
      qb.where(
        'specialties.active = true AND specialties.id = (:specialityId)',
        {
          specialityId: specialityId,
        },
      );
    } else {
      qb = await this.specialityRepository.createQueryBuilder('specialties');
      qb.leftJoinAndSelect('specialties.subtopics', 'subtopics');
      qb.where('specialties.active = true');
    }

    const specialityList = await qb.getMany();

    if (!specialityList) {
      const errors = { cgp: 'Speciality List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      specialityList,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async getSubtopicDetails(subtopicId: any): Promise<ResponseDto> {
    const qb = await this.specialityRepository.createQueryBuilder(
      'specialties',
    );
    qb.leftJoinAndSelect('specialties.subtopics', 'subtopics');
    qb.where('subtopics.id = (:id)', {
      id: subtopicId,
    });

    const getDetails = await qb.getMany();

    if (!getDetails) {
      const errors = { cgp: 'Speciality List not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      getDetails,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  // article create
  async articleCreate(articleData: CreateArticleDto): Promise<ResponseDto> {
    console.log(
      'file: cgp.service.ts - line 911 - CgpService - articleData',
      articleData,
    );

    const { title } = articleData;
    const article = await this.cgpArticlesRepository.findOne({
      title,
      active: true,
    });

    if (article) {
      throw new HttpException(
        constant.notification.isArticleTitleExists,
        HttpStatus.BAD_REQUEST,
      );
    }

    const newArticles = new CgpArticles();
    const newArticleValue = Object.assign(newArticles, articleData);
    const errors = await validate(articleData);
    if (errors.length > 0) {
      const _errors = { username: 'Userinput is not valid.' };
      throw new HttpException(
        { message: constant.notification.invalidInput, _errors },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const articleValue = await this.cgpArticlesRepository.save(
        newArticleValue,
      );
      console.log(articleValue['id']);

      const tagsData = [];
      articleData.tags.forEach((element) => {
        const newCgpArticlesTags = new CgpArticlesTags();
        newCgpArticlesTags.subtopicTags = element;
        newCgpArticlesTags.cgpArticles = articleValue['id'];
        tagsData.push(newCgpArticlesTags);
      });

      const savedData = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(CgpArticlesTags)
        .values(tagsData)
        .execute();

      const specialityData = [];
      articleData.speciality.forEach((element) => {
        const newCgpArticlesTags = new CgpArticlesSpecialities();
        newCgpArticlesTags.specialties = element;
        newCgpArticlesTags.cgpArticles = articleValue['id'];
        specialityData.push(newCgpArticlesTags);
      });

      const specialitySavedData = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(CgpArticlesSpecialities)
        .values(specialityData)
        .execute();

      const subtopicData = [];
      articleData.subtopics.forEach((element) => {
        const newCgpArticlesTags = new CgpArticlesSubtopics();
        newCgpArticlesTags.subtopics = element;
        newCgpArticlesTags.cgpArticles = articleValue['id'];
        subtopicData.push(newCgpArticlesTags);
      });

      const subtopicSavedData = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(CgpArticlesSubtopics)
        .values(subtopicData)
        .execute();

      return this.commonService.buildCustomResponse(
        [],
        constant.notification.articleRequestSuccess,
        HttpStatus.CREATED.toString(),
      );
    }
  }

  // Article update
  async updateArticle(
    updateArticleData: UpdateArticleDto,
    id: any,
  ): Promise<ResponseDto> {
    const tagsUpdateData = updateArticleData.tags;
    const specialityUpdateData = updateArticleData.speciality;
    const subtopicsUpdateData = updateArticleData.subtopics;
    const cgpArticle = await this.cgpArticlesRepository.findOne({ id: id });
    if (!cgpArticle) {
      const errors = constant.notification.articleNotFound;
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const { title } = updateArticleData;
    const article = await this.cgpArticlesRepository.findOne({
      title,
      active: true,
    });

    if (article && article.id !== cgpArticle.id) {
      throw new HttpException(
        constant.notification.isArticleTitleExists,
        HttpStatus.BAD_REQUEST,
      );
    }

    delete updateArticleData.tags;
    delete updateArticleData.speciality;
    delete updateArticleData.subtopics;
    const newCgpArticle = new CgpArticles();
    updateArticleData['updatedAt'] = new Date();
    const newCgpArticleValue = Object.assign(newCgpArticle, updateArticleData);
    const updatedArticle = await this.cgpArticlesRepository.update(
      id,
      newCgpArticleValue,
    );

    const cgpArticleTags = await this.cgpArticlesTagsRepository.findOne({
      cgpArticles: id,
    });

    if (cgpArticleTags) {
      await this.cgpArticlesTagsRepository.delete({ cgpArticles: id });
    }

    const tagsData = [];
    tagsUpdateData.forEach((element) => {
      const newCgpArticlesTags = new CgpArticlesTags();
      newCgpArticlesTags.subtopicTags = element;
      newCgpArticlesTags.cgpArticles = id;
      tagsData.push(newCgpArticlesTags);
    });

    const savedData = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CgpArticlesTags)
      .values(tagsData)
      .execute();

    const cgpArticlesSpeciality = await this.cgpArticlesSpecialitiesRepository.findOne(
      {
        cgpArticles: id,
      },
    );

    if (cgpArticlesSpeciality) {
      await this.cgpArticlesSpecialitiesRepository.delete({ cgpArticles: id });
    }

    const specialityData = [];
    specialityUpdateData.forEach((element) => {
      const newCgpArticlesTags = new CgpArticlesSpecialities();
      newCgpArticlesTags.specialties = element;
      newCgpArticlesTags.cgpArticles = id;
      specialityData.push(newCgpArticlesTags);
    });

    const speaclitySavedData = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CgpArticlesSpecialities)
      .values(specialityData)
      .execute();

    const cgpArticleSubtopics = await this.cgpArticlesSubtopicsRepository.findOne(
      {
        cgpArticles: id,
      },
    );

    if (cgpArticleSubtopics) {
      await this.cgpArticlesSubtopicsRepository.delete({ cgpArticles: id });
    }

    const subtopicsData = [];
    subtopicsUpdateData.forEach((element) => {
      const newCgpArticlesTags = new CgpArticlesSubtopics();
      newCgpArticlesTags.subtopics = element;
      newCgpArticlesTags.cgpArticles = id;
      subtopicsData.push(newCgpArticlesTags);
    });

    const subtopicsSavedData = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CgpArticlesSubtopics)
      .values(subtopicsData)
      .execute();

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.articleUpdateSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article delete
  async deleteArticle(id: string): Promise<ResponseDto> {
    const cgpArticle = await this.cgpArticlesRepository.findOne({ id: id });
    if (!cgpArticle) {
      const errors = constant.notification.articleNotFound;
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    const updateArticleData = {
      active: false,
    };
    const newCgpArticle = new CgpArticles();
    const newCgpArticleValue = Object.assign(newCgpArticle, updateArticleData);
    const deleteAricle = await this.cgpArticlesRepository.update(
      id,
      newCgpArticleValue,
    );

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.articleDeleteSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article list based on status
  async articleList(status: string, req: any): Promise<ResponseDto> {
    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgpArticlesTags', 'cgpArticlesTags');
    qb.leftJoinAndSelect('cgpArticlesTags.subtopicTags', 'subtopicTags');
    qb.leftJoinAndSelect(
      'articles.cgpArticlesSubtopics',
      'cgpArticlesSubtopics',
    );
    qb.leftJoinAndSelect('cgpArticlesSubtopics.subtopics', 'subtopics');
    qb.leftJoinAndSelect(
      'articles.cgpArticlesSpecialities',
      'cgpArticlesSpecialities',
    );
    qb.leftJoinAndSelect('cgpArticlesSpecialities.specialties', 'specialties');
    qb.where(
      'articles.active = true and articles.status = (:status) and articles.cgp_id = (:cgpId) order by articles.updatedAt desc ',
      {
        status: status,
        cgpId: req.cgpId,
      },
    );

    const cgpArticle = await qb.getMany();

    const cgpArticleData = plainToClass(ArticleInfoDto, cgpArticle);
    return this.commonService.buildCustomResponse(
      cgpArticleData,
      constant.notification.articleListSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article details based article id
  async articleDetails(
    name: string,
    cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    const latitude = cgpSearchListReqData.latitude;
    const longitude = cgpSearchListReqData.longitude;
    const distance = cgpSearchListReqData.distance
      ? cgpSearchListReqData.distance
      : 50;

    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgp', 'cgp');
    qb.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qb.leftJoinAndSelect('articles.cgpArticlesTags', 'cgpArticlesTags');
    qb.leftJoinAndSelect('cgpArticlesTags.subtopicTags', 'subtopicTags');
    qb.leftJoinAndSelect(
      'articles.cgpArticlesSubtopics',
      'cgpArticlesSubtopics',
    );
    qb.leftJoinAndSelect('cgpArticlesSubtopics.subtopics', 'subtopics');
    qb.leftJoinAndSelect(
      'articles.cgpArticlesSpecialities',
      'cgpArticlesSpecialities',
    );
    qb.leftJoinAndSelect('cgpArticlesSpecialities.specialties', 'specialties');
    qb.addSelect(
      'round(CAST((6371 * acos (\n' +
        '        cos ( radians(:latitude) )\n' +
        '        * cos( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ) )\n' +
        '        * cos( radians(ST_Y(cgp."geolocation"::geometry)::DECIMAL ) - radians(:longitude) )\n' +
        '        + sin ( radians(:latitude) )\n' +
        '        * sin( radians(ST_X(cgp."geolocation"::geometry)::DECIMAL ))\n' +
        '        )\n' +
        '      ) * 0.621371 AS NUMERIC), 1)',
      'cgp_reason',
    );
    qb.where('articles.active = true and articles.title = (:name)', {
      name: name,
      latitude: latitude,
      longitude: longitude,
      distance: distance,
    });

    const cgpArticle = await qb.getMany();
    const cgpArticleData = plainToClass(ArticleInfoDto, cgpArticle);

    console.log(name);

    if (cgpArticle.length) {
      if (
        cgpArticle.length &&
        cgpArticleData[0]['cgpArticlesTags'] &&
        cgpArticleData[0]['cgpArticlesTags'].length
      ) {
        const tagsData = [];
        cgpArticleData[0]['cgpArticlesTags'].forEach((element) => {
          tagsData.push(element.subtopicTags.id);
        });
        if (tagsData.length) {
          const similarArticles = await this.similarArticlesList(
            cgpArticleData[0].id,
            tagsData,
            4,
          );
          cgpArticleData[0]['similarArticles'] = plainToClass(
            ArticleInfoDto,
            similarArticles.data,
          );
        }
      }

      if (cgpArticleData[0]['cgp']) {
        const limit = {
          limit: 4,
        };
        const otherArticles = await this.articleListBasedonCgp(
          cgpArticleData[0]['cgp'].id,
          limit,
          'other',
          cgpArticleData[0].id,
        );
        cgpArticleData[0]['otherArticles'] = plainToClass(
          ArticleInfoDto,
          otherArticles.data,
        );
      }

      return this.commonService.buildCustomResponse(
        cgpArticleData,
        constant.notification.articleDetailsSuccess,
        HttpStatus.CREATED.toString(),
      );
    } else {
      return this.commonService.buildCustomResponse(
        [],
        constant.notification.articleNotFound,
        HttpStatus.NO_CONTENT.toString(),
      );
    }
  }

  async similarArticlesList(id, tags, limit): Promise<any> {
    console.log(tags);
    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgp', 'cgp');
    qb.leftJoinAndSelect('articles.cgpArticlesTags', 'cgpArticlesTags');
    qb.leftJoinAndSelect('cgpArticlesTags.subtopicTags', 'subtopicTags');
    qb.where(
      'articles.active = true and subtopicTags.id IN(:...ids) and articles.id != (:article)',
      {
        ids: tags,
        article: id,
      },
    );
    qb.limit(limit);
    const similarArticle = await qb.getMany();
    return this.commonService.buildCustomResponse(
      similarArticle,
      constant.notification.articleDetailsSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article list based on status
  async articleListSearch(tagId: string, req: any): Promise<ResponseDto> {
    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgpArticlesTags', 'cgpArticlesTags');
    qb.leftJoinAndSelect('cgpArticlesTags.subtopicTags', 'cgpSubtopicTags');
    qb.leftJoinAndSelect('articles.cgp', 'cgp');
    qb.leftJoinAndSelect('cgp.cgpTags', 'cgpTags');
    qb.leftJoinAndSelect('cgpTags.subtopicTags', 'subtopicTags');

    if (req.type === 'all') {
      qb.where(
        'articles.active = true and articles.status = (:status) and (cgpSubtopicTags.id  = (:tagId) or subtopicTags.id = (:cgpTagId)) ',
        {
          status: 'publish',
          tagId: tagId,
          cgpTagId: tagId,
        },
      );
    } else {
      qb.where(
        'articles.active = true and articles.type like (:articleType) and articles.status = (:status) and (cgpSubtopicTags.id  = (:tagId) or subtopicTags.id = (:cgpTagId)) ',
        {
          status: 'publish',
          tagId: tagId,
          cgpTagId: tagId,
          articleType: '%' + req.type + '%',
        },
      );
    }

    const cgpArticle = await qb.getMany();

    const cgpArticleData = plainToClass(ArticleInfoDto, cgpArticle);
    return this.commonService.buildCustomResponse(
      cgpArticleData,
      constant.notification.articleListSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article list based on status
  async articlesBasedonSubtopics(
    subtopicId: any,
    req: any,
  ): Promise<ResponseDto> {
    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgp', 'cgp');
    qb.leftJoinAndSelect(
      'articles.cgpArticlesSubtopics',
      'cgpArticlesSubtopics',
    );
    qb.leftJoinAndSelect('cgpArticlesSubtopics.subtopics', 'subtopics');

    if (req.type === 'recent') {
      qb.where(
        'articles.active = true and articles.status = (:status) and subtopics.id = (:subtopicId) order by articles.createdAt desc ',
        {
          status: 'publish',
          subtopicId: subtopicId,
        },
      );
    } else if (req.type === 'viewed') {
      qb.where(
        'articles.active = true and articles.status = (:status) and subtopics.id = (:subtopicId) order by articles.articleView desc',
        {
          status: 'publish',
          subtopicId: subtopicId,
        },
      );
    } else {
      qb.where(
        'articles.active = true and articles.status = (:status) and subtopics.id = (:subtopicId) ',
        {
          status: 'publish',
          subtopicId: subtopicId,
        },
      );
    }

    req.limit ? qb.limit(req.limit) : '';
    const cgpArticle = await qb.getMany();

    const cgpArticleData = plainToClass(ArticleInfoDto, cgpArticle);
    return this.commonService.buildCustomResponse(
      cgpArticleData,
      constant.notification.articleListSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article list based on status
  async articlesBasedonSpeciality(
    specialityId: any,
    req: any,
  ): Promise<ResponseDto> {
    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgp', 'cgp');
    qb.leftJoinAndSelect(
      'articles.cgpArticlesSpecialities',
      'cgpArticlesSpecialities',
    );
    qb.leftJoinAndSelect('cgpArticlesSpecialities.specialties', 'specialties');

    if (req.type === 'recent') {
      if (req.articleType === 'all') {
        qb.where(
          'articles.active = true and articles.status = (:status) and specialties.id = (:specialityId) order by articles.createdAt desc ',
          {
            status: 'publish',
            specialityId: specialityId,
          },
        );
      } else {
        qb.where(
          'articles.active = true and articles.type like (:articleType) and articles.status = (:status) and specialties.id = (:specialityId) order by articles.createdAt desc ',
          {
            status: 'publish',
            specialityId: specialityId,
            articleType: req.articleType,
          },
        );
      }
    } else if (req.type === 'viewed') {
      if (req.articleType === 'all') {
        qb.where(
          'articles.active = true and articles.status = (:status) and specialties.id = (:specialityId) order by articles.articleView desc',
          {
            status: 'publish',
            specialityId: specialityId,
          },
        );
      } else {
        qb.where(
          'articles.active = true and articles.type like (:articleType) and articles.status = (:status) and specialties.id = (:specialityId) order by articles.articleView desc',
          {
            status: 'publish',
            specialityId: specialityId,
            articleType: req.articleType,
          },
        );
      }
    } else {
      qb.where(
        'articles.active = true and articles.status = (:status) and specialties.id = (:specialityId) ',
        {
          status: 'publish',
          specialityId: specialityId,
        },
      );
    }

    req.limit ? qb.limit(req.limit) : '';
    const cgpArticle = await qb.getMany();

    const cgpArticleData = plainToClass(ArticleInfoDto, cgpArticle);
    return this.commonService.buildCustomResponse(
      cgpArticleData,
      constant.notification.articleListSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article list based on status
  async mostRecentArticle(params, req): Promise<ResponseDto> {
    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgp', 'cgp');
    req.limit ? qb.limit(req.limit) : '';

    if (params.type === 'recent') {
      qb.where(
        'articles.active = true and articles.status = (:status) order by articles.createdAt desc ',
        {
          status: 'publish',
        },
      );
    } else {
      qb.where(
        'articles.active = true and articles.status = (:status) order by articles.articleView desc',
        {
          status: 'publish',
        },
      );
    }

    const cgpArticle = await qb.getMany();

    const cgpArticleData = plainToClass(ArticleInfoDto, cgpArticle);
    return this.commonService.buildCustomResponse(
      cgpArticleData,
      constant.notification.articleListSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article view update
  async updateArticleView(id: any): Promise<ResponseDto> {
    const cgpArticle = await this.cgpArticlesRepository.findOne({ id: id });
    if (!cgpArticle) {
      const errors = constant.notification.articleNotFound;
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    const viewUpdate = {
      articleView: Number(cgpArticle.articleView) + 1,
    };
    const updateCgpArticle = new CgpArticles();
    const updateCgpArticleValue = Object.assign(updateCgpArticle, viewUpdate);
    const updatedArticle = await this.cgpArticlesRepository.update(
      id,
      updateCgpArticleValue,
    );

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.articleUpdateSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // Article list based on status
  async articleListBasedonCgp(
    cgpId: string,
    req,
    type,
    articleId: string,
  ): Promise<ResponseDto> {
    let qb;
    qb = await this.cgpArticlesRepository.createQueryBuilder('articles');
    qb.leftJoinAndSelect('articles.cgp', 'cgp');

    if (type === 'other') {
      qb.where(
        'articles.active = true and articles.status = (:status) and cgp.id  = (:cgpId) and articles.id != (:articleId)',
        {
          status: 'publish',
          cgpId: cgpId,
          articleId: articleId,
        },
      );
    } else {
      if (req.type !== 'all') {
        qb.where(
          'articles.active = true and articles.status = (:status) and cgp.id  = (:cgpId) and articles.type like (:type)',
          {
            status: 'publish',
            cgpId: cgpId,
            type: '%' + req.type + '%',
          },
        );
      } else {
        qb.where(
          'articles.active = true and articles.status = (:status) and cgp.id  = (:cgpId) ',
          {
            status: 'publish',
            cgpId: cgpId,
          },
        );
      }
    }
    req.limit ? qb.limit(req.limit) : '';
    const cgpArticle = await qb.getMany();

    const cgpArticleData = plainToClass(ArticleInfoDto, cgpArticle);
    return this.commonService.buildCustomResponse(
      cgpArticleData,
      constant.notification.articleListSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  async updateLocation(cgpId: string, lat, lan): Promise<any> {
    return getConnection()
      .createQueryBuilder()
      .update(Cgp)
      .set({
        geoLocation: () => 'ST_MakePoint(' + lat + ',' + lan + ')',
      })
      .where('id = :id', { id: cgpId })
      .execute();
  }

  // file upload
  async uploadFile(file: any, type: string): Promise<any> {
    try {
      const base64data = new Buffer(file.buffer, 'binary');
      const params: AWS.S3.Types.PutObjectRequest = {
        Bucket:
          type === 'article'
            ? config.aws.bucket.articles
            : type === 'cgpBannerImage'
            ? config.aws.bucket.cgpBannerImage
            : type === 'teamsBannerImage'
            ? config.aws.bucket.teamsBannerImage
            : type === 'cgpLogo'
            ? config.aws.bucket.cgpLogo
            : type === 'profileImage'
            ? config.aws.bucket.profileImage
            : '',
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
            console.log(data);
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

  async getFaqs(): Promise<ResponseDto> {
    console.log('file: cgp.service.ts - line 2181 - CgpService ');

    const faqsList = await this.FaqRepository.find();

    if (!faqsList) {
      const errors = { cgp: 'faq is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.commonService.buildCustomResponse(
      faqsList,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  // To CGP User Request register and check Already Exsit Mail
  async cgpBulkSave(cgpData: any): Promise<ResponseDto> {
    const { eSiret } = cgpData;
    if (eSiret) {
      const user = await this.cgpRepository.findOne({ eSiret });

      if (user) {
        console.log(user);
        return cgpData;
      }

      // let latitude = 0;
      // let longitude = 0;
      //
      // // find latitude and longitude from company address
      // const geocoder = NodeGeocoder(options);
      // const geoCode = await geocoder.geocode(cgpData.companyAddress);
      // if (Object.keys(geoCode).length !== 0) {
      //   // throw new HttpException(constant.notification.inValidAddress, HttpStatus.BAD_REQUEST);
      //   latitude = geoCode[0].latitude;
      //   longitude = geoCode[0].longitude;
      // }

      const newCgp = new Cgp();
      const newCgpValue = Object.assign(newCgp, cgpData);
      const errors = await validate(cgpData);
      if (errors.length > 0) {
        const _errors = { username: 'Userinput is not valid.' };
        throw new HttpException(
          { message: constant.notification.invalidInput, _errors },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const cgpValue = await this.cgpRepository.save(newCgpValue);

        // this.updateGeoLocation(latitude, longitude, cgpValue);

        return this.commonService.buildCustomResponse(
          [],
          constant.notification.cgpRequestSuccess,
          HttpStatus.CREATED.toString(),
        );
      }
    } else {
      return cgpData;
    }
  }

  async teamEmailValidation(email: string, id: any): Promise<ResponseDto> {
    console.log('file: cgp.service.ts - line 2181 - CgpService ');

    let emailValidation;
    if (id) {
      emailValidation = await this.cgpTeamRepository.find({
        where: {
          email: email,
          id: Not(id),
        },
      });
    } else {
      emailValidation = await this.cgpTeamRepository.find({
        email: email,
      });
    }

    if (emailValidation.length) {
      return this.commonService.buildCustomResponse(
        emailValidation,
        constant.notification.emailExists,
        HttpStatus.NOT_FOUND.toString(),
      );
    } else {
      return this.commonService.buildCustomResponse(
        emailValidation,
        constant.notification.emailNotExists,
        HttpStatus.OK.toString(),
      );
    }
  }

  /** CGP Team Create  based on CGP Login User */
  async teamBulkInsert(teamData: any): Promise<ResponseDto> {
    console.log(
      'file: cgp.service.ts - line 136 - CgpService - createCgpTeamData',
      teamData,
    );
    const { eSiret } = teamData;
    const cgp = await this.cgpRepository.findOne({ eSiret });

    const cgpAdmin = await this.cgpTeamRepository.findOne({
      where: {
        cgp,
        role: Roles.ADMIN,
      },
    });

    if (cgpAdmin) {
      const cgpTeam = new CgpTeams();
      cgpTeam.cgp = cgp;
      cgpTeam.contactId = teamData.contact;
      cgpTeam.firstname = teamData.firstname;
      cgpTeam.lastname = teamData.lastname;
      cgpTeam.role = Roles.COLLABORATOR;
      cgpTeam.email = teamData.email;
      cgpTeam.designation = teamData.designation;
      cgpTeam.description = teamData.description;

      this.cgpTeamRepository.save(cgpTeam);
    } else {
      const cgpTeam = new CgpTeams();
      cgpTeam.cgp = cgp;
      cgpTeam.contactId = teamData.contact;
      cgpTeam.firstname = teamData.firstname;
      cgpTeam.lastname = teamData.lastname;
      cgpTeam.role = Roles.ADMIN;
      cgpTeam.email = teamData.email;
      cgpTeam.designation = teamData.designation;
      cgpTeam.description = teamData.description;

      this.cgpTeamRepository.save(cgpTeam);
    }
    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async bulkStatusApprove(): Promise<ResponseDto> {
    // const cgpTeam = await this.cgpTeamRepository.find({
    //   where: {
    //     role: Roles.ADMIN,
    //   },
    // });
    const qbcgp = await this.cgpRepository.createQueryBuilder('cgp');
    qbcgp.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qbcgp.where(' cgpTeams.role = (:role)', {
      role: Roles.ADMIN,
    });
    const cgpInfo = await qbcgp.getMany();
    if (!cgpInfo) {
      const errors = { username: 'Cgp Team is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    for (const element of cgpInfo) {
      // console.log(data)

      // const qbcgp = await this.cgpRepository.createQueryBuilder('cgp');
      // qbcgp.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
      // qbcgp.where(' cgpTeams.role = (:role)', {
      //   role: Roles.ADMIN
      // });
      // const cgpInfo = await qbcgp.getOne();

      for (const data of element.cgpTeams) {
        if (data.role === Roles.ADMIN) {
          console.log(element.id);

          const cgp = await this.cgpRepository.findOne({ id: element.id });
          if (!cgp) {
            const errors = { username: 'Cgp is not found.' };
            throw new HttpException(errors, HttpStatus.BAD_REQUEST);
          }

          let status = '';

          const newUser = new Users();
          console.log(data);

          if (data.email) {
            const userData = this.userRepository.find({ email: data.email });
            if (userData) {
            } else {
              newUser.email = data.email;
              newUser.firstName = data.firstname;
              newUser.lastName = data.lastname;
              newUser.function = data.designation;
              newUser.password = bcrypt.hashSync('Ctl@1234', 10);
              newUser.role = Role.CGP;
              const user = await this.userRepository.save(newUser);
              console.log(
                'file: cgp.service.ts - line 107 - CgpService - user',
                user,
              );

              console.log(cgp);

              const newCgpValue = Object.assign(cgp);
              newCgpValue.users = user;
              newCgpValue.status = CgpStatus.APPROVED;
              console.log(newCgpValue);
              const value = await this.cgpRepository.update(
                cgp.id,
                newCgpValue,
              );
              console.log('complete', value);

              status = constant.notification.isCGPApproved;
            }
          }
        }
      }
    }
    return this.commonService.buildCustomResponse(
      [],
      status,
      HttpStatus.CREATED.toString(),
    );
  }

  async getSubtopicsBySpeciality(specilityId: any): Promise<ResponseDto> {
    const subTopicList = await this.subtopicsRepository.find({
      specialties: specilityId,
    });

    return this.commonService.buildCustomResponse(
      subTopicList,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async getTagsBySpeciality(specilityId: any): Promise<ResponseDto> {
    const subtopicTagsList = await this.subtopicTagsRepository.find({
      specialties: specilityId,
    });

    return this.commonService.buildCustomResponse(
      subtopicTagsList,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async privacyPolicyList(): Promise<ResponseDto> {
    const list = await this.privacyPoliciesRepository.find();

    return this.commonService.buildCustomResponse(
      list,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async getSpecilityListByCgp(cgpId: any): Promise<ResponseDto> {
    const specialities = await this.cgpSpecialitiesRepository.find({
      where: { cgp: cgpId },
      order: { createdAt: 'DESC' },
      join: {
        alias: 'cgpSpecialty',
        leftJoinAndSelect: {
          specialties: 'cgpSpecialty.specialties',
        },
      },
    });
    const specialityList = [];
    for (const data of specialities) {
      specialityList.push(data.specialties);
    }

    return this.commonService.buildCustomResponse(
      specialityList,
      constant.notification.isSuccessFul,
      HttpStatus.OK.toString(),
    );
  }

  async teamRolesUpdate(
    updateTeamRoles: UpdateTeamRoles,
    teamId: string,
  ): Promise<ResponseDto> {
    const cgpTeam = await this.cgpTeamRepository.findOne({ id: teamId });

    if (!cgpTeam) {
      const errors = { username: 'CgpTeam is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    if (updateTeamRoles.role === Roles.ADMIN) {
      const qbcgp = await this.cgpRepository.createQueryBuilder('cgp');
      qbcgp.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
      qbcgp.where(' cgpTeams.id = (:teamId)', {
        teamId: teamId,
      });

      const list = await qbcgp.getOne();

      const cgpAdminTeam = await this.cgpTeamRepository.findOne({
        where: {
          cgp: list.id,
          role: Roles.ADMIN,
        },
      });

      if (cgpAdminTeam) {
        cgpAdminTeam.role = Roles.COLLABORATOR;

        this.cgpTeamRepository.update(cgpAdminTeam.id, cgpAdminTeam);
      }

      cgpTeam.role = updateTeamRoles.role;

      this.cgpTeamRepository.update(cgpTeam.id, cgpTeam);
    } else {
      cgpTeam.role = updateTeamRoles.role;

      this.cgpTeamRepository.update(cgpTeam.id, cgpTeam);
    }

    return this.commonService.buildCustomResponse(
      updateTeamRoles,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }


  async inviteTeamMember(payload: any): Promise<ResponseDto> { 
    const { emailId , cgpId } = payload;
    const cgp = await this.cgpRepository.findOne({ id: cgpId });
    emailId.forEach(element => {
      this.mailTemplateCustomService.mailTeamsInvite(element, cgp);
    });

    return this.commonService.buildCustomResponse(
      payload,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  // To CGP User Request register and check Already Exsit Mail
  async partnersSave(data: any): Promise<ResponseDto> {
    const partners = new Partners();

    partners.partnerName = data.name;
    partners.eSiret = data.siret;
    partners.active = true;
    const savedData = await this.partnersRepository.save(partners);
    return this.commonService.buildCustomResponse(
      [],
      constant.notification.cgpRequestSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  async createNewCGPTeam(
    createCgpTeamData: CreateNewCgpTeamDto,
    filePath: string,
  ): Promise<ResponseDto> {
    console.log(
      'file: cgp.service.ts - line 136 - CgpService - createCgpTeamData',
      createCgpTeamData,
    );
    const { email } = createCgpTeamData;
    const cgpEmail = await this.cgpTeamRepository.findOne({ email: email });

    if (cgpEmail) {
      const errors = { username: 'Email already registred' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const userEmail = await this.userRepository.findOne({ email: email });

    if (userEmail) {
      const errors = { username: 'Email already registred' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const { cgpId } = createCgpTeamData;
    const cgp = await this.cgpRepository.findOne({ id: cgpId });

    const cgpTeam = new CgpTeams();
    cgpTeam.cgp = cgp;
    cgpTeam.firstname = createCgpTeamData.firstname;
    cgpTeam.lastname = createCgpTeamData.lastname;
    cgpTeam.role = Roles.COLLABORATOR;
    cgpTeam.email = createCgpTeamData.email;
    cgpTeam.designation = createCgpTeamData.function;

    if (filePath) {
      console.log(
        'file: cgp.service.ts - line 147 - CgpService - filePath',
        filePath,
      );
      cgpTeam.bannerUrl = filePath;
    }

    this.cgpTeamRepository.save(cgpTeam);

    const newUser = new Users();
    newUser.email = createCgpTeamData.email;
    newUser.firstName = createCgpTeamData.firstname;
    newUser.lastName = createCgpTeamData.lastname;
    newUser.function = createCgpTeamData.function;
    newUser.gender = Gender[createCgpTeamData.gender];
    newUser.password = bcrypt.hashSync(createCgpTeamData.password, 10);
    newUser.role = Role.CGP;
    const user = await this.userRepository.save(newUser);

    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  // To CGP User Request register and check Already Exsit Mail
  async cgpPartnersIntegrate(data: any): Promise<ResponseDto> {
    const cgp = await this.cgpRepository.findOne({
      where: {
        eSiret: data.cgpSiret,
      },
    });
    if (!cgp) {
      return;
    }

    const partnersData = await this.partnersRepository.findOne({
      where: {
        eSiret: data.partnerSiret,
      },
    });

    if (!partnersData) {
      return;
    }

    const partners = new CgpPartners();

    partners.cgp = cgp;
    partners.partnerId = partnersData.id;
    partners.status = 1;
    const savedData = await this.cgpPartnersRepository.save(partners);
    return this.commonService.buildCustomResponse(
      [],
      constant.notification.cgpRequestSuccess,
      HttpStatus.CREATED.toString(),
    );
  }

  // To CGP User Request register and check Already Exsit Mail
  async siretList(email: any): Promise<ResponseDto> {
    const qb = await this.cgpRepository.createQueryBuilder('cgp');
    qb.leftJoinAndSelect('cgp.cgpTeams', 'cgpTeams');
    qb.where('cgpTeams.email = :email AND cgp.status = :status', {
      email: email,
      status: CgpStatus.APPROVED,
    });

    const cgpList = await qb.getMany();

    const cgp = plainToClass(CgpInfoForLogin, cgpList);
    return this.commonService.buildCustomResponse(
      cgp,
      constant.notification.cgpRequestSuccess,
      HttpStatus.CREATED.toString(),
    );
  }
}
