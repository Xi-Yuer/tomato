import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Attendance } from './attendance.entity';

@Entity('work_sessions')
export class WorkSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToOne(() => Attendance, { nullable: true })
  @JoinColumn({ name: 'clock_in_id' })
  clockIn: Attendance;

  @Column({ name: 'clock_in_id', nullable: true })
  clockInId: number | null; // 上班打卡记录ID

  @OneToOne(() => Attendance, { nullable: true })
  @JoinColumn({ name: 'clock_out_id' })
  clockOut: Attendance;

  @Column({ name: 'clock_out_id', nullable: true })
  clockOutId: number | null; // 下班打卡记录ID

  @Column({ type: 'datetime', name: 'start_time' })
  startTime: Date; // 班次开始时间

  @Column({ type: 'datetime', name: 'end_time', nullable: true })
  endTime: Date | null; // 班次结束时间

  @Column({ type: 'date', name: 'work_date' })
  workDate: Date; // 工作日期（基于开始时间计算，用于按天汇总）

  @Column({ type: 'int', nullable: true })
  duration: number | null; // 工作时长（分钟数）

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
