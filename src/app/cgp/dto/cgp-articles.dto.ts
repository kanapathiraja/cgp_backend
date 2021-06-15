import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

// Request DTO
export class CreateArticleDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  articleImage: string;

  @ApiProperty()
  articleUrl: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  speciality: [];

  @ApiProperty()
  subtopics: [];

  @ApiProperty()
  tags: [];

  @ApiProperty()
  cgp: any;

  @ApiProperty()
  articleEditor: string;
}

// Request DTO
export class UpdateArticleDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  articleImage: string;

  @ApiProperty()
  articleUrl: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  speciality: [];

  @ApiProperty()
  subtopics: [];

  @ApiProperty()
  tags: [];

  @ApiProperty()
  articleEditor: string;
}

// Response DTO

@Exclude()
export class CgpInfoForArticle {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  establishmentName: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  bannerImage: string;

  @ApiProperty()
  @Expose()
  logo: string;

  @ApiProperty()
  @Expose()
  city: string;

  @ApiProperty()
  @Expose()
  cgpTeams: any;

  @ApiProperty()
  @Expose()
  reason: any;
}

@Exclude()
export class ArticleInfoDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  articleImage: string;

  @ApiProperty()
  @Expose()
  articleUrl: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;

  @ApiProperty()
  @Expose()
  articleView: number;

  @ApiProperty()
  @Expose()
  articleEditor: string;

  @ApiProperty()
  @Expose()
  cgpArticlesTags: object;

  @ApiProperty()
  @Expose()
  cgpArticlesSubtopics: object;

  @ApiProperty()
  @Expose()
  cgpArticlesSpecialities: object;

  @Expose()
  @Type(() => CgpInfoForArticle)
  cgp: CgpInfoForArticle[];
}
