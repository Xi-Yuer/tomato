import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TaskExecution } from '../entities/task-execution.entity';
import { TaskStatusLog } from '../entities/task-status-log.entity';
import { Task } from '../entities/task.entity';
import { TaskModule } from '../entities/task-module.entity';
import { User } from '../entities/user.entity';
import { CreateTaskExecutionDto } from '../tasks/dto/create-task-execution.dto';
import { SubmitTaskExecutionDto } from '../tasks/dto/submit-task-execution.dto';
import { QueryTaskExecutionsDto } from '../tasks/dto/query-task-executions.dto';
import { QueryDailyModulesDto } from './dto/query-daily-modules.dto';
import { TaskStatus } from '../entities/task-status.enum';
import { TaskModulesService } from '../task-modules/task-modules.service';
import { TasksService } from '../tasks/tasks.service';
import {
  parseDateToCST,
  formatDateToCST,
  getTodayDateStr,
  getStartOfDayCST,
} from '../common/utils/date.util';

// 定义返回数据结构的接口
export interface TaskExecutionData {
  id: number;
  status: TaskStatus;
  userId: number | null;
  user: {
    id: number;
    name: string;
    phone: string;
  } | null;
  completedAt: Date | null;
  photoEvidence: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskData {
  id: number;
  name: string;
  description: string | null;
  moduleId: number;
  createdAt: Date;
  updatedAt: Date;
  execution: TaskExecutionData;
}

export interface DailyModuleData {
  id: number;
  name: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tasks: TaskData[];
}

@Injectable()
export class TaskExecutionsService {
  constructor(
    @InjectRepository(TaskExecution)
    private taskExecutionsRepository: Repository<TaskExecution>,
    @InjectRepository(TaskStatusLog)
    private taskStatusLogsRepository: Repository<TaskStatusLog>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskModule)
    private taskModulesRepository: Repository<TaskModule>,
    private taskModulesService: TaskModulesService,
    private tasksService: TasksService,
  ) {}

  /**
   * 创建任务执行记录
   */
  async createTaskExecution(
    createTaskExecutionDto: CreateTaskExecutionDto,
    userId?: number,
  ): Promise<TaskExecution> {
    // 验证任务模板是否存在
    const task = await this.tasksRepository.findOne({
      where: { id: createTaskExecutionDto.taskId },
    });

    if (!task) {
      throw new NotFoundException('任务模板不存在');
    }

    // 检查是否已存在该日期和任务的执行记录
    const userIdValue = createTaskExecutionDto.userId || userId;
    const existing = await this.taskExecutionsRepository.findOne({
      where: {
        taskId: createTaskExecutionDto.taskId,
        executionDate: new Date(createTaskExecutionDto.executionDate),
        userId: userIdValue ? userIdValue : IsNull(),
      },
    });

    if (existing) {
      throw new BadRequestException('该日期的任务执行记录已存在');
    }

    const execution = this.taskExecutionsRepository.create({
      taskId: createTaskExecutionDto.taskId,
      task,
      executionDate: new Date(createTaskExecutionDto.executionDate),
      userId: createTaskExecutionDto.userId || userId || null,
      status: TaskStatus.PENDING,
    });

    return await this.taskExecutionsRepository.save(execution);
  }

