import { Test, TestingModule } from '@nestjs/testing';
import { MailTemplateService } from './mail-template.service';

describe('MailTemplateService', () => {
  let service: MailTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailTemplateService],
    }).compile();

    service = module.get<MailTemplateService>(MailTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
