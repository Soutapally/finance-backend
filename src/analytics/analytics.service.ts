//Implements core business logic for financial analytics, including summaries,
 //trends, and category insights.

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finance, FinanceType } from '../finance/finance.entity';
import { DateRangeDto } from './dto/date-range.dto';
import { Role } from 'src/user/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Finance)
    private financeRepo: Repository<Finance>,
  ) {}

  private applyRoleFilter(queryBuilder) {
    
  }


  async getSummary(userId: string, role: Role, dateRange?: DateRangeDto) {
    const queryBuilder = this.financeRepo.createQueryBuilder('finance');

    const result = await queryBuilder
      .select('finance.type', 'type')
      .addSelect('SUM(finance.amount)', 'total')
      .addSelect('COUNT(finance.id)', 'count')
      .groupBy('finance.type')
      .getRawMany();

    let income = 0;
    let expense = 0;

    result.forEach((row) => {
      if (row.type === FinanceType.INCOME) income = Number(row.total);
      if (row.type === FinanceType.EXPENSE) expense = Number(row.total);
    });

    return {
      summary: {
        totalIncome: income,
        totalExpense: expense,
        netBalance: income - expense,
      },
    };
  }

  // CATEGORY
  async getCategoryBreakdown(
    userId: string,
    role: Role,
    type?: FinanceType,
    dateRange?: DateRangeDto,
  ) {
    const queryBuilder = this.financeRepo.createQueryBuilder('finance');

    if (type) {
      queryBuilder.andWhere('finance.type = :type', { type });
    }

    return queryBuilder
      .select('finance.category', 'category')
      .addSelect('SUM(finance.amount)', 'total')
      .groupBy('finance.category')
      .getRawMany();
  }

  // MONTHLY TRENDS
  async getMonthlyTrends(userId: string, role: Role, year: number) {
    const queryBuilder = this.financeRepo.createQueryBuilder('finance');

    return queryBuilder
      .select("TO_CHAR(finance.date, 'YYYY-MM')", 'month')
      .addSelect('SUM(finance.amount)', 'total')
      .groupBy('month')
      .getRawMany();
  }

  // DAILY PATTERNS
  async getDailyPatterns(userId: string, role: Role, days: number = 30) {
    const queryBuilder = this.financeRepo.createQueryBuilder('finance');

    return queryBuilder
      .select("TO_CHAR(finance.date, 'YYYY-MM-DD')", 'day')
      .addSelect('SUM(finance.amount)', 'total')
      .groupBy('day')
      .getRawMany();
  }

  // TOP CATEGORIES
  async getTopSpendingCategories(userId: string, role: Role, limit: number = 5) {
    const queryBuilder = this.financeRepo.createQueryBuilder('finance');

    return queryBuilder
      .select('finance.category', 'category')
      .addSelect('SUM(finance.amount)', 'total')
      .groupBy('finance.category')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // YEAR OVER YEAR
  async getYearOverYearComparison(userId: string, role: Role) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const currentYearData = await this.getMonthlyTrends(userId, role, currentYear);
    const lastYearData = await this.getMonthlyTrends(userId, role, lastYear);

    return {
      currentYear,
      lastYear,
      currentYearData,
      lastYearData,
    };
  }


  async exportAnalytics(userId: string, format: 'json' | 'csv' = 'json') {
    const [summary, categories, trends] = await Promise.all([
      this.getSummary(userId, Role.ADMIN),
      this.getCategoryBreakdown(userId, Role.ADMIN),
      this.getMonthlyTrends(userId, Role.ADMIN, new Date().getFullYear()),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      userId,
      summary,
      categories,
      trends,
    };
  }
}