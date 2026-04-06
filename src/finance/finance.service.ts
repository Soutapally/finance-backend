//Implements comprehensive financial business logic including transaction management,
//advanced analytics, and summary generation for data-driven financial insights.
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import { Finance, FinanceType } from './finance.entity';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { QueryFinanceDto } from './dto/query-finance.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Finance)
    private financeRepo: Repository<Finance>,
  ) {}

  async create(dto: CreateFinanceDto, userId: string): Promise<Finance> {
    const finance = this.financeRepo.create({
      ...dto,
      date: dto.date ? new Date(dto.date) : new Date(),
    });

    const saved = await this.financeRepo.save(finance);
    return saved;
  }


  async findAll(queryDto: QueryFinanceDto) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      type,
      category,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Finance> = {};

    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.date = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.date = LessThanOrEqual(new Date(endDate));
    }

    if (type) where.type = type;
    if (category) where.category = category;

    const [data, total] = await this.financeRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    const summary = this.calculateSummary(data);

    return { data, total, summary };
  }

  
  async findOne(id: string): Promise<Finance> {
    const finance = await this.financeRepo.findOne({
      where: { id },
    });

    if (!finance) throw new NotFoundException('Finance record not found');
    return finance;
  }

 
  async update(id: string, dto: UpdateFinanceDto): Promise<Finance> {
    const finance = await this.findOne(id);

    Object.assign(finance, dto);

    if (dto.date) {
      finance.date = new Date(dto.date);
    }

    const updated = await this.financeRepo.save(finance);
    return updated;
  }

  
  async remove(id: string): Promise<{ message: string }> {
    const finance = await this.findOne(id);

    await this.financeRepo.remove(finance);

    return { message: 'Finance record deleted successfully' };
  }


  async getDashboardSummary(dto: DashboardSummaryDto): Promise<any> {
    const { startDate, endDate } = dto;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const end = endDate ? new Date(endDate) : new Date();

    const finances = await this.financeRepo.find({
      where: {
        date: Between(start, end),
      },
    });

    const totalIncome = finances
      .filter((f) => f.type === FinanceType.INCOME)
      .reduce((sum, f) => sum + f.amount, 0);

    const totalExpenses = finances
      .filter((f) => f.type === FinanceType.EXPENSE)
      .reduce((sum, f) => sum + f.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    // Category wise totals
    const categoryTotals = finances.reduce((acc, finance) => {
      if (!acc[finance.category]) {
        acc[finance.category] = { income: 0, expense: 0 };
      }

      if (finance.type === FinanceType.INCOME) {
        acc[finance.category].income += finance.amount;
      } else {
        acc[finance.category].expense += finance.amount;
      }

      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Monthly trends
    const monthlyTrends = finances.reduce((acc, finance) => {
      const month = finance.date.toISOString().slice(0, 7);

      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0, count: 0 };
      }

      if (finance.type === FinanceType.INCOME) {
        acc[month].income += finance.amount;
      } else {
        acc[month].expense += finance.amount;
      }

      acc[month].count++;

      return acc;
    }, {} as Record<string, { income: number; expense: number; count: number }>);

    // Recent transactions
    const recentTransactions = finances
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return {
      period: { startDate: start, endDate: end },
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        savingsRate:
          totalIncome > 0
            ? Number(((netBalance / totalIncome) * 100).toFixed(2))
            : 0,
        transactionCount: finances.length,
      },
      categoryTotals,
      monthlyTrends: Object.entries(monthlyTrends).map(
        ([month, data]) => ({
          month,
          ...data,
          net: data.income - data.expense,
        }),
      ),
      recentTransactions,
    };
  }

  
  async getAnalytics(): Promise<any> {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const finances = await this.financeRepo.find({
      where: {
        date: MoreThanOrEqual(startOfYear),
      },
    });

    const totalExpenseForYear = finances
      .filter((f) => f.type === FinanceType.EXPENSE)
      .reduce((sum, f) => sum + f.amount, 0);

    const expenseByCategory = finances
      .filter((f) => f.type === FinanceType.EXPENSE)
      .reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + f.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategories = Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, total]) => ({ category, total }));

    const daysPassed = Math.ceil(
      (new Date().getTime() - startOfYear.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const averageDailySpending =
      daysPassed > 0 ? totalExpenseForYear / daysPassed : 0;

    const biggestTransactions = finances
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return {
      year: currentYear,
      topExpenseCategories,
      averageDailySpending: Number(averageDailySpending.toFixed(2)),
      biggestTransactions,
      totalTransactions: finances.length,
      totalIncome: finances
        .filter((f) => f.type === FinanceType.INCOME)
        .reduce((sum, f) => sum + f.amount, 0),
      totalExpense: totalExpenseForYear,
    };
  }

  
  private calculateSummary(finances: Finance[]): any {
    const totalIncome = finances
      .filter((f) => f.type === FinanceType.INCOME)
      .reduce((s, f) => s + f.amount, 0);

    const totalExpenses = finances
      .filter((f) => f.type === FinanceType.EXPENSE)
      .reduce((s, f) => s + f.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      count: finances.length,
    };
  }
}