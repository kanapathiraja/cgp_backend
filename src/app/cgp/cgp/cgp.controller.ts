import {
  Body,
  Controller,
  Post,
  UseFilters,
  UsePipes,
  ValidationPipe,
  Request,
  Put,
  Param,
  Get,
  UseInterceptors,
  UploadedFile,
  Res,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/shared/dto/response.dto';
import {
  CreateCgpDto,
  DescriptionCgpDto,
  CGPSocialWebsiteDto,
  CGPStatusUpdateDto,
  UpdateCgpDto,
  CGPSearchListReqDto,
} from '../dto/cgp.dto';
import { CgpService } from './cgp.service';
import {
  CreateCgpTeamDto,
  CreateNewCgpTeamDto,
  TeamInviteListDto,
  UpdateCgpTeamDto,
  UpdateTeamRoles,
} from '../dto/cgp-teams.dto';
import { CreateClientsDto } from '../dto/cgp-clients.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards, Query } from '@nestjs/common';
import { CreateSpecialitesDto } from '../dto/cgp-specialities.dto';
import { CreatePartnersDto } from '../dto/cgp-partners.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpExceptionFilter } from 'src/shared/exception-filters/http-exception.filter';
import { CreateCgpSubtopicsDto } from '../dto/cgp-subtopics.dto';
import { CreateCgpTagsDto } from '../dto/cgp-tags.dto';
import { CreateArticleDto, UpdateArticleDto } from '../dto/cgp-articles.dto';
import { constant } from '../../../shared/constant/constant';
import { CommonService } from '../../../shared/services/common.service';
// import ffmpeg from 'fluent-ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import any = jasmine.any;
import { Dir } from 'fs';
const xlsx = require('node-xlsx');
const http = require('http');
const request = require('request');

export const storage = diskStorage({
  destination: './public/cgp/bannerImage',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

export const logoStorage = diskStorage({
  destination: './public/cgp/logo',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

export const articleStorage = diskStorage({
  destination: './public/articles',
  filename: (req, file, cb) => {
    const randomName = file.originalname;
    return cb(null, `${randomName}`);
  },
});

export const teamStorage = diskStorage({
  destination: './public/teams/bannerImage',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('cgp')
@ApiTags('cgp')
export class CgpController {
  constructor(
    private cgpService: CgpService,
    private readonly commonService: CommonService,
  ) {}

  // User rquest to register
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('request')
  @ApiBody({ type: CreateCgpDto })
  async requestCGP(@Body() createCgpDto: CreateCgpDto): Promise<ResponseDto> {
    return await this.cgpService.requestCGP(createCgpDto);
  }

  // CGP Approve or Reject
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('status/update/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async approveCgp(
    @Body() cgpStatusUpdateData: CGPStatusUpdateDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    console.log(params);
    return await this.cgpService.cgpStatusUpdate(
      cgpStatusUpdateData,
      params.cgpId,
    );
  }

  // User rquest to register
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('update/:cgpId')
  @ApiBody({ type: UpdateCgpDto })
  @ApiParam({ name: 'cgpId' })
  async updateCgp(
    @Body() updateCgpDto: UpdateCgpDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.updateCgpInfo(updateCgpDto, params.cgpId);
  }

  // Get cgp details based on cgp Id
  // @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('getCGPInfo/:name')
  @ApiParam({ name: 'name' })
  @ApiBody({ type: CGPSearchListReqDto })
  async getCGPInfo(
    @Request() req: any,
    @Param() params: any,
    @Body() cgpSearchListReqDto: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    console.log(
      'file: cgp.controller.ts - line 52 - CgpController - params',
      params,
    );
    return await this.cgpService.getCGPInformation(
      params.name,
      cgpSearchListReqDto,
    );
  }

  // Get cgp description (presentation)
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('getCGPDescriptionInfo/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async getCGPDescriptionInfo(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getCGPDescriptionInformation(params.cgpId);
  }

  // Get cgp details based on emailId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('getCGPEmailInfo')
  @ApiQuery({ name: 'cgpId' })
  @ApiBody({ type: CGPSearchListReqDto })
  async getCGPEmailInfo(
    @Request() req: any,
    @Body() cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    return await this.cgpService.getCGPEmailInformation(
      req.query.cgpId,
      cgpSearchListReqData,
    );
  }

  // Get cgp details based on emailId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('getCGPAddressInfo/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async getCGPAddressInfo(
    @Param() Param: any
  ): Promise<ResponseDto> {
    return await this.cgpService.getCGPAddressInformation(
      Param.cgpId
    );
  }

  // Get cgp details based on emailId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('siret/:email')
  @ApiParam({ name: 'email' })
  async getSiretList(@Param() Param: any): Promise<ResponseDto> {
    return await this.cgpService.siretList(Param.email);
  }

  // Update CGP description (Presentation)
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('updateCGPDescription/:cgpId')
  @ApiBody({ type: DescriptionCgpDto })
  @ApiParam({ name: 'cgpId' })
  async updateCGPDescription(
    @Body() descriptionCgpData: DescriptionCgpDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.updateCGPDescription(
      descriptionCgpData,
      params.cgpId,
    );
  }

  // Create CGP Team Specfic team id
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('team/create')
  @ApiBody({ type: CreateCgpTeamDto })
  @ApiResponse({
    description: 'Create a new CGP Team',
    status: 201,
    type: CreateCgpTeamDto,
  })
  @UseInterceptors(FileInterceptor('bannerImage'))
  async createCGPTeam(
    @UploadedFile('file') bannerImage,
    @Body() createCgpTeamData: CreateCgpTeamDto,
  ): Promise<ResponseDto> {
    console.log(bannerImage);
    if (bannerImage) {
      const uploadData = await this.cgpService.uploadFile(
        bannerImage,
        'teamsBannerImage',
      );

      this.cgpService.createCGPTeam(
        createCgpTeamData,
        bannerImage ? uploadData['url'] : '',
      );
      return uploadData;
    } else {
      return this.cgpService.createCGPTeam(createCgpTeamData, '');
    }
  }

  // Update CGP Team Specfic team id
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('team/update/:teamId')
  @ApiParam({ name: 'teamId' })
  @ApiBody({ type: UpdateCgpTeamDto })
  @ApiResponse({
    description: 'Update CGP Team by TeamId',
    status: 201,
    type: UpdateCgpTeamDto,
  })
  @UseInterceptors(FileInterceptor('bannerImage'))
  async updateCGPTeam(
    @UploadedFile('file') bannerImage,
    @Body() updateCgpTeamData: UpdateCgpTeamDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    if (bannerImage) {
      const uploadData = await this.cgpService.uploadFile(
        bannerImage,
        'teamsBannerImage',
      );

      this.cgpService.updateCGPTeam(
        updateCgpTeamData,
        params.teamId,
        uploadData.url,
      );
      return uploadData;
    } else {
      return this.cgpService.updateCGPTeam(
        updateCgpTeamData,
        params.teamId,
        '',
      );
    }
  }

  // get CGP Team Specfic team id
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('team/:cgpId')
  @ApiParam({ name: 'cgpId' })
  @ApiBody({ type: CGPSocialWebsiteDto })
  @ApiResponse({
    description: 'get CGP Team by cgpId',
    status: 200,
    type: ResponseDto,
  })
  async getTeamsByCGP(
    @Param() params: any,
    @Body() data: any,
  ): Promise<ResponseDto> {
    console.log(data);
    return await this.cgpService.getTeamList(
      params.cgpId,
      data.start,
      data.length,
    );
  }

  // get CGP Team Specfic team id
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('team/:teamId')
  @ApiParam({ name: 'teamId' })
  @ApiResponse({
    description: 'get CGP Team by TeamId',
    status: 200,
    type: ResponseDto,
  })
  async getCGPTeam(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getCGPTeam(params.teamId);
  }

  // get CGP Team Specfic team id
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Delete('team/delete/:teamId')
  @ApiParam({ name: 'teamId' })
  @ApiResponse({
    description: 'get CGP Team by TeamId',
    status: 200,
    type: ResponseDto,
  })
  async deleteTeam(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.deleteTeam(params.teamId);
  }

  // update Practical info based on CGP
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('practicalInfo/updateCGPPracticalInfo')
  @ApiBody({ type: CGPSocialWebsiteDto })
  async updateCGPPracticalInfo(
    @Body() cgpSocialWebsiteData: CGPSocialWebsiteDto,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.updateCGPPracticalInfo(
      cgpSocialWebsiteData,
      req.query.cgpId,
    );
  }

  // get Practical info based on CGP
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('practicalInfo/getCGPPracticalInfo')
  async getCGPPracticalInfo(@Request() req: any): Promise<ResponseDto> {
    return await this.cgpService.getPracticalInformation(req.query.cgpId);
  }

  // get CGP CLient info based on CGP
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('clients/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async getCGPClients(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getCGPClients(params.cgpId);
  }

  // update CGP CLient info based on CGPId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('clients/:cgpId')
  @ApiParam({ name: 'cgpId' })
  @ApiBody({ type: CreateClientsDto })
  async updateCGPClient(
    @Body() createClientsData: CreateClientsDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    console.log(createClientsData);
    return await this.cgpService.updateCGPClient(
      createClientsData,
      params.cgpId,
    );
  }

  // get CGP CLient info based on CGP
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('specialities/:cgpId')
  @ApiParam({ name: 'cgpId' })
  // @ApiResponse({ type: SpecialitiesListDto })
  async getCGPSpecialities(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getCGPSpecialities(params.cgpId);
  }

  // update CGP CLient info based on CGPId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('specialities/:cgpId')
  @ApiBody({ type: CreateSpecialitesDto })
  @ApiParam({ name: 'cgpId' })
  async updateCGPSpecialities(
    @Body() createSpecialitesData: CreateSpecialitesDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    console.log(createSpecialitesData);
    return await this.cgpService.updateCGPSpecialities(
      createSpecialitesData,
      params.cgpId,
    );
  }

  // get CGP CLient info based on CGP
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('partners/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async getCGPPartners(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getCGPPartners(params.cgpId);
  }

  // update CGP CLient info based on CGPId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('partners/:cgpId')
  @ApiParam({ name: 'cgpId' })
  @ApiBody({ type: CreatePartnersDto })
  async updateCGPPartner(
    @Body() createPartnersData: CreatePartnersDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.updateCGPPartner(
      createPartnersData,
      params.cgpId,
    );
  }

  @Put('/banner/:cgpId')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'cgpId' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('bannerImage'))
  async uploadBannerImage(
    @UploadedFile('file') bannerImage,
    @Param() params: any,
  ): Promise<any> {
    console.log(bannerImage);

    const uploadData = await this.cgpService.uploadFile(
      bannerImage,
      'cgpBannerImage',
    );
    console.log(uploadData);

    this.cgpService.updateBannerImage(params.cgpId, uploadData.url);
    return uploadData;
  }

  @Put('/logo/:cgpId')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'cgpId' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  async updateCgpLogoImage(
    @UploadedFile('file') logo,
    @Param() params: any,
  ): Promise<any> {
    console.log(logo);

    const uploadData = await this.cgpService.uploadFile(logo, 'cgpLogo');

    this.cgpService.updateCgpLogoImage(params.cgpId, uploadData.url);
    return uploadData;
  }

  // Get cgp details based on search by speciality
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('getCgpBySearchSpeciality/:searchKey')
  @ApiParam({ name: 'searchKey' })
  @ApiBody({ type: CGPSearchListReqDto })
  async getCgpBySearchSpeciality(
    @Request() req: any,
    @Param() params: any,
    @Body() cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    return await this.cgpService.getCgpBasedonSpeciality(
      params.searchKey,
      cgpSearchListReqData,
    );
  }

  // Get cgp details based on subtopic
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('getCgpbySubtopic')
  @ApiQuery({ name: 'specialityId' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiBody({ type: CGPSearchListReqDto })
  async getCgpbySubtopic(
    @Request() req: any,
    @Query('specialityId') specialityId: string,
    @Query('limit') limit: string,
    @Body() cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    return await this.cgpService.getCgpBasedonId(
      specialityId,
      limit,
      cgpSearchListReqData,
    );
  }

  // Get nearby cgp list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('nearbyCgpList')
  @ApiBody({ type: CGPSearchListReqDto })
  async nearbyCgpList(
    @Body() cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    return await this.cgpService.nearbyCGP(cgpSearchListReqData);
  }

  // Get nearby cgp list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('list/location')
  @ApiBody({ type: CGPSearchListReqDto })
  async cgpListByLocation(
    @Body() cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    return await this.cgpService.cgpListByLocation(cgpSearchListReqData);
  }

  // Get nearby cgp list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('cgplistExceptOwn/:cgpId')
  @ApiParam({ name: 'cgpId' })
  @ApiBody({ type: CGPSearchListReqDto })
  async cgplistExceptOwn(
    @Body() cgpSearchListReqData: CGPSearchListReqDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.cgplistwithoutOwn(
      cgpSearchListReqData,
      params.cgpId,
    );
  }

  // Get speciality list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('getSpeciality')
  @ApiQuery({ name: 'searchKey', required: false })
  async getSpeciality(
    @Request() req: any,
    @Query('searchKey') searchKey: string,
  ): Promise<ResponseDto> {
    return await this.cgpService.getSpecialityList(searchKey);
  }

  /// Get speciality and sub topic list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('getSpecialityandSubtopics')
  @ApiQuery({ name: 'specialityId', required: false })
  async getSpecialityandSubtopics(
    @Query('specialityId') specialityId: string,
  ): Promise<ResponseDto> {
    return await this.cgpService.getSpecialityandSubtopicsList(specialityId);
  }

  // Get speciality and sub topic details
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @ApiQuery({ name: 'subtopicId' })
  @Get('getSpecialityandSubtopicDetails')
  async getSpecialityandSubtopicDetails(
    @Query('subtopicId') subtopicId: string,
  ): Promise<ResponseDto> {
    return await this.cgpService.getSubtopicDetails(subtopicId);
  }

  // get CGP CLient info based on CGP
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('subtopics/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async getCGPSubtopics(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getCGPSubtopics(params.cgpId);
  }

  // update CGP CLient info based on CGPId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('subtopics/:cgpId')
  @ApiBody({ type: CreateCgpSubtopicsDto })
  @ApiParam({ name: 'cgpId' })
  async updateCGPSubtopics(
    @Body() createCgpSubtopicsDto: CreateCgpSubtopicsDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    console.log(createCgpSubtopicsDto);
    return await this.cgpService.updateCGPSubtopics(
      createCgpSubtopicsDto,
      params.cgpId,
    );
  }

  // get CGP CLient info based on CGP
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('tags/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async getCGPTags(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getCGPTags(params.cgpId);
  }

  // update CGP CLient info based on CGPId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('tags/:cgpId')
  @ApiBody({ type: CreateCgpTagsDto })
  @ApiParam({ name: 'cgpId' })
  async updateCGPTags(
    @Body() createCgpTagsDto: CreateCgpTagsDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    console.log(createCgpTagsDto);
    return await this.cgpService.updateCGPTags(createCgpTagsDto, params.cgpId);
  }

  // articles create
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('articles/create')
  @ApiBody({ type: CreateArticleDto })
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ResponseDto> {
    return await this.cgpService.articleCreate(createArticleDto);
  }

  // Articles update
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('articles/update/:id')
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateArticleDto })
  async updateArticle(
    @Body() updateArticleDto: UpdateArticleDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.updateArticle(updateArticleDto, params.id);
  }

  // Articles delete
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Delete('articles/delete/:id')
  @ApiParam({ name: 'id' })
  async deleteArticle(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.deleteArticle(params.id);
  }

  // Articles list based on status
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('articles/list/:status')
  @ApiParam({ name: 'status' })
  @ApiQuery({ name: 'cgpId' })
  async articleList(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.articleList(params.status, req.query);
  }

  // Articles details based on article id
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('articles/details/:name')
  @ApiParam({ name: 'name' })
  @ApiBody({ type: CGPSearchListReqDto })
  async articleDetails(
    @Param() params: any,
    @Body() cgpSearchListReqData: CGPSearchListReqDto,
  ): Promise<ResponseDto> {
    return await this.cgpService.articleDetails(
      params.name,
      cgpSearchListReqData,
    );
  }

  // articles file upload
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('articles/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        upload: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('upload'))
  async articleUpload(@UploadedFile('file') upload): Promise<any> {
    return await this.cgpService.uploadFile(upload, 'article');
  }

  // Articles list based on status
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('articles/searchList/:tagId')
  @ApiParam({ name: 'tagId' })
  @ApiQuery({ name: 'type' })
  async articlesBasedonSearch(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.articleListSearch(params.tagId, req.query);
  }

  // Articles list based on subtopicId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('articles/subtopics/:subtopicId')
  @ApiParam({ name: 'subtopicId' })
  @ApiQuery({ name: 'limit' })
  @ApiQuery({ name: 'type', required: false })
  async articlesBasedonSubtopics(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.articlesBasedonSubtopics(
      params.subtopicId,
      req.query,
    );
  }

  // Articles list based on specialityId
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('articles/speciality/:specialityId')
  @ApiParam({ name: 'specialityId' })
  @ApiQuery({ name: 'limit' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'articleType' })
  async articlesBasedonSpecialityId(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.articlesBasedonSpeciality(
      params.specialityId,
      req.query,
    );
  }

  // Recent Articles list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('articles/articlesbasedonType/:type')
  @ApiParam({ name: 'type' })
  @ApiQuery({ name: 'limit' })
  @ApiOkResponse({ description: 'type = (recent/mostview)' })
  async recentArticles(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.mostRecentArticle(params, req.query);
  }

  // Articles update
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('articles/updateViewArticle/:id')
  @ApiParam({ name: 'id' })
  async updateViewArticle(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.updateArticleView(params.id);
  }

  // Recent Articles list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('articles/articlesbasedonCgp/:cgpId')
  @ApiParam({ name: 'cgpId' })
  @ApiQuery({ name: 'limit' })
  @ApiQuery({ name: 'type' })
  @ApiOkResponse({ description: 'type = (recent/mostview)' })
  async articlesByCgp(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.articleListBasedonCgp(
      params.cgpId,
      req.query,
      'all',
      '',
    );
  }

  // get location point
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('location/point/:id/:lat/:lan')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'lat' })
  @ApiParam({ name: 'lan' })
  async updateLocation(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.updateLocation(
      params.id,
      params.lat,
      params.lan,
    );
  }

  // Get FAQ list
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('faqs/getAllFaqs')
  async getAllFaqs(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    return await this.cgpService.getFaqs();
  }

  // CGP Bulk import
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('cgp/cgpBulkInsert')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        upload: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('upload', {
      storage: articleStorage,
    }),
  )
  async cgpBulkInsert(@UploadedFile() file): Promise<any> {
    console.log('C:\\Users\\softsuave\\Documents\\Projects\\vvv\\back_end' + file.path);

    // var obj = await xlsx.parse(
    //   'E:\\Projects\\CGP\\backend\\back_end\\' + file.path,
    // ); // parses a file

    const obj = xlsx.parse(
      fs.readFileSync('C:\\Users\\softsuave\\Documents\\Projects\\vvv\\back_end\\' + file.path),
    );

    for (const data of obj[0]['data']) {

      const value = data[0] ? data[0].split(' ') : [];

      let companyAddress = '';

      companyAddress = data[126] ? data[126] : '';

      companyAddress = companyAddress
        ? companyAddress + (data[104] ? ',' + data[104] : '')
        : data[104]
        ? data[104]
        : '';

      companyAddress = companyAddress
        ? companyAddress + (data[129] ? ',' + data[129] : '')
        : data[129]
        ? data[129]
        : '';

      companyAddress = companyAddress
        ? companyAddress + (data[135] ? ',' + data[135] : '')
        : data[135]
        ? data[135]
        : '';

      companyAddress = companyAddress
        ? companyAddress + (data[85] ? ',' + data[85] : '')
        : data[85]
        ? data[85]
        : '';

      companyAddress = companyAddress
        ? companyAddress + (data[72] ? ',' + data[72] : '')
        : data[72]
        ? data[72]
        : '';

      companyAddress = companyAddress
        ? companyAddress + (data[56] ? ',' + data[56] : '')
        : data[56]
        ? data[56]
        : '';

      const cgpData = {
        establishmentName: data[95],
        companyAddress: companyAddress,
        eSiret: value[0],
        hOrias: data[79],
        hCif: data[42] === 'on',
        contactNumber: '',
        email: data[96],
        hCompanyRcsSiren: data[138],
        hCoa: data[117] === 'on',
        addressComplement: data[135] ? data[135] : '',
        addressType: data[104] ? data[104] : '',
        addressNumber: data[126] ? data[126] : '',
        addressStreet: data[129] ? data[129] : '',
        city: data[72] ? data[72] : '',
        country: data[56] ? data[56] : '',
        postalCode: data[85] ? data[85] : '',
        website: data[78],
        foundedYear: data[61],
        presentationText: data[94],
        linkedIn: data[97],
        facebook: data[116],
        twitter: data[68],
        bannerImage: '',
        createdAt: new Date(),
        youtube: data[130],
        instagram: data[90],
        logo: data[110],
      };
      await this.cgpService.cgpBulkSave(cgpData);
    }
    return obj;
  }

  // CGP Bulk import
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('cgp/teamsBulkInsert')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        upload: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('upload', {
      storage: articleStorage,
    }),
  )
  async teamsBulkInsert(@UploadedFile() file): Promise<any> {
    console.log('C:\\Users\\softsuave\\Documents\\Projects\\vvv\\back_end\\' + file.path);

    const obj = xlsx.parse(
      fs.readFileSync('C:\\Users\\softsuave\\Documents\\Projects\\vvv\\back_end\\' + file.path),
    );

    for (const data of obj[0]['data']) {
      console.log(data);
      const value = data[5] ? data[5].split(' ') : '';

      const cgpData = {
        contact: data[0],
        eSiret: value[0],
        firstname: data[1] ? data[1].charAt(0).toUpperCase() + (data[1].slice(1)).toLowerCase() : '',
        lastname: data[2] ? data[2].charAt(0).toUpperCase() + (data[2].slice(1)).toLowerCase() : '',
        designation: data[3],
        description: data[43],
        email: data[8],
        createdAt: new Date(),
      };
      console.log(cgpData);

      await this.cgpService.teamBulkInsert(cgpData);
    }
    return obj;
  }

  // Team member email validation
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('team/emailValidate/:email')
  @ApiParam({ name: 'email' })
  @ApiQuery({ name: 'id' })
  async teamEmailValidation(
    @Param() params: any,
    @Request() req: any,
  ): Promise<ResponseDto> {
    console.log(req.query.id);
    return await this.cgpService.teamEmailValidation(
      params.email,
      req.query.id,
    );
  }

  // CGP Approve or Reject
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('bulkApprove')
  async bulkApproveCGP(): Promise<ResponseDto> {
    return await this.cgpService.bulkStatusApprove();
  }

  // get Subtopics based on Speciality
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('subtopicsBySpeciality/:specilityId')
  @ApiParam({ name: 'specilityId' })
  async getSubtopicsBySpeciality(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getSubtopicsBySpeciality(params.specilityId);
  }

  // get Tags based on Speciality
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('tagsBySpeciality/:specilityId')
  @ApiParam({ name: 'specilityId' })
  async getTagsBySpeciality(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getTagsBySpeciality(params.specilityId);
  }

  // get Tags based on Speciality
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('privacyPolicy')
  async privacyPolicy(): Promise<ResponseDto> {
    return await this.cgpService.privacyPolicyList();
  }

  // get Subtopics based on Speciality
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('specilityByCgp/:cgpId')
  @ApiParam({ name: 'cgpId' })
  async specilityByCgp(@Param() params: any): Promise<ResponseDto> {
    return await this.cgpService.getSpecilityListByCgp(params.cgpId);
  }

  // CGP Approve or Reject
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('team/role/update/:teamId')
  @ApiParam({ name: 'teamId' })
  async rolesUpdate(
    @Body() updateTeamRoles: UpdateTeamRoles,
    @Param() params: any,
  ): Promise<ResponseDto> {
    console.log(params);
    return await this.cgpService.teamRolesUpdate(
      updateTeamRoles,
      params.teamId,
    );
  }

  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('teamInvite')
  async inviteTeam(
    @Body() TeamInviteListDto: TeamInviteListDto,
    @Param() params: any
  ): Promise<ResponseDto> {
    console.log(params);
    return await this.cgpService.inviteTeamMember(TeamInviteListDto);
  }


   // Create CGP Team Specfic team id
   @UseFilters(new HttpExceptionFilter())
   @UsePipes(new ValidationPipe())
   @Post('register/team')
   @ApiBody({ type: CreateNewCgpTeamDto })
   @ApiResponse({
     description: 'Create a new CGP Team',
     status: 201,
     type: CreateNewCgpTeamDto,
   })
   @UseInterceptors(FileInterceptor('bannerImage'))
   async createNewCGPTeam(
     @UploadedFile('file') bannerImage,
     @Body() createCgpTeamData: CreateNewCgpTeamDto,
   ): Promise<ResponseDto> {
     console.log(bannerImage);
     if (bannerImage) {
       const uploadData = await this.cgpService.uploadFile(
         bannerImage,
         'teamsBannerImage',
       );
 
       this.cgpService.createNewCGPTeam(
         createCgpTeamData,
         bannerImage ? uploadData['url'] : '',
       );
       return uploadData;
     } else {
       return this.cgpService.createNewCGPTeam(createCgpTeamData, '');
     }
   }

  // Collaboration Import
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('cgp/bulkPartnersInsert')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        upload: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('upload', {
      storage: articleStorage,
    }),
  )
  async bulkPartnersInsert(@UploadedFile() file): Promise<any> {
    console.log('E:\\Projects\\CGP\\backend\\back_end\\' + file.path);

    const obj = xlsx.parse(
      fs.readFileSync('E:\\Projects\\CGP\\backend\\back_end\\' + file.path),
    );

    for (const data of obj[1]['data']) {
      const value = data[0] ? data[0].split(' ') : '';

      let name = '';
      for (const [key, element] of value.entries()) {
        if (key != 0) {
          name = name ? name + ' ' + element : element;
        }
      }
      const partnersData = {
        name: name,
        siret: value[0],
        createdAt: new Date(),
      };

      await this.cgpService.partnersSave(partnersData);
    }
    return obj;
  }

  // CGP Collaboration Import
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('cgp/bulkCGPPartnersInsert')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        upload: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('upload', {
      storage: articleStorage,
    }),
  )
  async bulkCGPPartnersInsert(@UploadedFile() file): Promise<any> {
    console.log('E:\\Projects\\CGP\\backend\\back_end\\' + file.path);

    const obj = xlsx.parse(
      fs.readFileSync('E:\\Projects\\CGP\\backend\\back_end\\' + file.path),
    );

    for (const data of obj[0]['data']) {
      const value = data[0] ? data[0].split(' ') : [];

      const partners = data[1] ? data[1].split(',') : [];

      let partnerSiret = '';
      console.log(partners);
      for (const element of partners) {
        const array = element.split(' ');
        partnerSiret = array[0];

        const partnersData = {
          partnerSiret: partnerSiret,
          cgpSiret: value[0],
        };

        await this.cgpService.cgpPartnersIntegrate(partnersData);
      }
    }
    return obj;
  }

}
