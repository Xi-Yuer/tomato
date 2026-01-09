import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProcurementCategory } from './procurement-category.entity';

@Entity('procurements')
export class Procurement {
  @PrimaryGeneratedColumn()
  id: number; // 采购单号（自增ID）

  @ManyToOne(() => ProcurementCategory, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: ProcurementCategory; // 采购分类

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ length: 200 })
  itemName: string; // 物品名称

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number; // 采购数量

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number; // 单价

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number; // 总价（quantity * unitPrice）

  @Column({ type: 'date', name: 'procurement_date' })
  procurementDate: Date; // 采购时间

  @Column({ type: 'text', nullable: true, name: 'payment_screenshot' })
  paymentScreenshot: string | null; // 付款截图URL

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
