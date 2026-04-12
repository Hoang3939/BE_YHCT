import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { EbooksService } from './ebooks.service';

@Controller()
export class EbooksController {
  constructor(private readonly ebooksService: EbooksService) {}

  @Get('ebooks')
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const data = await this.ebooksService.findAll({ search, category });
    return { success: true, data };
  }

  @Get('ebooks/:id')
  async findOne(@Param('id') id: string) {
    const data = await this.ebooksService.findOne(id);
    return { success: true, data };
  }

  @Get('ebooks/:id/read-url')
  async getReadUrl(@Param('id') id: string) {
    const data = await this.ebooksService.getReadUrl(id);
    return { success: true, data };
  }

  @Post('ebooks')
  @UseInterceptors(FileInterceptor('pdfFile'))
  async create(@Body() createDto: CreateEbookDto, @UploadedFile() pdfFile: Express.Multer.File) {
    const data = await this.ebooksService.create(createDto, pdfFile);
    return {
      success: true,
      message: 'Ebook created and pipeline initialized with pending_approval.',
      data,
    };
  }

  @Patch('pipelines/:id/trigger')
  @HttpCode(HttpStatus.OK)
  async trigger(@Param('id') pipelineId: string) {
    const data = await this.ebooksService.markPipelinePending(pipelineId);
    return {
      success: true,
      message: 'Pipeline status updated to pending.',
      data,
    };
  }
}

