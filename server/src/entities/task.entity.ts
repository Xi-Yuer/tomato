import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TaskModule } from './task-module.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // 任务名称

  @Column({ type: 'text', nullable: true })
  description: string; // 任务描述

  @ManyToOne(() => TaskModule, { nullable: false })
  @JoinColumn({ name: 'module_id' })
  module: TaskModule; // 所属模块

  @Column({ name: 'module_id' })
  moduleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
