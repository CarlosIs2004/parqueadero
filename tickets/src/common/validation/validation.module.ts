import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ValidationService } from './validation.service';

@Module({
  imports: [HttpModule],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}
