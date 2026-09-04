import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum } from "class-validator";
import { LanguageEnum } from "src/basic/model/language.enum";

export class LiveEventRequest{
    @ApiPropertyOptional({ enum: [LanguageEnum.ES, LanguageEnum.EN], default: LanguageEnum.ES })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEnum(LanguageEnum)
    lang?: LanguageEnum;
}