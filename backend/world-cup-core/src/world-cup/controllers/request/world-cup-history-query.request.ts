import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LanguageEnum } from '../../../basic/model/language.enum';

// parametros requeridos para consultar los premios de un mundial historico.
export class WorldCupAwardsQueryRequest {
  @ApiProperty({ description: 'World cup id' })
  @IsString()
  @IsNotEmpty()
  worldCupId: string;

  @ApiPropertyOptional({
    enum: [LanguageEnum.ES, LanguageEnum.EN],
    default: LanguageEnum.ES,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEnum(LanguageEnum)
  lang?: LanguageEnum;
}

// parametros requeridos para consultar la metadata de un mundial historico.
export class WorldCupMetadataQueryRequest {
  @ApiProperty({ description: 'World cup id' })
  @IsString()
  @IsNotEmpty()
  worldCupId: string;
}

// parametros requeridos para consultar las estadisticas de un mundial historico.
export class WorldCupStatsQueryRequest {
  @ApiProperty({ description: 'World cup id' })
  @IsString()
  @IsNotEmpty()
  worldCupId: string;
}

// parametros requeridos para consultar los partidos de un mundial historico.
export class WorldCupMatchesQueryRequest {
  @ApiProperty({ description: 'World cup id' })
  @IsString()
  @IsNotEmpty()
  worldCupId: string;

  @ApiPropertyOptional({
    enum: [
      'GROUP-STAGE',            
      'ROUND-OF-32',
      'ROUND-OF-16',
      'QUARTERFINALS',    
      'SEMIFINALS',
      'THIRD-PLACE',
      'FINAL',      
    ],
  })
  @IsOptional() 
  @IsEnum([
    'GROUP-STAGE',            
    'ROUND-OF-32',  
    'ROUND-OF-16',
    'QUARTERFINALS',    
    'SEMIFINALS', 
    'THIRD-PLACE',
    'FINAL',
  ])
  stage?: string;
  }