import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatsAwardsService } from '../services/stats-awards.service';
import { AbstractController } from 'src/basic/abstract.controller';
import { ResponseObject } from 'src/basic/response-object';
import { WorldCupStatsApiResponse } from '../services/model/world-cup-history-service.interface';

@ApiTags('world-cup')
@Controller('world-cup')
export class StatsAwardsController extends AbstractController{

  constructor (
    private readonly statsAwarsService: StatsAwardsService
  ) {
    super();
  }

  @Get('stats-awards')
  @ApiOperation({
    summary: 'World Cup - Statistics & awards',
    description: 'Returns statistics and awards data for the World Cup.',
  })
  @ApiQuery({name: 'lang', required: false, enum: ['en', 'es']}) 
  public async getStatsAwards(@Query('lang') lang?: string): Promise<ResponseObject<WorldCupStatsApiResponse>> {

      return this.createOkResponse(
        await this.statsAwarsService.getStatsAwards(lang));
  }
  
}