  /**
   * 查询任务执行记录
   * @description 查询指定日期的所有任务执行记录，不再根据当前时间过滤
   */
  async findTaskExecutions(queryDto: QueryTaskExecutionsDto): Promise<{
    data: TaskExecution[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      executionDate,
      moduleId,
      userId,
      status,
      page: pageStr,
      limit: limitStr,
    } = queryDto;

    // 转换数字参数
    const moduleIdNum = moduleId ? parseInt(moduleId, 10) : undefined;
    const userIdNum = userId ? parseInt(userId, 10) : undefined;
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 100;

    // 使用东八区时间处理日期字符串
    const executionDateStr = executionDate.includes('T')
      ? formatDateToCST(new Date(executionDate))
      : executionDate;

    const queryBuilder = this.taskExecutionsRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.task', 'task')
      .leftJoinAndSelect('task.module', 'module')
      .leftJoinAndSelect('execution.user', 'user')
      .where('DATE(execution.executionDate) = :executionDate', {
        executionDate: executionDateStr,
      })
      .orderBy('module.startTime', 'ASC')
      .addOrderBy('task.createdAt', 'ASC');

    if (moduleIdNum && !isNaN(moduleIdNum)) {
      queryBuilder.andWhere('module.id = :moduleId', { moduleId: moduleIdNum });
    }

    if (userIdNum && !isNaN(userIdNum)) {
      queryBuilder.andWhere('execution.userId = :userId', {
        userId: userIdNum,
      });
    }

    if (status) {
      queryBuilder.andWhere('execution.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [executions, total] = await queryBuilder.getManyAndCount();

    return {
      data: executions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取单个任务执行记录
   */
  async findOneTaskExecution(id: number): Promise<TaskExecution> {
    const execution = await this.taskExecutionsRepository.findOne({
      where: { id },
      relations: ['task', 'task.module', 'user'],
    });

    if (!execution) {
      throw new NotFoundException('任务执行记录不存在');
    }

    return execution;
  }

  /**
   * 提交任务完成情况
   */
  async submitTaskExecution(
    id: number,
    userId: number,
    submitDto: SubmitTaskExecutionDto,
  ): Promise<TaskExecution> {
    const execution = await this.findOneTaskExecution(id);

    // 验证任务状态
    if (execution.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('任务已完成，无法重复提交');
    }

    const oldStatus = execution.status;

    // 更新任务执行记录状态和照片
    execution.status = submitDto.status;
    execution.userId = userId;

    if (submitDto.status === TaskStatus.COMPLETED) {
      execution.completedAt = new Date();
    }

    // 处理多张照片：将照片URL数组转换为逗号分隔的字符串存储
    // 支持多张照片上传，最多10张
    if (submitDto.photoUrls && submitDto.photoUrls.length > 0) {
      // 过滤掉空字符串和无效URL
      const validPhotoUrls = submitDto.photoUrls.filter(
        (url) => url && url.trim().length > 0,
      );
      if (validPhotoUrls.length > 0) {
        execution.photoEvidence = validPhotoUrls.join(',');
      }
    }

    if (submitDto.notes) {
      execution.notes = submitDto.notes;
    }

    const savedExecution = await this.taskExecutionsRepository.save(execution);

    // 记录状态变更
    await this.createStatusLog(
      execution.id,
      userId,
      oldStatus,
      submitDto.status,
      submitDto.notes,
    );

    return savedExecution;
  }

  /**
   * 生成每日任务执行记录
   * 为指定日期生成所有启用模块下的所有任务模板的执行记录
   */
  async generateDailyTaskExecutions(date: Date): Promise<TaskExecution[]> {
    // 使用东八区时间格式化日期字符串
    const dateStr = formatDateToCST(date);
    // 确保日期的时间部分为 00:00:00（东八区）
    const standardDate = getStartOfDayCST(dateStr);

    const activeModules = await this.taskModulesRepository.find({
      where: { isActive: true },
      relations: ['tasks'],
    });

    const generatedExecutions: TaskExecution[] = [];

    for (const module of activeModules) {
      for (const task of module.tasks) {
        // 检查是否已存在该日期和任务的执行记录（使用日期字符串比较）
        const existing = await this.taskExecutionsRepository
          .createQueryBuilder('execution')
          .where('execution.taskId = :taskId', { taskId: task.id })
          .andWhere('DATE(execution.executionDate) = :date', { date: dateStr })
          .getOne();

        if (!existing) {
          const execution = this.taskExecutionsRepository.create({
            taskId: task.id,
            task,
            executionDate: standardDate,
            userId: null, // 初始时没有执行人
            status: TaskStatus.PENDING,
          });
          generatedExecutions.push(
            await this.taskExecutionsRepository.save(execution),
          );
        }
      }
    }

    return generatedExecutions;
  }

  /**
   * 创建状态变更记录
   */
  private async createStatusLog(
    taskExecutionId: number,
    userId: number,
    oldStatus: TaskStatus,
    newStatus: TaskStatus,
    notes?: string,
  ): Promise<TaskStatusLog> {
    const log = this.taskStatusLogsRepository.create({
      taskExecutionId,
      userId,
      oldStatus,
      newStatus,
      notes,
    });

    return await this.taskStatusLogsRepository.save(log);
  }

  /**
   * 根据日期查询当天的任务模块及任务执行记录
   * @param queryDto 查询条件（日期）
   * @returns 按模块分组的任务执行记录列表（包含执行状态）
   * @description 查询指定日期的所有任务执行记录，如果不存在则自动生成，按模块分组返回。返回当天所有需要完成的任务模块，不再根据当前时间过滤
   */
  async findDailyModulesByTime(
    queryDto: QueryDailyModulesDto,
  ): Promise<DailyModuleData[]> {
    // 解析日期参数（默认今天，使用东八区时间）
    const dateStr = queryDto.date || getTodayDateStr();
    const targetDate = getStartOfDayCST(dateStr);

    // 检查当天是否有任务执行记录（使用日期字符串比较）
    const existingCount = await this.taskExecutionsRepository
      .createQueryBuilder('execution')
      .where('DATE(execution.executionDate) = :date', {
        date: dateStr,
      })
      .getCount();

    // 如果没有执行记录，自动生成
    if (existingCount === 0) {
      await this.generateDailyTaskExecutions(targetDate);
    }

    // 查询当天的所有任务执行记录，关联 Task 和 TaskModule
    // 注意：生成后重新查询，确保获取最新数据
    const executions = await this.taskExecutionsRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.task', 'task')
      .leftJoinAndSelect('task.module', 'module')
      .leftJoinAndSelect('execution.user', 'user')
      .where('DATE(execution.executionDate) = :date', {
        date: dateStr,
      })
      .orderBy('module.startTime', 'ASC')
      .addOrderBy('task.createdAt', 'ASC')
      .getMany();

    // 按模块分组，组织返回数据结构
    const moduleMap = new Map<number, DailyModuleData>();

    for (const execution of executions) {
      const module = execution.task.module;
      const moduleId = module.id;

      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          id: module.id,
          name: module.name,
          description: module.description,
          startTime: module.startTime,
          endTime: module.endTime,
          isActive: module.isActive,
          createdAt: module.createdAt,
          updatedAt: module.updatedAt,
          tasks: [],
        });
      }

      const moduleData = moduleMap.get(moduleId);
      if (moduleData) {
        moduleData.tasks.push({
          id: execution.task.id,
          name: execution.task.name,
          description: execution.task.description,
          moduleId: execution.task.moduleId,
          createdAt: execution.task.createdAt,
          updatedAt: execution.task.updatedAt,
          execution: {
            id: execution.id,
            status: execution.status,
            userId: execution.userId,
            user: execution.user
              ? {
                  id: execution.user.id,
                  name: execution.user.name,
                  phone: execution.user.phone,
                }
              : null,
            completedAt: execution.completedAt,
            photoEvidence: execution.photoEvidence,
            notes: execution.notes,
            createdAt: execution.createdAt,
            updatedAt: execution.updatedAt,
          },
        });
      }
    }

    // 转换为数组并按开始时间排序
    const result = Array.from(moduleMap.values()).sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      const aTime = a.startTime ?? '';
      const bTime = b.startTime ?? '';
      return aTime.localeCompare(bTime);
    });

