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
import { TaskModulesService } from './task-modules.service';
import { CreateTaskModuleDto } from '../tasks/dto/create-task-module.dto';
import { UpdateTaskModuleDto } from '../tasks/dto/update-task-module.dto';
import { QueryModulesByTimeDto } from '../tasks/dto/query-modules-by-time.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 任务模块管理控制器
 * 提供任务模块相关的所有 API 接口
 * 所有接口都需要 JWT 认证
 */
@Controller('task-modules')
@UseGuards(JwtAuthGuard)
export class TaskModulesController {
  constructor(private readonly taskModulesService: TaskModulesService) {}

  /**
   * 创建任务模块
   * @param createTaskModuleDto 任务模块创建数据（名称、描述、触发时间等）
   * @returns 创建的任务模块信息
   * @description 管理员可以创建新的任务模块，如"上午"、"中午"、"晚上"、"打烊"等
   */
  @Post()
  createTaskModule(@Body() createTaskModuleDto: CreateTaskModuleDto) {
    return this.taskModulesService.createTaskModule(createTaskModuleDto);
  }

  /**
   * 获取所有任务模块列表
   * @returns 所有任务模块的数组，按触发时间排序
   * @description 获取系统中所有已创建的任务模块
   */
  @Get()
  findAllTaskModules() {
    return this.taskModulesService.findAllTaskModules();
  }

  /**
   * 根据当前时间查询任务模块及子任务（模板查询）
   * @param queryDto 查询条件（当前时间，格式：HH:mm:ss）
   * @returns 符合条件的任务模块列表（包含子任务）
   * @description 根据当前时间查询包含该时间点的所有任务模块，返回模块及其下的所有子任务（模板）
   */
  @Post('by-time')
  findModulesByTime(@Body() queryDto: QueryModulesByTimeDto) {
    return this.taskModulesService.findModulesByTime(queryDto);
  }

  /**
   * 获取单个任务模块详情
   * @param id 任务模块ID
   * @returns 任务模块详细信息（包含该模块下的所有任务）
   * @description 根据ID获取指定任务模块的详细信息
   */
  @Get(':id')
  findOneTaskModule(@Param('id', ParseIntPipe) id: number) {
    return this.taskModulesService.findOneTaskModule(id);
  }

  /**
   * 更新任务模块信息
   * @param id 任务模块ID
   * @param updateTaskModuleDto 要更新的任务模块数据
   * @returns 更新后的任务模块信息
   * @description 管理员可以修改任务模块的名称、描述、触发时间等
   */
  @Patch(':id')
  updateTaskModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskModuleDto: UpdateTaskModuleDto,
  ) {
    return this.taskModulesService.updateTaskModule(id, updateTaskModuleDto);
  }

  /**
   * 删除任务模块
   * @param id 任务模块ID
   * @returns 删除操作结果
   * @description 管理员可以删除指定的任务模块
   */
  @Delete(':id')
  removeTaskModule(@Param('id', ParseIntPipe) id: number) {
    return this.taskModulesService.removeTaskModule(id);
  }
}
