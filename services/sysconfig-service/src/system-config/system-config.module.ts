import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigEntity } from './entities/system-config.entity';
import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfigEntity])],
  providers: [SystemConfigService],
  controllers: [SystemConfigController],
  exports: [SystemConfigService], // Export để các service khác dùng
})
export class SystemConfigModule {}
