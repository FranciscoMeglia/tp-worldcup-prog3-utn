import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from 'src/basic/abstract.controller';
import { MatchesQueryRequest } from './request/matches-query.request';
import { CurrentWorldCupApiResponse } from '../services/model/simulation-service.interface';
import { MatchesService } from '../services/matches.service';
import { MatchesScreen } from '../services/model/matches-service.model';
import { ResponseObject } from '../../basic/response-object';
@ApiTags('world-cup')
@Controller('world-cup')
export class MatchesController extends AbstractController {
  // TODO: Se debe implementar el controlador y el servicio correspondiente.
constructor(private readonly matchesService: MatchesService) {
  super();
}
  
   @Get('/current')
     @ApiOperation({
      summary: 'Get current simulation',
       description: 'Returns the current simulation.',
    })
    async getCurrentWorldCup(): Promise<ResponseObject<CurrentWorldCupApiResponse>> {
      return this.createOkResponse(
        await this.matchesService.getCurrentWorldCup()
      );
    }

   @Get('/current/matches')
   @ApiOperation({
     summary: 'Get current matches',
     description: 'Returns matches.',
  })
  public async getMatches(@Query() request: MatchesQueryRequest): Promise<ResponseObject<MatchesScreen>> {
    return this.createOkResponse(
      await this.matchesService.getMatches(request.lang, request.stage),
    );
 }
}