    return result;
  }

  // ========== 查询每日任务完成情况 ==========

  async getDailyTaskCompletion(date: string) {
    // 使用东八区时间处理日期
    const dateStr = date.includes('T') ? formatDateToCST(new Date(date)) : date;

    // 使用日期字符串查询，避免时区问题
    const executions = await this.taskExecutionsRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.task', 'task')
      .leftJoinAndSelect('task.module', 'module')
      .leftJoinAndSelect('execution.user', 'user')
      .where('DATE(execution.executionDate) = :date', {
        date: dateStr,
      })
      .getMany();

    const total = executions.length;
    const completed = executions.filter(
      (execution) => execution.status === TaskStatus.COMPLETED,
    ).length;
    const inProgress = executions.filter(
      (execution) => execution.status === TaskStatus.IN_PROGRESS,
    ).length;
    const pending = executions.filter(
      (execution) => execution.status === TaskStatus.PENDING,
    ).length;
    const overdue = executions.filter(
      (execution) => execution.status === TaskStatus.OVERDUE,
    ).length;

    // 按模块分组统计
    interface ModuleStat {
      moduleId: number;
      moduleName: string;
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      overdue: number;
    }

    const moduleStats = executions.reduce(
      (acc, execution) => {
        const moduleName = execution.task.module.name;
        if (!acc[moduleName]) {
          acc[moduleName] = {
            moduleId: execution.task.moduleId,
            moduleName,
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0,
          };
        }
        acc[moduleName].total++;
        const statusKey = execution.status as keyof ModuleStat;
        if (statusKey in acc[moduleName]) {
          acc[moduleName][statusKey]++;
        }
        return acc;
      },
      {} as Record<string, ModuleStat>,
    );

    return {
      date,
      summary: {
        total,
        completed,
        inProgress,
        pending,
        overdue,
        completionRate:
          total > 0 ? ((completed / total) * 100).toFixed(2) : '0.00',
      },
      moduleStats: Object.values(moduleStats) as Array<{
        moduleId: number;
        moduleName: string;
        total: number;
        completed: number;
        inProgress: number;
        pending: number;
        overdue: number;
      }>,
      executions,
    };
  }
}
