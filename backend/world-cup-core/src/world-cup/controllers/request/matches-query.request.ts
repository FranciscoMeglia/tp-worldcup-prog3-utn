import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional} from 'class-validator';
import { stageEnum } from './stage.enum';
import { LanguageEnum } from 'src/basic/model/language.enum';

export class MatchesQueryRequest {
  @ApiPropertyOptional({ enum: [LanguageEnum.ES, LanguageEnum.EN], default: LanguageEnum.ES })
    @IsOptional()
    @Transform(({ value }) =>
      typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEnum(LanguageEnum)
    lang?: LanguageEnum;
  @ApiPropertyOptional({enum : stageEnum})
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
 @IsEnum(stageEnum)
  stage?: stageEnum;
}