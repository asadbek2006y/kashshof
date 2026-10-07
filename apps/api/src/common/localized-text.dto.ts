import { ApiPropertyOptional } from '@nestjs/swagger';

export class LocalizedTextDto {
  @ApiPropertyOptional()
  uz?: string;

  @ApiPropertyOptional()
  ru?: string;

  @ApiPropertyOptional()
  en?: string;
}
