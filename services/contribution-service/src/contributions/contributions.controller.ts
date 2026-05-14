import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AddContributionAssetDto } from './dto/add-contribution-asset.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ReviewContributionDto } from './dto/review-contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContributionsService } from './contributions.service';

@UseGuards(JwtAuthGuard)
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  async create(
    @Body() dto: CreateContributionDto,
    @Req() req?: { user?: { userId?: string; role?: string } },
  ) {
    const userId = req?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Missing user context');
    }

    const data = await this.contributionsService.create(userId, dto);
    return {
      success: true,
      message: 'Đã tạo hồ sơ đóng góp tài liệu.',
      data,
    };
  }

  @Post(':id/assets')
  async addAsset(
    @Param('id') id: string,
    @Body() dto: AddContributionAssetDto,
    @Req() req?: { user?: { userId?: string; role?: string } },
  ) {
    const userId = req?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Missing user context');
    }

    const data = await this.contributionsService.addAsset(id, dto);
    return {
      success: true,
      message: 'Đã lưu metadata tài liệu đóng góp.',
      data,
    };
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Req() req?: { user?: { role?: string } },
  ) {
    const role = req?.user?.role;
    if (role && role !== 'admin' && role !== 'expert') {
      throw new ForbiddenException('Only admin or expert can view contributions');
    }

    const data = await this.contributionsService.findAll({ status });
    return { success: true, data };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req?: { user?: { role?: string } },
  ) {
    const role = req?.user?.role;
    if (role && role !== 'admin' && role !== 'expert') {
      throw new ForbiddenException('Only admin or expert can view contributions');
    }

    const data = await this.contributionsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewContributionDto,
    @Req() req: { user?: { accountId?: string; role?: string } },
  ) {
    const role = req?.user?.role;
    if (role !== 'expert') {
      throw new ForbiddenException('Only expert can review contributions');
    }

    const reviewerId = req.user?.accountId ?? '';
    const data = await this.contributionsService.review(id, reviewerId, dto);
    return {
      success: true,
      message: `Contribution ${dto.status} successfully`,
      data,
    };
  }
}
