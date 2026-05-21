import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import {
  FeedbackCategory,
  FeedbackEntity,
  FeedbackSeverity,
  FeedbackStatus,
} from './entities/feedback.entity';

export interface FeedbackAuthor {
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
}

export interface FeedbackListItem {
  id: string;
  title: string;
  author: FeedbackAuthor;
  relatedEntity: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  upvotes: number;
  tags: string[];
}

export interface FeedbackSubmissionResult {
  feedbackId: string;
  status: FeedbackStatus;
  createdAt: string;
}

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: 'Báo lỗi',
  ux: 'Đề xuất',
  content: 'Chỉnh sửa',
  feature_request: 'Đề xuất',
  other: 'Câu hỏi',
};

const SEVERITY_LABELS: Record<FeedbackSeverity, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'Chờ duyệt',
  reviewing: 'Đang xem xét',
  resolved: 'Đã duyệt',
  closed: 'Từ chối',
};

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-orange-400',
  'bg-rose-500',
  'bg-indigo-500',
];

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
  ) { }

  async create(
    dto: CreateFeedbackDto,
    accountId?: string,
  ): Promise<FeedbackSubmissionResult> {
    const feedback = this.feedbackRepository.create({
      accountId: accountId ?? null,
      fullName: dto.fullName?.trim() || null,
      email: dto.email?.trim().toLowerCase() || null,
      category: dto.category,
      title: dto.title.trim(),
      content: dto.content.trim(),
      pageUrl: dto.pageUrl?.trim() || null,
      severity: dto.severity ?? null,
      status: 'new',
      handledByAdminId: null,
      resolutionNote: null,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    return {
      feedbackId: savedFeedback.feedbackId,
      status: savedFeedback.status,
      createdAt: savedFeedback.createdAt.toISOString(),
    };
  }

  async getStats(): Promise<{ total: number; pending: number; inProgress: number; resolved: number; rejected: number }> {
    const all = await this.feedbackRepository.find({ select: ['status'] });
    return {
      total: all.length,
      pending: all.filter(f => f.status === 'new').length,
      inProgress: all.filter(f => f.status === 'reviewing').length,
      resolved: all.filter(f => f.status === 'resolved').length,
      rejected: all.filter(f => f.status === 'closed').length,
    };
  }

  async findAll(): Promise<FeedbackListItem[]> {
    const feedbacks = await this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
    });

    return feedbacks.map((feedback, index) => this.toListItem(feedback, index));
  }

  private toListItem(
    feedback: FeedbackEntity,
    index: number,
  ): FeedbackListItem {
    const authorName = feedback.fullName?.trim() || feedback.email?.trim() || 'Người dùng ẩn danh';
    const initials = this.buildInitials(authorName);
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

    return {
      id: feedback.feedbackId,
      title: feedback.title,
      author: {
        name: authorName,
        initials,
        role: 'Người dùng',
        avatarColor,
      },
      relatedEntity: feedback.pageUrl || 'Hệ thống YHCT',
      type: CATEGORY_LABELS[feedback.category],
      priority: feedback.severity ? SEVERITY_LABELS[feedback.severity] : 'Trung bình',
      status: STATUS_LABELS[feedback.status],
      createdAt: feedback.createdAt.toISOString(),
      upvotes: 0,
      tags: this.buildTags(feedback),
    };
  }

  private buildInitials(name: string): string {
    const words = name
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);

    if (words.length === 0) {
      return 'ND';
    }

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }

  private buildTags(feedback: FeedbackEntity): string[] {
    const tags = [`#${feedback.category}`];

    if (feedback.severity) {
      tags.push(`#${feedback.severity}`);
    }

    if (feedback.pageUrl) {
      tags.push(`#${feedback.pageUrl.replace(/[^a-zA-Z0-9]+/g, '_')}`);
    }

    return tags;
  }
}
