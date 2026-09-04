import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from 'src/basic/abstract.controller';
import { LiveEventsService } from '../services/live-events.service';
import { LiveEventRequest } from './request/live-event.request';


@ApiTags('final-match')
@Controller('final-match')
export class LiveEventsController extends AbstractController{
  
  constructor(private readonly liveEventsService: LiveEventsService){
    super();
  }

  // Devolver stats de eventos. 
  @Get('events')
  @ApiOperation({summary: 'Final Match - Live Events'})
  public async getLiveEvents(@Query() request: LiveEventRequest): Promise<unknown>{
    return this.createOkResponse(await this.liveEventsService.getLiveEvents(request.lang));
  }

  //Jugador del partido
  @Get('match-player')
  @ApiOperation({summary: 'Get Match Awards'})
  public async getMatchAwards(lang?: string): Promise<unknown>{
    return this.createOkResponse(await this.liveEventsService.getMatchAwards(lang));
  }
}
