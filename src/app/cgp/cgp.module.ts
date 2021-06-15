import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/shared/services/common.service';
import { CgpController } from './cgp/cgp.controller';
import { CgpService } from './cgp/cgp.service';
import { Cgp } from './entities/cgp.entity';
import { CgpTeams } from './entities/cgp-teams.entity';
import { CgpPracticalInfo } from './entities/cgp-practicalInfo.entity';
import { CgpSpecialities } from './entities/cgp-specialities.entity';
import { CgpClients } from './entities/cgp-clients.entity';
import { AuthModule } from '../auth/auth.module';
import { Users } from '../users/entities/users.entity';
import { CgpPartners } from './entities/cgp-partners.entity';
import { Specialties } from './entities/specialties.entity';
import { MailServiceTemplateService } from 'src/shared/services/mail-service-template.service';
import { MailServiceService } from 'src/shared/services/mail-service.service';
import { CgpSubtopics } from './entities/cgp-subtopics.entity';
import { CgpTags } from './entities/cgp-tags.entity';
import { Subtopics } from './entities/subtopics.entity';
import { CgpArticles } from './entities/cgp_articles.entity';
import { CgpArticlesTags } from './entities/cgp-articles-tags.entity';
import { MailTemplateCustomService } from 'src/shared/services/mail-template-custom.service';
import { MailTemplateService } from '../mail-template/mail-template/mail-template.service';
import { MailTemplate } from '../mail-template/entities/mail-template.entity';
import { SubtopicTags } from './entities/subtopic-tags.entity';
import { Faqs } from './entities/faq.entity';
import { CgpExists } from './entities/cgp-exists.entity';
import { PrivacyPolicies } from './entities/privacy-policies.entity';
import { CgpArticlesSubtopics } from './entities/cgp-articles-subtopics.entity';
import { CgpArticlesSpecialities } from './entities/cgp-articles-specialities.entity';
import { Partners } from "./entities/partners.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cgp,
      CgpPracticalInfo,
      CgpSpecialities,
      CgpTeams,
      CgpClients,
      Users,
      CgpPartners,
      Specialties,
      CgpSubtopics,
      CgpTags,
      Subtopics,
      CgpArticles,
      CgpArticlesTags,
      Faqs,
      Partners,
      MailTemplate,
      SubtopicTags,
      CgpExists,
      PrivacyPolicies,
      CgpArticlesSubtopics,
      CgpArticlesSpecialities,
    ]),
    AuthModule,
  ],
  controllers: [CgpController],
  providers: [
    CgpService,
    CommonService,
    MailServiceService,
    MailTemplateCustomService,
    MailTemplateService,
  ],
})
export class CgpModule {}
