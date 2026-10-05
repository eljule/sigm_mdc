import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeArticleTypeOrmEntity } from '../../infrastructure/persistence/entities/knowledge-article.typeorm.entity';
import { CreateKnowledgeArticleDto } from '../dtos/helpdesk.dto';

@Injectable()
export class ManageKnowledgeBaseUseCase {
  constructor(
    @InjectRepository(KnowledgeArticleTypeOrmEntity)
    private readonly articleRepo: Repository<KnowledgeArticleTypeOrmEntity>,
  ) {}

  async findAllArticles(category?: string, search?: string): Promise<KnowledgeArticleTypeOrmEntity[]> {
    const qb = this.articleRepo
      .createQueryBuilder('a')
      .where('a.isActive = :active', { active: true })
      .orderBy('a.viewsCount', 'DESC')
      .addOrderBy('a.createdAt', 'DESC');

    if (category && category !== 'ALL') {
      qb.andWhere('a.category = :category', { category });
    }

    if (search) {
      const term = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(a.title) LIKE :term OR LOWER(a.summary) LIKE :term OR LOWER(a.solutionSteps) LIKE :term OR LOWER(a.symptoms) LIKE :term)',
        { term },
      );
    }

    return qb.getMany();
  }

  async findArticleById(id: string): Promise<KnowledgeArticleTypeOrmEntity> {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Artículo de conocimiento con ID ${id} no encontrado`);
    }

    // Incrementar contador de visualizaciones
    article.viewsCount += 1;
    await this.articleRepo.save(article);

    return article;
  }

  async createArticle(dto: CreateKnowledgeArticleDto): Promise<KnowledgeArticleTypeOrmEntity> {
    const article = this.articleRepo.create({
      title: dto.title,
      category: dto.category,
      summary: dto.summary,
      symptoms: dto.symptoms || null,
      solutionSteps: dto.solutionSteps,
      tags: dto.tags || [dto.category],
      sourceTicketId: dto.sourceTicketId || null,
      sourceTicketNumber: dto.sourceTicketNumber || null,
      authorTechnicianName: dto.authorTechnicianName,
      viewsCount: 0,
      helpfulCount: 0,
      isActive: true,
    });

    return this.articleRepo.save(article);
  }

  async markHelpful(id: string): Promise<{ helpfulCount: number }> {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Artículo con ID ${id} no encontrado`);
    }

    article.helpfulCount += 1;
    await this.articleRepo.save(article);

    return { helpfulCount: article.helpfulCount };
  }
}
