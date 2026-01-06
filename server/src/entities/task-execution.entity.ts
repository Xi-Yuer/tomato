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
import { Task } from './task.entity';
import { User } from './user.entity';
import { TaskStatus } from './task-status.enum';
import { TaskStatusLog } from './task-status-log.entity';

@Entity('task_executions')
export class TaskExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  executionDate: Date; // 执行日期

  @ManyToOne(() => Task, { nullable: false })
  @JoinColumn({ name: 'task_id' })
  task: Task; // 关联的任务模板

  @Column({ name: 'task_id' })
  taskId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User; // 执行人

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus; // 完成状态

  @Column({ type: 'text', nullable: true })
  photoEvidence: string; // 拍照留存证据（图片路径，多个用逗号分隔）

  @Column({ type: 'text', nullable: true })
  notes: string; // 备注信息

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date; // 完成时间

  @OneToMany(() => TaskStatusLog, (log) => log.taskExecution)
  statusLogs: TaskStatusLog[]; // 状态变更记录

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
