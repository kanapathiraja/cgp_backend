import { JwtService } from '@nestjs/jwt';
import { Injectable  } from '@nestjs/common';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class CommonService {

    constructor() { }   

    async buildCustomResponse(data: object, message: string, status: string) {
      const dto = new ResponseDto();
      dto.status = status;
      dto.message = message;
      dto.data = data;      
      return dto;
  }

   generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    let firstPart = ((Math.random() * 46656) | 0).toString();
    let secondPart = ((Math.random() * 46656) | 0).toString();
    firstPart = ("000" + firstPart).slice(-3);
    secondPart = ("000" + secondPart).slice(-3);
    let uuid = firstPart + secondPart; 
    return uuid;
}

  
}
