import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Repository } from 'typeorm';
import { AddContributionAssetDto } from './dto/add-contribution-asset.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ReviewContributionDto } from './dto/review-contribution.dto';
import { Account } from './entities/account.entity';
import { ContributionAsset } from './entities/contribution-asset.entity';
import { Expert } from './entities/expert.entity';
import { KnowledgeContribution } from './entities/knowledge-contribution.entity';
import { UserProfile } from './entities/user-profile.entity';

interface ContributionRecipient {
  email: string;
  fullName: string;
}

@Injectable()
export class ContributionsService {
  private readonly logger = new Logger(ContributionsService.name);
  private readonly transporter: Transporter;
  private readonly frontendUrl: string;
  private readonly pipelineServiceUrl: string;

  constructor(
    @InjectRepository(KnowledgeContribution)
    private readonly contributionRepo: Repository<KnowledgeContribution>,
    @InjectRepository(ContributionAsset)
    private readonly contributionAssetRepo: Repository<ContributionAsset>,
    @InjectRepository(Expert)
    private readonly expertRepo: Repository<Expert>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
  ) {
    this.frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    this.pipelineServiceUrl = process.env.PIPELINE_SERVICE_URL ?? 'http://localhost:3006';
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: String(process.env.SMTP_SECURE ?? 'true') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async create(
    userId: string,
    dto: CreateContributionDto,
  ): Promise<KnowledgeContribution> {
    const contribution = this.contributionRepo.create({
      userId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      contributionType: dto.contributionType,
      status: 'pending',
      filePath: dto.filePath?.trim() || null,
      reference: dto.reference?.trim() || null,
      feedback: null,
      reviewedAt: null,
      reviewerId: null,
    });

    const savedContribution = await this.contributionRepo.save(contribution);
    const recipient = await this.getContributionRecipient(savedContribution.userId);
    await this.sendContributionReceiptEmail(recipient, savedContribution);

    return savedContribution;
  }

  async findAll(filters?: { status?: string }): Promise<KnowledgeContribution[]> {
    const query = this.contributionRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.assets', 'asset')
      .orderBy('c.createdAt', 'DESC')
      .addOrderBy('asset.createdAt', 'ASC');

    if (filters?.status) {
      query.andWhere('c.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<KnowledgeContribution> {
    const contribution = await this.contributionRepo.findOne({
      where: { contributionId: id },
      relations: { assets: true },
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution ${id} not found`);
    }

    return contribution;
  }

  async addAsset(
    contributionId: string,
    dto: AddContributionAssetDto,
  ): Promise<ContributionAsset> {
    const contribution = await this.findOne(contributionId);

    const asset = this.contributionAssetRepo.create({
      contributionId: contribution.contributionId,
      originalFileName: dto.originalFileName.trim(),
      storedFilePath: dto.storedFilePath.trim(),
      mimeType: dto.mimeType.trim(),
      fileSize: String(dto.fileSize),
      checksum: dto.checksum?.trim() || null,
      assetType: dto.assetType,
    });

    return this.contributionAssetRepo.save(asset);
  }

  async review(
    id: string,
    reviewerAccountId: string,
    dto: ReviewContributionDto,
  ): Promise<KnowledgeContribution> {
    const contribution = await this.findOne(id);
    const expert = await this.expertRepo.findOne({
      where: { accountId: reviewerAccountId },
    });

    if (!expert) {
      throw new ForbiddenException('Expert profile not found for reviewer account');
    }

    if (dto.status === 'approved' && contribution.assets.length === 0) {
      throw new BadRequestException('Cannot approve contribution without at least one asset');
    }

    const normalizedFeedback = dto.feedback?.trim();
    if (dto.status === 'rejected' && !normalizedFeedback) {
      throw new BadRequestException('Reject decision requires a review reason');
    }

    contribution.status = dto.status;
    contribution.feedback = normalizedFeedback || null;
    contribution.reviewerId = expert.expertId;
    contribution.reviewedAt = new Date();

    const savedContribution = await this.contributionRepo.save(contribution);
    const recipient = await this.getContributionRecipient(savedContribution.userId);

    if (savedContribution.status === 'approved') {
      await this.queueApprovedContribution(savedContribution);
      await this.sendContributionApprovedEmail(recipient, savedContribution);
    } else {
      await this.sendContributionRejectedEmail(
        recipient,
        savedContribution,
        normalizedFeedback ?? 'Không có lý do được cung cấp.',
      );
    }

    return savedContribution;
  }

  private async queueApprovedContribution(contribution: KnowledgeContribution): Promise<void> {
    const response = await fetch(
      `${this.pipelineServiceUrl}/pipelines/contributions/${contribution.contributionId}/queue`,
      {
        method: 'POST',
      },
    );

    const payload = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    };

    if (!response.ok) {
      const message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message || 'Failed to queue approved contribution for pipeline.';
      throw new BadRequestException(message);
    }
  }

  private async getContributionRecipient(userId: string): Promise<ContributionRecipient> {
    const profile = await this.userProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(`User profile for contribution owner ${userId} not found`);
    }

    const account = await this.accountRepo.findOne({
      where: { accountId: profile.accountId },
    });
    if (!account) {
      throw new NotFoundException(`Account for contribution owner ${userId} not found`);
    }

    return {
      email: account.email,
      fullName: profile.fullName?.trim() || 'Người đóng góp',
    };
  }

  private async sendContributionReceiptEmail(
    recipient: ContributionRecipient,
    contribution: KnowledgeContribution,
  ): Promise<void> {
    const subject = 'YHCT - Biên nhận đóng góp tài liệu';
    const html = this.buildEmailLayout({
      heading: 'Đã tiếp nhận đóng góp của bạn',
      intro: `Cảm ơn ${recipient.fullName} đã gửi tài liệu cho hệ thống YHCT. Hồ sơ đóng góp của bạn đã được tiếp nhận và đang chờ chuyên gia thẩm định.`,
      body: [
        `Mã hồ sơ: <strong>${contribution.contributionId}</strong>`,
        `Tiêu đề tài liệu: <strong>${contribution.title}</strong>`,
        `Loại đóng góp: <strong>${contribution.contributionType}</strong>`,
        `Trạng thái hiện tại: <strong>Chờ duyệt</strong>`,
      ],
      outro:
        'Khi chuyên gia hoàn tất thẩm định, hệ thống sẽ tiếp tục gửi email thông báo kết quả đến bạn.',
    });

    await this.sendEmail(recipient.email, subject, html, [
      `Da tiep nhan dong gop tai lieu cho ho so ${contribution.contributionId}.`,
      `Tieu de: ${contribution.title}`,
      'Trang thai: Cho duyet',
    ].join('\n'));
  }

  private async sendContributionApprovedEmail(
    recipient: ContributionRecipient,
    contribution: KnowledgeContribution,
  ): Promise<void> {
    const subject = 'YHCT - Tài liệu đóng góp đã được chấp thuận';
    const html = this.buildEmailLayout({
      heading: 'Tài liệu của bạn đã được chấp thuận',
      intro: `Xin chúc mừng ${recipient.fullName}. Chuyên gia đã xác minh và chấp thuận tài liệu bạn đóng góp cho hệ thống YHCT.`,
      body: [
        `Mã hồ sơ: <strong>${contribution.contributionId}</strong>`,
        `Tiêu đề tài liệu: <strong>${contribution.title}</strong>`,
        `Kết quả thẩm định: <strong>Đã chấp thuận</strong>`,
      ],
      outro:
        'Tài liệu sẽ được chuyển sang các bước số hóa và tích hợp tri thức theo quy trình của hệ thống.',
    });

    await this.sendEmail(recipient.email, subject, html, [
      `Ho so ${contribution.contributionId} da duoc chap thuan.`,
      `Tieu de: ${contribution.title}`,
    ].join('\n'));
  }

  private async sendContributionRejectedEmail(
    recipient: ContributionRecipient,
    contribution: KnowledgeContribution,
    reason: string,
  ): Promise<void> {
    const subject = 'YHCT - Tài liệu đóng góp chưa được chấp thuận';
    const html = this.buildEmailLayout({
      heading: 'Tài liệu đóng góp chưa được chấp thuận',
      intro: `Cảm ơn ${recipient.fullName} đã gửi tài liệu đến hệ thống YHCT. Sau khi thẩm định, chuyên gia chưa thể chấp thuận hồ sơ này ở thời điểm hiện tại.`,
      body: [
        `Mã hồ sơ: <strong>${contribution.contributionId}</strong>`,
        `Tiêu đề tài liệu: <strong>${contribution.title}</strong>`,
        `Kết quả thẩm định: <strong>Từ chối</strong>`,
        `Lý do chuyên gia cung cấp:<br/><div style="margin-top:8px;padding:12px;border-radius:8px;background:#fff4f4;color:#7a1f1f;border:1px solid #fecaca">${this.escapeHtml(reason)}</div>`,
      ],
      outro:
        'Bạn có thể cập nhật lại tài liệu hoặc chuẩn bị bộ tài liệu khác đầy đủ hơn rồi gửi lại trong lần tiếp theo.',
    });

    await this.sendEmail(recipient.email, subject, html, [
      `Ho so ${contribution.contributionId} chua duoc chap thuan.`,
      `Tieu de: ${contribution.title}`,
      `Ly do: ${reason}`,
    ].join('\n'));
  }

  private buildEmailLayout(input: {
    heading: string;
    intro: string;
    body: string[];
    outro: string;
  }): string {
    const sections = input.body.map((item) => `<li style="margin-bottom:10px">${item}</li>`).join('');

    return `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f8faf9;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#7de0b0;margin-right:8px"></span>
          <span style="font-size:14px;color:#6b7c70;letter-spacing:0.15em">YHCT</span>
        </div>
        <h1 style="font-size:22px;color:#1b1f1c;text-align:center;margin:0 0 16px">${input.heading}</h1>
        <p style="font-size:14px;color:#4a5a50;text-align:center;margin:0 0 24px;line-height:1.6">
          ${input.intro}
        </p>
        <div style="padding:18px;border-radius:10px;background:#ffffff;border:1px solid #e5ece7;margin-bottom:20px">
          <ul style="padding-left:18px;margin:0;font-size:14px;color:#33423a;line-height:1.6">
            ${sections}
          </ul>
        </div>
        <p style="font-size:13px;color:#5b6a61;line-height:1.6;margin:0 0 20px">
          ${input.outro}
        </p>
        <div style="text-align:center">
          <a href="${this.frontendUrl}/chat" style="display:inline-block;padding:12px 24px;background:#1b1f1c;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
            Truy cập hệ thống YHCT
          </a>
        </div>
      </div>
    `;
  }

  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? '';

    try {
      await this.transporter.sendMail({
        to,
        from,
        subject,
        html,
        text,
      });
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : 'Unknown SMTP error';
      this.logger.warn(`Skipping contribution email delivery to ${to}: ${reason}`);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
