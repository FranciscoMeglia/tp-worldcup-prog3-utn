import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from 'src/basic/abstract.controller';
import { PlayFinalService } from '../services/play-final.service';
import { FormationRequest, PlayTurnRequest, StartFinalMatchRequest, StrategyRequest } from './request/final-match.request';
import { FormationsResponse, MatchResponse, SelectedFormationResponse, SelectedStrategyResponse, StrategiesResponse } from '../models/final-response.interface';
import { ResponseObject } from 'src/basic/response-object';
import { CurrentStatusResponse } from '../services/model/worldcup-status-response.interface';

@ApiTags('final-match')
@Controller('final-match')
export class PlayFinalController extends AbstractController{

  constructor(private readonly playFinalService: PlayFinalService){
    super();
  }

  @Get('world-cup/current')
  @ApiOperation({summary: 'Get current worldcup status'})
  public async CurrentStatus(): Promise<ResponseObject<CurrentStatusResponse>>{
    return this.createOkResponse(
      await this.playFinalService.getCurrentWorldcupStatus()
    );
  }

  @Get('strategies')
  @ApiOperation({summary: 'To populate the strategy selector'})
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['en', 'es'],
    description: 'Optional language for descriptions. Default: en.',
    example: 'en',
  })
  public async GetStrategies(@Query('lang') lang?: string): Promise<ResponseObject<StrategiesResponse[]>>{
    return this.createOkResponse(
      await this.playFinalService.GetStrategies(lang)
    );
  }

  @Get('formations')
  @ApiOperation({summary: 'To populate the formation selector'})
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['en', 'es'],
    description: 'Optional language for descriptions. Default: en.',
    example: 'en',
  })
  public async GetFormations(@Query('lang') lang?: string): Promise<ResponseObject<FormationsResponse[]>>{
    return this.createOkResponse(
      await this.playFinalService.GetFormations(lang)
    );
  }

  @Post('start-final')
  @ApiOperation({summary: 'Final Match - Start'})
  public async StartMatch(@Body() request: StartFinalMatchRequest): Promise<ResponseObject<MatchResponse>>{
    return this.createOkResponse(
      await this.playFinalService.StartMatch(request.teamId, request.lang)
    );
  }

  @Post('play-turn')
  @ApiOperation({summary: 'Final Match - Play Turn'})
  public async PlayTurn(@Body() request: PlayTurnRequest): Promise<ResponseObject<MatchResponse>>{
    return this.createOkResponse(
      await this.playFinalService.PlayTurn(request.selectedOption, request.lang)
    )
  }

  @Post('select-strategy')
  @ApiOperation({summary: 'Select a strategy'})
  @ApiBody({ type: StrategyRequest })
  public async SelectStrategy(@Body() request: StrategyRequest): Promise<ResponseObject<SelectedStrategyResponse>>{
    return this.createOkResponse(
      await this.playFinalService.SelectStrategy(request.teamId, request.strategy, request.lang)
    );
  }

  @Post('select-formation')
  @ApiOperation({summary: 'Select a strategy'})
  @ApiBody({ type: FormationRequest })
  public async SelectFormation(@Body() request: FormationRequest): Promise<ResponseObject<SelectedFormationResponse>>{
    return this.createOkResponse(
      await this.playFinalService.SelectFormation(request.teamId, request.formation, request.lang)
    );
  }
}
