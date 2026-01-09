import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Procurement } from './procurement.entity';

@Entity('procurement_categories')
export class ProcurementCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // 分类名称：各项食材费用、建店物料费用、开店杂费

  @Column({ length: 50, nullable: true })
  color: string; // 分类颜色标签（用于前端显示）

  @OneToMany(() => Procurement, (procurement) => procurement.category)
  procurements: Procurement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
