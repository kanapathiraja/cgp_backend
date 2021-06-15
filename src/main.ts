import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import 'dotenv';
import {default as config} from 'src/config/config';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json, urlencoded } from 'express';
import { EasyConfiguration } from './shared/services/easyconfig.service';

const port = config.server.port || 3000

async function bootstrap() {
  // const app = await NestFactory.create(AppModule, { cors: true });

  const appOptions = {cors: true};
  const app = await NestFactory.create<NestExpressApplication>(AppModule, appOptions);

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  // To enable cors origin 
  app.enableCors();  

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  console.log('bootstrap -> __dirname', __dirname);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'public','cgp'));
  app.useStaticAssets(join(__dirname, '..', 'public','teams'));

  
  const configs = new DocumentBuilder()
    .setTitle('CGP Datapunk')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, configs);
  SwaggerModule.setup('api', app, document);
 
  const configService : EasyConfiguration = app.get('EasyconfigService');

  let objConfig = configService["envConfig"];
  console.log("file: main.ts - line 46 - objConfig", objConfig);


  await app.listen(port, config.server.host);
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
