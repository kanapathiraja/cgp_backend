import { JwtService } from '@nestjs/jwt';
import { Injectable, HttpException, HttpStatus,  } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { ResponseDto } from '../dto/response.dto';
import { TokenVerifyDto } from 'src/app/auth/dto/auth-dto';
import { constant } from '../constant/constant';
var jwt = require('jsonwebtoken');
var uniqid = require('uniqid');


@Injectable()
export class JwtCustomService {

    constructor( private jwtService: JwtService) { }   

    public encrypt(text){
        const encryptedString = Buffer.from(text).toString('base64');
        return encryptedString;
      }
      
      public decrypt(text){
        const decryptedString = Buffer.from(text, 'base64').toString('ascii');
        return decryptedString;
      }

      async jwtSign(data: any, expiresIn = '30m'): Promise<any> {
      let userData = classToPlain(data);
        let token = '';
        try {
          token = jwt.sign(userData, constant.jwtConstants.secret, { expiresIn: expiresIn });
        } catch (err) {
            let exceptionName = err.toString().split(':');           
            throw new HttpException({ message: exceptionName[0], err }, HttpStatus.UNAUTHORIZED);
        }          
        return token;
    }


    // To check if the token is valid or not
    async jwtVerify(token: string): Promise<any> {
      let payload = jwt.verify(token, constant.jwtConstants.secret);
      return payload;
  }

  async generateUserCode() {
    let randNumber = Math.round(Date.now() / 1000).toString(); 
    randNumber = randNumber.substr(randNumber.length - 5);
    let randUniqid = uniqid().toUpperCase();
    randUniqid = randUniqid.substr(randUniqid.length - 5);
    let userCode = randUniqid+randNumber;
    return userCode;
 }

   async generatePassword() {
    let randNumber = Math.round(Date.now() / 1000).toString(); 
    randNumber = randNumber.substr(randNumber.length - 7);
    let randUniqid = uniqid().toUpperCase();
    randUniqid = randUniqid.substr(randUniqid.length - 7);
    let userCode = randUniqid+randNumber;
    return userCode;
  }

   async buildCustomResponse(data: object, message: string, status: string) {
      const dto = new ResponseDto();
      dto.status = status;
      dto.message = message;
      dto.data = data;
      return dto;
  }

    

  
}
