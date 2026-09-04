import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { CoachingService } from '../services/coaching.service';
import { CoachingQueryRequest } from './request/coaching-query.request';
import { SelectFormationBodyRequest } from './request/select-formation-body.request';
import { SelectStrategyBodyRequest } from './request/select-strategy-body.request';

@ApiTags('my-team')
@Controller('my-team')
export class CoachingController extends AbstractController {
  constructor(private readonly coachingService: CoachingService) {
    super();
  }

  @Get('coaching')
  @ApiOperation({ summary: 'My Team - Coaching staff and tactics overview' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  public async getCoachingOverview(
    @Query() request: CoachingQueryRequest,
  ): Promise<unknown> {
    return this.createOkResponse(
      await this.coachingService.getCoachingOverview(request.lang),
    );
  }

  @Post('coaching/strategy')
  @ApiOperation({ summary: 'My Team - Update team strategy' })
  @ApiBody({ type: SelectStrategyBodyRequest })
  public async selectStrategy(
    @Body() body: SelectStrategyBodyRequest,
  ): Promise<unknown> {
    await this.coachingService.selectStrategy(body.strategy);
    return this.createOkResponse({ success: true });
  }

  @Post('coaching/formation')
  @ApiOperation({ summary: 'My Team - Update team formation' })
  @ApiBody({ type: SelectFormationBodyRequest })
  public async selectFormation(
    @Body() body: SelectFormationBodyRequest,
  ): Promise<unknown> {
    await this.coachingService.selectFormation(body.formation);
    return this.createOkResponse({ success: true });
  }

  @Post('coaching/reset')
  @ApiOperation({ summary: 'My Team - Reset team tactics to default' })
  public async resetTactics(): Promise<unknown> {
    await this.coachingService.resetTactics();
    return this.createOkResponse({ success: true });
  }
}