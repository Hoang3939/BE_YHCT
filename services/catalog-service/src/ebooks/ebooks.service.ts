import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createClient } from '@supabase/supabase-js';
import { Repository } from 'typeorm';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { Ebook } from './entities/ebook.entity';
import { DataPipeline } from '../pipelines/entities/data-pipeline.entity';

@Injectable()
export class EbooksService {
  private readonly supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  constructor(
    @InjectRepository(Ebook)
    private readonly ebookRepository: Repository<Ebook>,
    @InjectRepository(DataPipeline)
    private readonly pipelineRepository: Repository<DataPipeline>,
  ) {}

  async create(createDto: CreateEbookDto, pdfFile: Express.Multer.File) {
    if (!pdfFile) {
      throw new InternalServerErrorException('PDF file is required.');
    }

    const storagePath = await this.uploadPdfToSecureBucket(pdfFile);

    const ebook = this.ebookRepository.create({
      title: createDto.title,
      author: createDto.author?.trim() || null,
      category: createDto.category?.trim() || null,
      description: createDto.description?.trim() || null,
      coverImage: createDto.coverImage,
      storagePath,
      totalChunks: 0,
      isPublished: false,
    });

    const savedEbook = await this.ebookRepository.save(ebook);

    const pipeline = this.pipelineRepository.create({
      ebookId: savedEbook.id,
      processingType: 'full_pipeline',
      status: 'pending_approval',
    });

    await this.pipelineRepository.save(pipeline);

    return {
      ebookId: savedEbook.id,
      pipelineId: pipeline.id,
      status: pipeline.status,
    };
  }

  async findAll(filters?: { search?: string; category?: string }) {
    const query = this.ebookRepository
      .createQueryBuilder('ebook')
      .leftJoinAndSelect('ebook.pipelines', 'pipeline')
      .orderBy('ebook.createdAt', 'DESC');

    // Search filter (title or author)
    if (filters?.search) {
      query.andWhere(
        '(ebook.title LIKE :search OR ebook.author LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Category filter
    if (filters?.category) {
      query.andWhere('ebook.category = :category', { category: filters.category });
    }

    const rows = await query.getMany();

    return rows.map((book) => {
      const sortedPipelines = [...(book.pipelines ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const latest = sortedPipelines[0] ?? null;

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        description: book.description,
        coverImage: book.coverImage,
        totalChunks: book.totalChunks,
        isPublished: book.isPublished,
        viewCount: book.viewCount,
        createdAt: book.createdAt,
        latestPipelineStatus: latest?.status ?? null,
        latestPipelineId: latest?.id ?? null,
      };
    });
  }

  async findOne(id: string) {
    const book = await this.ebookRepository.findOne({
      where: { id },
      relations: ['pipelines'],
    });
    if (!book) throw new NotFoundException('Ebook not found.');

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      coverImage: book.coverImage,
      storagePath: book.storagePath,
      totalChunks: book.totalChunks,
      isPublished: book.isPublished,
      viewCount: book.viewCount,
      downloadCount: book.downloadCount,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async getReadUrl(id: string) {
    const book = await this.ebookRepository.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Ebook not found.');
    if (!book.storagePath) throw new NotFoundException('EPUB file not available yet.');

    // Increment view count
    book.viewCount = (book.viewCount || 0) + 1;
    await this.ebookRepository.save(book);

    // Generate signed URL (valid for 1 hour)
    const { data, error } = await this.supabase.storage
      .from('secure-documents')
      .createSignedUrl(book.storagePath, 3600);

    if (error || !data?.signedUrl) {
      throw new InternalServerErrorException(`Failed to generate read URL: ${error?.message}`);
    }

    return {
      signedUrl: data.signedUrl,
      title: book.title,
      author: book.author,
      expiresIn: 3600,
    };
  }

  async markPipelinePending(pipelineId: string) {
    const pipeline = await this.pipelineRepository.findOne({ where: { id: pipelineId } });
    if (!pipeline) throw new NotFoundException('Pipeline not found.');

    pipeline.status = 'pending';
    await this.pipelineRepository.save(pipeline);

    return {
      pipelineId: pipeline.id,
      status: pipeline.status,
    };
  }

  private async uploadPdfToSecureBucket(pdfFile: Express.Multer.File) {
    const fileExt = pdfFile.originalname.split('.').pop() ?? 'pdf';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const objectPath = `ebooks/${fileName}`;

    const { error } = await this.supabase.storage
      .from('secure-documents')
      .upload(objectPath, pdfFile.buffer, {
        contentType: pdfFile.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(`Supabase upload failed: ${error.message}`);
    }

    return objectPath;
  }
}
