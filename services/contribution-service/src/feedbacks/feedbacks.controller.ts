import { Controller, ForbiddenException, Get, Req } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';

/**
 * Feedbacks Controller — admin-only mock endpoint.
 * GET /feedbacks returns static mock data.
 */
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get()
  findAll(@Req() req?: { user?: { role?: string } }) {
    const role = req?.user?.role;
    if (role && role !== 'admin') {
      throw new ForbiddenException('Only admin can view feedbacks');
    }

    const data = this.feedbacksService.findAll();
    return { success: true, data };
  }
}
