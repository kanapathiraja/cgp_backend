import { Test, TestingModule } from '@nestjs/testing';
import { CgpController } from './cgp.controller';

describe('CgpController', () => {
  let controller: CgpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CgpController],
    }).compile();

    controller = module.get<CgpController>(CgpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
