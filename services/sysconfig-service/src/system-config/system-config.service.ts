import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigEntity } from './entities/system-config.entity';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfigEntity)
    private readonly systemConfigRepository: Repository<SystemConfigEntity>,
  ) {}

  // CREATE
  async create(createDto: CreateSystemConfigDto): Promise<SystemConfigEntity> {
    const existing = await this.systemConfigRepository.findOne({
      where: { configKey: createDto.configKey },
    });

    if (existing) {
      throw new BadRequestException(`Config key "${createDto.configKey}" already exists`);
    }

    const config = this.systemConfigRepository.create(createDto);
    return await this.systemConfigRepository.save(config);
  }

  // READ ALL
  async findAll(): Promise<SystemConfigEntity[]> {
    return await this.systemConfigRepository.find({
      order: { configKey: 'ASC' },
    });
  }

  // READ ONE
  async findById(id: number): Promise<SystemConfigEntity> {
    const config = await this.systemConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`System config with id ${id} not found`);
    }

    return config;
  }

  // READ BY KEY
  async findByKey(configKey: string): Promise<SystemConfigEntity> {
    const config = await this.systemConfigRepository.findOne({
      where: { configKey },
    });

    if (!config) {
      throw new NotFoundException(`System config with key "${configKey}" not found`);
    }

    return config;
  }

  // UPDATE
  async update(id: number, updateDto: UpdateSystemConfigDto): Promise<SystemConfigEntity> {
    const config = await this.findById(id);

    if (!config.isEditable) {
      throw new BadRequestException(`Config "${config.configKey}" is not editable`);
    }

    Object.assign(config, updateDto);
    config.lastModifiedDate = new Date();

    return await this.systemConfigRepository.save(config);
  }

  // DELETE
  async delete(id: number): Promise<void> {
    const config = await this.findById(id);
    await this.systemConfigRepository.remove(config);
  }

  // GET CONFIG VALUE (Helper)
  async getConfigValue(configKey: string): Promise<string> {
    const config = await this.findByKey(configKey);
    return config.configValue;
  }
}
