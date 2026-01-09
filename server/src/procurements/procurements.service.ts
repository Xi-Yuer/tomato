import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Procurement } from '../entities/procurement.entity';
import { ProcurementCategory } from '../entities/procurement-category.entity';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
import { QueryProcurementsByMonthDto } from './dto/query-procurements-by-month.dto';
import { QueryProcurementsStatisticsDto } from './dto/query-procurements-statistics.dto';

@Injectable()
export class ProcurementsService {
  constructor(
    @InjectRepository(Procurement)
    private procurementsRepository: Repository<Procurement>,
    @InjectRepository(ProcurementCategory)
    private procurementCategoriesRepository: Repository<ProcurementCategory>,
  ) {}

  async create(
    createProcurementDto: CreateProcurementDto,
  ): Promise<Procurement> {
    // 验证采购分类是否存在
    const category = await this.procurementCategoriesRepository.findOne({
      where: { id: createProcurementDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('采购分类不存在');
    }

    // 计算总价
    const totalPrice =
      createProcurementDto.quantity * createProcurementDto.unitPrice;

    const procurement = this.procurementsRepository.create({
      categoryId: createProcurementDto.categoryId,
      category,
      itemName: createProcurementDto.itemName,
      quantity: createProcurementDto.quantity,
      unitPrice: createProcurementDto.unitPrice,
      totalPrice,
      procurementDate: new Date(createProcurementDto.procurementDate),
      paymentScreenshot: createProcurementDto.paymentScreenshot || null,
    });

    return await this.procurementsRepository.save(procurement);
  }

  async findAll(): Promise<Procurement[]> {
    return await this.procurementsRepository.find({
      relations: ['category'],
      order: { procurementDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Procurement> {
    const procurement = await this.procurementsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!procurement) {
      throw new NotFoundException('采购记录不存在');
    }

    return procurement;
  }

  async update(
    id: number,
    updateProcurementDto: UpdateProcurementDto,
  ): Promise<Procurement> {
    const procurement = await this.findOne(id);

    // 如果更新了分类，验证分类是否存在
    if (
      updateProcurementDto.categoryId &&
      updateProcurementDto.categoryId !== procurement.categoryId
    ) {
      const category = await this.procurementCategoriesRepository.findOne({
        where: { id: updateProcurementDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('采购分类不存在');
      }

      procurement.category = category;
      procurement.categoryId = updateProcurementDto.categoryId;
    }

    // 更新字段
    if (updateProcurementDto.itemName !== undefined) {
      procurement.itemName = updateProcurementDto.itemName;
    }

    if (updateProcurementDto.quantity !== undefined) {
      procurement.quantity = updateProcurementDto.quantity;
    }

    if (updateProcurementDto.unitPrice !== undefined) {
      procurement.unitPrice = updateProcurementDto.unitPrice;
    }

    if (updateProcurementDto.procurementDate !== undefined) {
      procurement.procurementDate = new Date(
        updateProcurementDto.procurementDate,
      );
    }

    if (updateProcurementDto.paymentScreenshot !== undefined) {
      procurement.paymentScreenshot =
        updateProcurementDto.paymentScreenshot || null;
    }

    // 重新计算总价（如果数量或单价有变化）
    if (
      updateProcurementDto.quantity !== undefined ||
      updateProcurementDto.unitPrice !== undefined
    ) {
      procurement.totalPrice = procurement.quantity * procurement.unitPrice;
    }

    return await this.procurementsRepository.save(procurement);
  }

  async remove(id: number): Promise<void> {
    const procurement = await this.findOne(id);
    await this.procurementsRepository.remove(procurement);
  }

  /**
   * 按月度查询采购记录
   * @param queryDto 查询条件（年份、月份、可选分类ID）
   * @returns 指定年月的采购记录列表
   */
  async findByMonth(
    queryDto: QueryProcurementsByMonthDto,
  ): Promise<Procurement[]> {
    const { year, month, categoryId } = queryDto;

    // 构建日期范围：该月的第一天和最后一天
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const queryBuilder = this.procurementsRepository
      .createQueryBuilder('procurement')
      .leftJoinAndSelect('procurement.category', 'category')
      .where('procurement.procurementDate >= :startDate', { startDate })
      .andWhere('procurement.procurementDate <= :endDate', { endDate })
      .orderBy('procurement.procurementDate', 'DESC')
      .addOrderBy('procurement.createdAt', 'DESC');

    if (categoryId) {
      queryBuilder.andWhere('procurement.categoryId = :categoryId', {
        categoryId,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * 按月度+分类统计
   * @param queryDto 查询条件（年份、月份）
   * @returns 按分类分组的统计数据
   */
  async getStatistics(queryDto: QueryProcurementsStatisticsDto): Promise<
    Array<{
      categoryId: number;
      categoryName: string;
      categoryColor: string | null;
      count: number;
      totalAmount: number;
    }>
  > {
    const { year, month } = queryDto;

    // 构建日期范围：该月的第一天和最后一天
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const statistics = await this.procurementsRepository
      .createQueryBuilder('procurement')
      .leftJoin('procurement.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.color', 'categoryColor')
      .addSelect('COUNT(procurement.id)', 'count')
      .addSelect('SUM(procurement.totalPrice)', 'totalAmount')
      .where('procurement.procurementDate >= :startDate', { startDate })
      .andWhere('procurement.procurementDate <= :endDate', { endDate })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.color')
      .orderBy('totalAmount', 'DESC')
      .getRawMany();

    return statistics.map((stat) => ({
      categoryId: parseInt(stat.categoryId),
      categoryName: stat.categoryName,
      categoryColor: stat.categoryColor,
      count: parseInt(stat.count),
      totalAmount: parseFloat(stat.totalAmount) || 0,
    }));
  }
}
