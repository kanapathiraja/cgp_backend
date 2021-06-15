import { Test, TestingModule } from '@nestjs/testing';
import { CgpService } from './cgp.service';

describe('CgpService', () => {
  let service: CgpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CgpService],
    }).compile();

    service = module.get<CgpService>(CgpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
