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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProcurementsService } from './procurements.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
import { QueryProcurementsByMonthDto } from './dto/query-procurements-by-month.dto';
import { QueryProcurementsStatisticsDto } from './dto/query-procurements-statistics.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../common/services/minio.service';

/**
 * 采购记录管理控制器
 * 提供采购记录相关的所有 API 接口
 * 所有接口都需要 JWT 认证
 */
@Controller('procurements')
@UseGuards(JwtAuthGuard)
export class ProcurementsController {
  constructor(
    private readonly procurementsService: ProcurementsService,
    private readonly minioService: MinioService,
  ) {}

  /**
   * 创建采购记录
   * @param createProcurementDto 采购记录创建数据
   * @returns 创建的采购记录信息
   * @description 创建新的采购记录，自动计算总价
   */
  @Post()
  create(@Body() createProcurementDto: CreateProcurementDto) {
    return this.procurementsService.create(createProcurementDto);
  }

  /**
   * 查询采购记录列表
   * @returns 所有采购记录列表
   * @description 获取所有采购记录，按采购时间倒序排列
   */
  @Get()
  findAll() {
    return this.procurementsService.findAll();
  }

  /**
   * 获取单个采购记录详情
   * @param id 采购记录ID
   * @returns 采购记录详细信息（包含分类信息）
   * @description 根据ID获取指定采购记录的完整信息
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procurementsService.findOne(id);
  }

  /**
   * 更新采购记录信息
   * @param id 采购记录ID
   * @param updateProcurementDto 要更新的采购记录数据
   * @returns 更新后的采购记录信息
   * @description 更新采购记录信息，如果更新了数量或单价，会自动重新计算总价
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcurementDto: UpdateProcurementDto,
  ) {
    return this.procurementsService.update(id, updateProcurementDto);
  }

  /**
   * 删除采购记录
   * @param id 采购记录ID
   * @returns 删除操作结果
   * @description 删除指定的采购记录
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procurementsService.remove(id);
  }

  /**
   * 上传付款截图
   * @param file 上传的文件（单个图片）
   * @returns 上传成功后的文件URL
   * @description 用于上传采购记录的付款截图，文件会保存到 MinIO 存储
   * 只允许上传图片格式（jpg, png, gif），上传成功后返回可访问的文件URL
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('只允许上传图片文件（jpg, png, gif）'),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile()
    file: {
      buffer: Buffer;
      size: number;
      mimetype: string;
      originalname: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    try {
      const fileExt = file.originalname.split('.').pop();
      const fileUrl = await this.minioService.uploadFile(
        file,
        `procurements/${Date.now()}.${fileExt}`,
      );

      return {
        message: '文件上传成功',
        url: fileUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new BadRequestException(`文件上传失败: ${errorMessage}`);
    }
  }

  /**
   * 按月度查询采购记录
   * @param queryDto 查询条件（年份、月份、可选分类ID）
   * @returns 指定年月的采购记录列表
   * @description 查询指定年月的所有采购记录，可按分类筛选
   */
  @Post('by-month')
  findByMonth(@Body() queryDto: QueryProcurementsByMonthDto) {
    return this.procurementsService.findByMonth(queryDto);
  }

  /**
   * 按月度+分类统计
   * @param queryDto 查询条件（年份、月份）
   * @returns 按分类分组的统计数据
   * @description 统计指定年月的采购数据，按分类分组，返回每个分类的记录数和总金额
   */
  @Post('statistics')
  getStatistics(@Body() queryDto: QueryProcurementsStatisticsDto) {
    return this.procurementsService.getStatistics(queryDto);
  }
}
