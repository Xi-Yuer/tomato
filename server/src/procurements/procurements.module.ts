import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementsController } from './procurements.controller';
import { ProcurementsService } from './procurements.service';
import { Procurement } from '../entities/procurement.entity';
import { ProcurementCategory } from '../entities/procurement-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Procurement, ProcurementCategory])],
  controllers: [ProcurementsController],
  providers: [ProcurementsService],
  exports: [ProcurementsService],
})
export class ProcurementsModule {}
