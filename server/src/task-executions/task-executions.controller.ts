import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  TaskExecutionsService,
  DailyModuleData,
} from './task-executions.service';
import { CreateTaskExecutionDto } from '../tasks/dto/create-task-execution.dto';
import { SubmitTaskExecutionDto } from '../tasks/dto/submit-task-execution.dto';
import { QueryTaskExecutionsDto } from '../tasks/dto/query-task-executions.dto';
import { QueryDailyModulesDto } from './dto/query-daily-modules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MinioService } from '../common/services/minio.service';

/**
 * 任务执行记录管理控制器
 * 提供任务执行记录相关的所有 API 接口
 * 所有接口都需要 JWT 认证
 */
@Controller('task-executions')
@UseGuards(JwtAuthGuard)
export class TaskExecutionsController {
  constructor(
    private readonly taskExecutionsService: TaskExecutionsService,
    private readonly minioService: MinioService,
  ) {}

  /**
   * 创建任务执行记录
   * @param createTaskExecutionDto 任务执行记录创建数据
   * @param req 请求对象（包含当前登录用户信息）
   * @returns 创建的任务执行记录
   * @description 为指定日期和任务模板创建执行记录
   */
  @Post()
  createTaskExecution(
    @Body() createTaskExecutionDto: CreateTaskExecutionDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.taskExecutionsService.createTaskExecution(
      createTaskExecutionDto,
      req.user.userId,
    );
  }

  /**
   * 根据日期和当前时间查询当天的任务模块及任务执行记录
   * @param queryDto 查询条件（日期、当前时间）
   * @returns 按模块分组的任务执行记录列表（包含执行状态）
   * @description 查询指定日期的任务执行记录，如果不存在则自动生成，按模块分组返回
   */
  @Post('daily-modules')
  findDailyModulesByTime(
    @Body() queryDto: QueryDailyModulesDto,
  ): Promise<DailyModuleData[]> {
    return this.taskExecutionsService.findDailyModulesByTime(queryDto);
  }

  /**
   * 查询任务执行记录
   * @param queryDto 查询条件（执行日期、模块、用户、状态、分页等）
   * @returns 任务执行记录列表及分页信息
   * @description 支持多条件筛选和分页查询
   */
  @Post('query')
  findTaskExecutions(@Body() queryDto: QueryTaskExecutionsDto) {
    return this.taskExecutionsService.findTaskExecutions(queryDto);
  }

  /**
   * 获取单个任务执行记录详情
   * @param id 任务执行记录ID
   * @returns 任务执行记录的详细信息
   * @description 根据ID获取指定任务执行记录的完整信息
   */
  @Get(':id')
  findOneTaskExecution(@Param('id', ParseIntPipe) id: number) {
    return this.taskExecutionsService.findOneTaskExecution(id);
  }

  /**
   * 提交任务完成情况
   * @param id 任务执行记录ID
   * @param req 请求对象（包含当前登录用户信息）
   * @param submitDto 提交数据（状态、照片URL数组、备注信息等）
   * @returns 更新后的任务执行记录
   * @description 员工提交任务完成情况，包括状态、照片证据和备注信息
   */
  @Post(':id/submit')
  submitTaskExecution(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
    @Body() submitDto: SubmitTaskExecutionDto,
  ) {
    return this.taskExecutionsService.submitTaskExecution(
      id,
      req.user.userId,
      submitDto,
    );
  }

  /**
   * 生成每日任务执行记录
   * @param date 日期（格式：YYYY-MM-DD），不传则使用今天
   * @returns 生成的任务执行记录列表
   * @description 为指定日期生成所有启用模块下的所有任务模板的执行记录
   */
  @Post('generate-daily')
  generateDailyTaskExecutions(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    return this.taskExecutionsService.generateDailyTaskExecutions(targetDate);
  }

  /**
   * 获取每日任务完成情况统计
   * @param date 查询日期（格式：YYYY-MM-DD），不传则默认为今天
   * @returns 该日期的任务完成情况统计（总数、完成数、完成率、按模块统计等）
   * @description 管理员可以查看指定日期的任务完成情况，包括完成率和各模块统计
   */
  @Get('daily-completion')
  getDailyTaskCompletion(@Query('date') date: string) {
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    return this.taskExecutionsService.getDailyTaskCompletion(date);
  }

  // ========== 文件上传 ==========

  /**
   * 上传任务相关图片文件
   * @param files 上传的文件数组（最多10个，每个最大5MB）
   * @returns 上传成功后的文件URL数组
   * @description 用于上传任务执行时的拍照证据，支持多文件上传，文件会保存到 MinIO 存储
   * 只允许上传图片格式（jpg, png, gif），上传成功后返回可访问的文件URL
   */
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
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
  async uploadFiles(
    @UploadedFiles()
    files: Array<{
      buffer: Buffer;
      size: number;
      mimetype: string;
      originalname: string;
    }>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请至少上传一个文件');
    }

    try {
      const fileUrls = await this.minioService.uploadFiles(files, 'tasks');

      return {
        message: '文件上传成功',
        files: fileUrls,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new BadRequestException(`文件上传失败: ${errorMessage}`);
    }
  }
}
