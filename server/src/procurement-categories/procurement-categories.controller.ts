import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProcurementCategoriesService } from './procurement-categories.service';
import { CreateProcurementCategoryDto } from './dto/create-procurement-category.dto';
import { UpdateProcurementCategoryDto } from './dto/update-procurement-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 采购分类管理控制器
 * 提供采购分类相关的所有 API 接口
 * 所有接口都需要 JWT 认证
 */
@Controller('procurement-categories')
@UseGuards(JwtAuthGuard)
export class ProcurementCategoriesController {
  constructor(
    private readonly procurementCategoriesService: ProcurementCategoriesService,
  ) {}

  /**
   * 创建采购分类
   * @param createProcurementCategoryDto 采购分类创建数据（名称、颜色等）
   * @returns 创建的采购分类信息
   * @description 创建新的采购分类，如"各项食材费用"、"建店物料费用"、"开店杂费"等
   */
  @Post()
  create(@Body() createProcurementCategoryDto: CreateProcurementCategoryDto) {
    return this.procurementCategoriesService.create(
      createProcurementCategoryDto,
    );
  }

  /**
   * 获取所有采购分类列表
   * @returns 所有采购分类的数组
   * @description 获取系统中所有已创建的采购分类
   */
  @Get()
  findAll() {
    return this.procurementCategoriesService.findAll();
  }

  /**
   * 获取单个采购分类详情
   * @param id 采购分类ID
   * @returns 采购分类详细信息
   * @description 根据ID获取指定采购分类的详细信息
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procurementCategoriesService.findOne(id);
  }

  /**
   * 更新采购分类信息
   * @param id 采购分类ID
   * @param updateProcurementCategoryDto 要更新的采购分类数据
   * @returns 更新后的采购分类信息
   * @description 修改采购分类的名称、颜色等
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcurementCategoryDto: UpdateProcurementCategoryDto,
  ) {
    return this.procurementCategoriesService.update(
      id,
      updateProcurementCategoryDto,
    );
  }

  /**
   * 删除采购分类
   * @param id 采购分类ID
   * @returns 删除操作结果
   * @description 删除指定的采购分类，如果该分类下存在采购记录则无法删除
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procurementCategoriesService.remove(id);
  }
}
