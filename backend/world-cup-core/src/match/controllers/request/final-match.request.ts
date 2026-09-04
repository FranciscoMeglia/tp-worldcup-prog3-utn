import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { LanguageEnum } from "src/basic/model/language.enum";

export class PlayTurnRequest{
    @ApiProperty()
    @IsNumber()
    selectedOption: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    lang?: string;
}


export class StartFinalMatchRequest{
    @ApiProperty()
    @IsString()
    teamId: string;

    @ApiPropertyOptional({ enum: [LanguageEnum.ES, LanguageEnum.EN], default: LanguageEnum.ES })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEnum(LanguageEnum)
    lang?: LanguageEnum;
}

export class StrategyRequest{
    
    @ApiProperty()
    @IsString()
    teamId: string;

    @ApiProperty()
    @IsString()
    strategy: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    lang?: string;

}

export class FormationRequest{
    @ApiProperty()
    @IsString()
    teamId: string;

    @ApiProperty()
    @IsString()
    formation: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    lang?: string;
}