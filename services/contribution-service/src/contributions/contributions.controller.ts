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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddContributionAssetDto } from './dto/add-contribution-asset.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ReviewContributionDto } from './dto/review-contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContributionsService } from './contributions.service';

@UseGuards(JwtAuthGuard)
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) { }

  @Post()
  async create(
    @Body() dto: CreateContributionDto,
    @Req() req?: { user?: { userId?: string; role?: string } },
  ) {
    const userId = req?.user?.userId;
    console.log('[DEBUG] POST /contributions - userId:', userId, 'req.user:', req?.user);
    if (!userId) {
      console.log('[DEBUG] Missing userId in request');
      throw new UnauthorizedException('Missing user context');
    }

    try {
      const data = await this.contributionsService.create(userId, dto);
      console.log('[DEBUG] Contribution created:', data.contributionId);
      return {
        success: true,
        message: 'Đã tạo hồ sơ đóng góp tài liệu.',
        data,
      };
    } catch (error) {
      console.error('[ERROR] Failed to create contribution:', error);
      throw error;
    }
  }

  @Post(':id/assets')
  @UseInterceptors(FileInterceptor('file'))
  async addAsset(
    @Param('id') id: string,
    @Body() dto: AddContributionAssetDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req?: { user?: { userId?: string; role?: string } },
  ) {
    const userId = req?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Missing user context');
    }

    const data = await this.contributionsService.addAsset(id, dto, file);
    return {
      success: true,
      message: 'Đã tải file và lưu asset đóng góp.',
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

  @Get('assets/:assetId/download-url')
  async getAssetDownloadUrl(
    @Param('assetId') assetId: string,
    @Req() req?: { user?: { role?: string } },
  ) {
    const role = req?.user?.role;
    if (role && role !== 'admin' && role !== 'expert') {
      throw new ForbiddenException('Only admin or expert can access asset download URLs');
    }
    const data = await this.contributionsService.getAssetDownloadUrl(assetId);
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
