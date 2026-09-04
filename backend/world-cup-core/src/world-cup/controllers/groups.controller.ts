import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AbstractController } from "../../basic/abstract.controller";
import { GroupsService } from "../services/groups.service";

@ApiTags('world-cup')
@Controller('world-cup')
export class GroupsController extends AbstractController {

    constructor(
        private readonly  groupsService : GroupsService
    ) {
        super();
    }

    @Get('current/groups')
    @ApiOperation({ summary: 'World Cup - Group stage standings'})
    @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en']})
    public async getGroups(@Query('lang') lang?: string) {
        return this.createOkResponse(await
            this.groupsService.getGroups(lang));

    }
}
