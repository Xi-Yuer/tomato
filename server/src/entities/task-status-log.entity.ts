import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskExecution } from './task-execution.entity';
import { User } from './user.entity';
import { TaskStatus } from './task-status.enum';

@Entity('task_status_logs')
export class TaskStatusLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TaskExecution, { nullable: false })
  @JoinColumn({ name: 'task_execution_id' })
  taskExecution: TaskExecution;

  @Column({ name: 'task_execution_id' })
  taskExecutionId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User; // 执行状态变更的用户

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: TaskStatus,
  })
  oldStatus: TaskStatus; // 原状态

  @Column({
    type: 'enum',
    enum: TaskStatus,
  })
  newStatus: TaskStatus; // 新状态

  @Column({ type: 'text', nullable: true })
  notes: string; // 备注信息

  @CreateDateColumn()
  createdAt: Date;
}
