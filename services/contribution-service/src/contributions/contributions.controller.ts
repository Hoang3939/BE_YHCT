import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ReviewContributionDto } from './dto/review-contribution.dto';

/**
 * Contributions Controller
 *
 * Role-based access:
 *   - GET /contributions        → admin, expert
 *   - GET /contributions/:id    → admin, expert
 *   - PATCH /contributions/:id/review → expert only
 *
 * NOTE: In production, roles should be enforced via RolesGuard + @Roles() decorator
 * from auth-service. For now, we check req.user.role manually since this service
 * may not share the same auth module. The API Gateway / auth middleware is expected
 * to attach `req.user` with `{ accountId, role }`.
 */
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

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
