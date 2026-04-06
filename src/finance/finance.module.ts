//Configures the finance module by integrating data models, services, and controllers,
//enabling structured and scalable financial operations within the application.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Finance } from './finance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Finance])],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}