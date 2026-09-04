import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from 'src/basic/abstract.controller';
import { WorldCupHistoryService } from '../services/world-cup-history.service';

/**
 * Este controller expone únicamente el endpoint history en su version final. 
 * Se pueden ver las versiones previas en los commits anteriores.
 * Los endpoints auxiliares metadata, stats, awards y matches fueron eliminados
 * para desacoplar la API pública de las consultas internas utilizadas para
 * construir el modelo compuesto de historial.
 */

@ApiTags('world-cup')
@Controller('world-cup')
export class WorldCupHistoryController extends AbstractController {
  constructor(private readonly worldCupHistoryService: WorldCupHistoryService) {
    super();
  }
 
 // Devuelve el historial consolidado de mundiales finalizados.
  
  @Get('history')
  @ApiOperation({ summary: 'World Cup - history component (composed model)' })
  public async getWorldCupHistory(): Promise<unknown> {
    return this.createOkResponse(
      await this.worldCupHistoryService.getWorldCupHistory(),
    );
  }
}