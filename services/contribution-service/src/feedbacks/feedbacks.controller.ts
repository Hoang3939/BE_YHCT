import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  async create(
    @Body() dto: CreateFeedbackDto,
    @Req() req?: { user?: { accountId?: string } },
  ) {
    const data = await this.feedbacksService.create(dto, req?.user?.accountId);

    return {
      success: true,
      message: 'Cảm ơn bạn đã góp ý. Chúng tôi đã ghi nhận phản hồi của bạn.',
      data,
    };
  }

  @Get()
  async findAll(@Req() req?: { user?: { role?: string } }) {
    const role = req?.user?.role;
    if (role && role !== 'admin') {
      throw new ForbiddenException('Only admin can view feedbacks');
    }

    const data = await this.feedbacksService.findAll();
    return { success: true, data };
  }
}
