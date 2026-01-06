import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { TaskModule } from '../entities/task-module.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskModule)
    private taskModulesRepository: Repository<TaskModule>,
  ) {}

  // ========== 任务管理 ==========

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // 验证任务模块是否存在
    const module = await this.taskModulesRepository.findOne({
      where: { id: createTaskDto.moduleId },
    });

    if (!module) {
      throw new NotFoundException('任务模块不存在');
    }

    // 任务作为模板创建，每天都会执行
    const task = this.tasksRepository.create({
      name: createTaskDto.name,
      description: createTaskDto.description,
      moduleId: createTaskDto.moduleId,
      module,
    });

    return await this.tasksRepository.save(task);
  }

  async findAllTasks(moduleId?: number): Promise<Task[]> {
    // 查询任务模板列表
    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.module', 'module')
      .orderBy('task.createdAt', 'DESC');

    if (moduleId) {
      queryBuilder.andWhere('task.moduleId = :moduleId', { moduleId });
    }

    return await queryBuilder.getMany();
  }

  async findOneTask(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['module'],
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    return task;
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOneTask(id);

    // 如果更新了模块，验证模块是否存在
    if (updateTaskDto.moduleId && updateTaskDto.moduleId !== task.moduleId) {
      const module = await this.taskModulesRepository.findOne({
        where: { id: updateTaskDto.moduleId },
      });

      if (!module) {
        throw new NotFoundException('任务模块不存在');
      }

      task.module = module;
      task.moduleId = updateTaskDto.moduleId;
    }

    if (updateTaskDto.name) {
      task.name = updateTaskDto.name;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    return await this.tasksRepository.save(task);
  }

  async removeTask(id: number): Promise<void> {
    const task = await this.findOneTask(id);
    await this.tasksRepository.remove(task);
  }
}
