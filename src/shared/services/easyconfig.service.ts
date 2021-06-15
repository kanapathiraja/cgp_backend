import { Injectable, OnModuleInit } from '@nestjs/common';
import { EasyconfigService } from "nestjs-easyconfig";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
@Injectable()
export class EasyConfiguration  implements OnModuleInit {
    constructor(private easyConfigService: EasyconfigService) {}

    onModuleInit() {
        return this.easyConfigService.get('envConfig');
    }
}