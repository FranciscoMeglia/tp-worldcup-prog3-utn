import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectFormationBodyRequest {
  @ApiProperty({ example: '4-3-3' })
  @IsString()
  @IsNotEmpty()
  formation: string;
}