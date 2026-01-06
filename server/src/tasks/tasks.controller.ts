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
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 任务模板管理控制器
 * 提供任务模板相关的所有 API 接口
 * 所有接口都需要 JWT 认证
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ========== 任务管理 ==========

  /**
   * 创建新任务
   * @param createTaskDto 任务创建数据（名称、描述、执行时间、所属模块等）
   * @returns 创建的任务信息
   * @description 管理员可以创建新任务，任务对所有员工可见
   */
  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  /**
   * 查询任务模板列表
   * @param moduleId 可选，筛选指定模块的任务
   * @returns 任务模板列表
   * @description 查询所有任务模板，可按模块筛选
   */
  @Get()
  findAllTasks(@Query('moduleId') moduleId?: string) {
    const moduleIdNum = moduleId ? parseInt(moduleId) : undefined;
    return this.tasksService.findAllTasks(moduleIdNum);
  }

  /**
   * 获取单个任务详情
   * @param id 任务ID
   * @returns 任务的详细信息（包含模块信息）
   * @description 根据ID获取指定任务的完整信息
   */
  @Get(':id')
  findOneTask(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOneTask(id);
  }

  /**
   * 更新任务模板信息
   * @param id 任务ID
   * @param updateTaskDto 要更新的任务数据
   * @returns 更新后的任务信息
   * @description 管理员可以修改任务模板的名称、描述、所属模块等
   */
  @Patch(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  /**
   * 删除任务模板
   * @param id 任务ID
   * @returns 删除操作结果
   * @description 管理员可以删除指定的任务模板
   */
  @Delete(':id')
  removeTask(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.removeTask(id);
  }
}
