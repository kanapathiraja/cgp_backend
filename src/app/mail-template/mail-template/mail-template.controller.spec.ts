import { Test, TestingModule } from '@nestjs/testing';
import { MailTemplateController } from './mail-template.controller';

describe('MailTemplateController', () => {
  let controller: MailTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailTemplateController],
    }).compile();

    controller = module.get<MailTemplateController>(MailTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
