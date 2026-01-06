import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorkSession } from './work-session.entity';

export enum AttendanceType {
  CLOCK_IN = 'clock_in', // 上班打卡
  CLOCK_OUT = 'clock_out', // 下班打卡
}

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: AttendanceType,
  })
  type: AttendanceType; // 打卡类型：上班打卡或下班打卡

  @Column({ type: 'datetime', name: 'clock_time' })
  clockTime: Date; // 打卡时间

  @ManyToOne(() => WorkSession, { nullable: true })
  @JoinColumn({ name: 'work_session_id' })
  workSession: WorkSession;

  @Column({ name: 'work_session_id', nullable: true })
  workSessionId: number | null; // 关联的工作班次ID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
