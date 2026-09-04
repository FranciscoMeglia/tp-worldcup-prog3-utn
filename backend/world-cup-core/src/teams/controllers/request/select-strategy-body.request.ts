import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectStrategyBodyRequest {
  @ApiProperty({ example: 'AGGRESSIVE' })
  @IsString()
  @IsNotEmpty()
  strategy: string;
}