import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementCategory } from '../entities/procurement-category.entity';
import { CreateProcurementCategoryDto } from './dto/create-procurement-category.dto';
import { UpdateProcurementCategoryDto } from './dto/update-procurement-category.dto';

@Injectable()
export class ProcurementCategoriesService {
  constructor(
    @InjectRepository(ProcurementCategory)
    private procurementCategoriesRepository: Repository<ProcurementCategory>,
  ) {}

  async create(
    createProcurementCategoryDto: CreateProcurementCategoryDto,
  ): Promise<ProcurementCategory> {
    const category = this.procurementCategoriesRepository.create(
      createProcurementCategoryDto,
    );
    return await this.procurementCategoriesRepository.save(category);
  }

  async findAll(): Promise<ProcurementCategory[]> {
    return await this.procurementCategoriesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ProcurementCategory> {
    const category = await this.procurementCategoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('采购分类不存在');
    }

    return category;
  }

  async update(
    id: number,
    updateProcurementCategoryDto: UpdateProcurementCategoryDto,
  ): Promise<ProcurementCategory> {
    const category = await this.findOne(id);
    Object.assign(category, updateProcurementCategoryDto);
    return await this.procurementCategoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // 检查是否有关联的采购记录
    const procurementCount = await this.procurementCategoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.procurements', 'procurement')
      .where('category.id = :id', { id })
      .select('COUNT(procurement.id)', 'count')
      .getRawOne();

    const count = procurementCount?.count
      ? parseInt(procurementCount.count)
      : 0;
    if (count > 0) {
      throw new BadRequestException(
        '该分类下存在采购记录，无法删除。请先删除或转移相关采购记录。',
      );
    }

    await this.procurementCategoriesRepository.remove(category);
  }
}
