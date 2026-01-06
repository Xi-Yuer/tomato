import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_modules')
export class TaskModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string; // 模块名称：上午、中午、晚上、打烊等

  @Column({ length: 200, nullable: true })
  description: string; // 模块描述

  @Column({ type: 'time', nullable: true })
  startTime: string; // 时间段开始时间，格式：HH:mm:ss

  @Column({ type: 'time', nullable: true })
  endTime: string; // 时间段结束时间，格式：HH:mm:ss

  @Column({ default: true })
  isActive: boolean; // 是否启用

  @OneToMany(() => Task, (task) => task.module)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
