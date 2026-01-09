import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementCategoriesController } from './procurement-categories.controller';
import { ProcurementCategoriesService } from './procurement-categories.service';
import { ProcurementCategory } from '../entities/procurement-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcurementCategory])],
  controllers: [ProcurementCategoriesController],
  providers: [ProcurementCategoriesService],
  exports: [ProcurementCategoriesService],
})
export class ProcurementCategoriesModule {}
