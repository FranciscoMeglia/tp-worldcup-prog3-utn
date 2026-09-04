import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatchSquadResponse } from '../models/team-state.interface';
import { ResponseObject } from 'src/basic/response-object';
import { TeamStateService } from '../services/team-state.service';
import { AbstractController } from 'src/basic/abstract.controller';

@ApiTags('final-match')
@Controller('final-match')
export class TeamStateController extends AbstractController {
  // TODO: Se debe implementar el controlador y el servicio correspondiente.
  constructor(private readonly teamStateService: TeamStateService){
    super();
  }

  @ApiOperation({
    summary: 'Get squad state for the current active match',
    description:
      'Returns formations, strategies, tactical breakdown, starters, on-field players, bench, substitutions and player live/effective stats. If no active final exists, returns the latest final from current world cup.',
  })
  @Get('/current/squad')
  async GetCurrentMatchSquad(): Promise<ResponseObject<MatchSquadResponse>>{
    return this.createOkResponse(
      await this.teamStateService.getCurrentMatchSquad()
    );
  }
  
}
