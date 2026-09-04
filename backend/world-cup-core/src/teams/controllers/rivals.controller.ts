import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { RivalsQueryRequest } from './request/rivals-query.request';
import { RivalsService } from '../services/rivals.service';

@ApiTags('my-team')
@Controller('my-team')
export class RivalsController extends AbstractController {
  /** Exposes historical rivals endpoints and delegates logic to RivalsBackendService. */
  constructor(private readonly rivalsService: RivalsService) {
    super();
  }

  /** Returns  historical rivals for the selected team. */
  @Get('historical-rivals')
  @ApiOperation({ summary: 'My Team - Historical rivals component', })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  @ApiQuery({ name: 'teamId', required: false })
  public async getHistoricalRivals(@Query() request: RivalsQueryRequest): Promise<unknown> {
    return this.createOkResponse(await this.rivalsService.getHistoricalRivals(request.lang),);
  }
}

