import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 11, unique: true })
  phone: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 200, nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  avatar: string; // 用户头像URL

  @Column({ default: false })
  isAdmin: boolean; // 是否是管理员

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
