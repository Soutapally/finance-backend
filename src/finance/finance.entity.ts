//Represents the financial data model with structured fields, relationships,
 //and indexing for efficient storage, querying, and scalability.
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum FinanceType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum FinanceCategory {
  SALARY = 'salary',
  FREELANCE = 'freelance',
  INVESTMENT = 'investment',
  FOOD = 'food',
  TRANSPORT = 'transport',
  UTILITIES = 'utilities',
  RENT = 'rent',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

@Entity('finances')
@Index(['userId', 'date'])
@Index(['userId', 'type'])
@Index(['userId', 'category'])
export class Finance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: FinanceType,
  })
  type!: FinanceType;

  @Column({
    type: 'enum',
    enum: FinanceCategory,
  })
  category!: FinanceCategory;

  @Column()
  date!: Date;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  receiptUrl!: string;

  @Column({ default: false })
  isRecurring!: boolean;

  @Column({ nullable: true })
  recurringInterval!: string;

  @ManyToOne(() => User, (user) => user.finances, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}