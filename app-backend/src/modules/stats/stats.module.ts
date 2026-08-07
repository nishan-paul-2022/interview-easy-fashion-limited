import { Module } from '@nestjs/common';
import { StatsController } from '@/modules/stats/stats.controller';
import { StatsService } from '@/modules/stats/stats.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
