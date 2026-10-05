import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ManageKnowledgeBaseUseCase } from '../../application/use-cases/manage-knowledge-base.use-case';
import { CreateKnowledgeArticleDto } from '../../application/dtos/helpdesk.dto';

@Controller('api/v1/helpdesk/knowledge-base')
export class HelpdeskKnowledgeController {
  constructor(private readonly knowledgeUseCase: ManageKnowledgeBaseUseCase) {}

  @Get()
  async getArticles(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.knowledgeUseCase.findAllArticles(category, search);
    return {
      success: true,
      message: 'Artículos de la base de conocimientos recuperados',
      data,
    };
  }

  @Get(':id')
  async getArticleById(@Param('id') id: string) {
    const data = await this.knowledgeUseCase.findArticleById(id);
    return {
      success: true,
      message: 'Artículo obtenido exitosamente',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createArticle(@Body() dto: CreateKnowledgeArticleDto) {
    const data = await this.knowledgeUseCase.createArticle(dto);
    return {
      success: true,
      message: 'Artículo publicado en la base de conocimientos',
      data,
    };
  }

  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  async markHelpful(@Param('id') id: string) {
    const data = await this.knowledgeUseCase.markHelpful(id);
    return {
      success: true,
      message: 'Voto de utilidad registrado',
      data,
    };
  }
}
