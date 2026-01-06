import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TaskModule } from '../entities/task-module.entity';
import { CreateTaskModuleDto } from '../tasks/dto/create-task-module.dto';
import { UpdateTaskModuleDto } from '../tasks/dto/update-task-module.dto';
import { QueryModulesByTimeDto } from '../tasks/dto/query-modules-by-time.dto';

@Injectable()
export class TaskModulesService {
  constructor(
    @InjectRepository(TaskModule)
    private taskModulesRepository: Repository<TaskModule>,
  ) {}

  async createTaskModule(
    createTaskModuleDto: CreateTaskModuleDto,
  ): Promise<TaskModule> {
    const taskModule = this.taskModulesRepository.create(createTaskModuleDto);
    return await this.taskModulesRepository.save(taskModule);
  }

  async findAllTaskModules(): Promise<TaskModule[]> {
    return await this.taskModulesRepository.find({
      order: { startTime: 'ASC' },
    });
  }

  /**
   * 根据当前时间查询任务模块及子任务（模板查询）
   * @param queryDto 查询条件（当前时间）
   * @returns 符合条件的任务模块列表（包含子任务）
   * @description 查询包含指定时间点的所有任务模块（模块开始时间 <= 当前时间 <= 模块结束时间）
   */
  async findModulesByTime(
    queryDto: QueryModulesByTimeDto,
  ): Promise<TaskModule[]> {
    const { currentTime } = queryDto;
    return await this.taskModulesRepository.find({
      where: {
        startTime: LessThanOrEqual(currentTime ?? '00:00:00'),
        endTime: MoreThanOrEqual(currentTime ?? '00:00:00'),
        isActive: true,
      },
      relations: ['tasks'],
    });
  }

  async findOneTaskModule(id: number): Promise<TaskModule> {
    const taskModule = await this.taskModulesRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!taskModule) {
      throw new NotFoundException('任务模块不存在');
    }

    return taskModule;
  }

  async updateTaskModule(
    id: number,
    updateTaskModuleDto: UpdateTaskModuleDto,
  ): Promise<TaskModule> {
    const taskModule = await this.findOneTaskModule(id);
    Object.assign(taskModule, updateTaskModuleDto);
    return await this.taskModulesRepository.save(taskModule);
  }

  async removeTaskModule(id: number): Promise<void> {
    const taskModule = await this.findOneTaskModule(id);
    await this.taskModulesRepository.remove(taskModule);
  }
}
