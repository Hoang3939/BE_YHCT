import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { SystemConfigService } from './system-config.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@ApiTags('System Config')
@ApiBearerAuth('BearerAuth')
@Controller('api/admin/system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Post()
  @ApiBody({
    description: 'Create a new configuration entry. Required fields are configKey and configValue.',
    schema: {
      type: 'object',
      required: ['configKey', 'configValue'],
      properties: {
        configKey: {
          type: 'string',
          description: 'Unique config key.',
          example: 'maintenance_mode',
        },
        configValue: {
          type: 'string',
          description: 'Stored value as string.',
          example: 'false',
        },
        configType: {
          type: 'string',
          description: 'Logical value type.',
          example: 'boolean',
        },
        description: {
          type: 'string',
          description: 'Meaning of this config for admins.',
          example: 'Enable or disable maintenance mode.',
        },
        isEditable: {
          type: 'boolean',
          description: 'Whether this config can be changed later.',
          example: true,
        },
        isActive: {
          type: 'boolean',
          description: 'Whether this config is active.',
          example: true,
        },
      },
      example: {
        configKey: 'maintenance_mode',
        configValue: 'false',
        configType: 'boolean',
        description: 'Enable or disable maintenance mode.',
        isEditable: true,
        isActive: true,
      },
    },
  })
  create(@Body() createDto: CreateSystemConfigDto) {
    return this.systemConfigService.create(createDto);
  }

  @Get()
  findAll() {
    return this.systemConfigService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.systemConfigService.findById(id);
  }

  @Get('key/:configKey')
  findByKey(@Param('configKey') configKey: string) {
    return this.systemConfigService.findByKey(configKey);
  }

  @Put(':id')
  @ApiBody({
    description: 'Update one or more fields of an existing config. All fields are optional.',
    schema: {
      type: 'object',
      properties: {
        configKey: {
          type: 'string',
          description: 'Updated config key if renaming is allowed.',
          example: 'max_users',
        },
        configValue: {
          type: 'string',
          description: 'Updated stored value as string.',
          example: '2000',
        },
        configType: {
          type: 'string',
          description: 'Updated logical value type.',
          example: 'number',
        },
        description: {
          type: 'string',
          description: 'Updated admin-facing description.',
          example: 'Increase maximum users limit.',
        },
        isEditable: {
          type: 'boolean',
          description: 'Whether this config remains editable.',
          example: true,
        },
        isActive: {
          type: 'boolean',
          description: 'Whether this config remains active.',
          example: true,
        },
        lastModifiedByAdminId: {
          type: 'string',
          format: 'uuid',
          description: 'Admin ID that performed the update.',
          example: '8b8d2ef0-b2ff-4f4f-9a4d-6feccb9e2111',
        },
      },
      example: {
        configKey: 'max_users',
        configValue: '2000',
        configType: 'number',
        description: 'Increase maximum users limit.',
        isEditable: true,
        isActive: true,
        lastModifiedByAdminId: '8b8d2ef0-b2ff-4f4f-9a4d-6feccb9e2111',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSystemConfigDto,
  ) {
    return this.systemConfigService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.systemConfigService.delete(id);
  }
}
