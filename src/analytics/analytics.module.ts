//Configures the analytics module by integrating finance data, caching,
//and exposing optimized services and controllers for scalable analytics processing.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Finance } from '../finance/finance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finance]),
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}