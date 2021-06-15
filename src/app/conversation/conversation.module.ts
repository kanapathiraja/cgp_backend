import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/shared/services/common.service';
import { AuthModule } from '../auth/auth.module';
import { CgpTeams } from '../cgp/entities/cgp-teams.entity';
import { Users } from '../users/entities/users.entity';
import { ConversationController } from './conversation/conversation.controller';
import { ConversationService } from './conversation/conversation.service';
import { Chats } from './entities/chats.entity';
import { Conversation } from './entities/conversation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          CgpTeams,
          Users,
          Conversation,
          Chats
        ]),
        AuthModule,
      ],
  controllers: [ConversationController],
  providers: [
    CommonService,
    ConversationService
  ]
})
export class ConversationModule {}
