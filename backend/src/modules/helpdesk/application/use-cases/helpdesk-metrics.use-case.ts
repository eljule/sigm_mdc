import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TicketTypeOrmEntity,
  TicketStatus,
} from '../../infrastructure/persistence/entities/ticket.typeorm.entity';

export interface TechnicianWorkload {
  technicianName: string;
  inProgressCount: number;
  resolvedCount: number;
  totalAssigned: number;
  averageRating: number;
  status: 'DISPONIBLE' | 'OCUPADO' | 'SOBRECARGADO';
}

export interface HelpdeskMetrics {
  totalTickets: number;
  openCount: number;
  inProgressCount: number;
  pausedCount: number;
  inLabCount: number;
  resolvedCount: number;
  closedCount: number;
  canceledCount: number;
  resolutionRatePercent: number;
  averageSatisfactionRating: number;
  averageResponseTimeMinutes: number;
  averageResolutionTimeHours: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  techniciansWorkload: TechnicianWorkload[];
}

@Injectable()
export class HelpdeskMetricsUseCase {
  constructor(
    @InjectRepository(TicketTypeOrmEntity)
    private readonly ticketRepo: Repository<TicketTypeOrmEntity>,
  ) {}

  async getMetrics(): Promise<HelpdeskMetrics> {
    const allTickets = await this.ticketRepo.find({
      order: { createdAt: 'DESC' },
    });

    const totalTickets = allTickets.length;
    let openCount = 0;
    let inProgressCount = 0;
    let pausedCount = 0;
    let inLabCount = 0;
    let resolvedCount = 0;
    let closedCount = 0;
    let canceledCount = 0;

    const byCategory: Record<string, number> = {
      HARDWARE: 0,
      SOFTWARE: 0,
      RED_INTERNET: 0,
      PERMISOS: 0,
      OTROS: 0,
    };

    const byPriority: Record<string, number> = {
      BAJA: 0,
      MEDIA: 0,
      ALTA: 0,
      CRITICA: 0,
    };

    let totalRatingSum = 0;
    let ratedTicketsCount = 0;

    let responseTimeMinutesSum = 0;
    let responseCount = 0;

    let resolutionTimeHoursSum = 0;
    let resolutionCount = 0;

    const techMap = new Map<
      string,
      { inProgress: number; resolved: number; total: number; ratingSum: number; ratingCount: number }
    >();

    for (const t of allTickets) {
      // Categoría
      if (byCategory[t.category] !== undefined) {
        byCategory[t.category]++;
      } else {
        byCategory[t.category] = 1;
      }

      // Prioridad
      if (byPriority[t.priority] !== undefined) {
        byPriority[t.priority]++;
      } else {
        byPriority[t.priority] = 1;
      }

      // Estados
      switch (t.status) {
        case TicketStatus.ABIERTO:
          openCount++;
          break;
        case TicketStatus.EN_ATENCION:
          inProgressCount++;
          break;
        case TicketStatus.EN_PAUSA:
          pausedCount++;
          break;
        case TicketStatus.EN_LABORATORIO:
          inLabCount++;
          break;
        case TicketStatus.RESUELTO:
          resolvedCount++;
          break;
        case TicketStatus.CERRADO:
          closedCount++;
          break;
        case TicketStatus.CANCELADO:
          canceledCount++;
          break;
      }

      // Tiempos
      if (t.startedAt && t.createdAt) {
        const diffMs = new Date(t.startedAt).getTime() - new Date(t.createdAt).getTime();
        const diffMin = Math.max(1, Math.round(diffMs / (1000 * 60)));
        responseTimeMinutesSum += diffMin;
        responseCount++;
      }

      if ((t.resolvedAt || t.closedAt) && t.createdAt) {
        const end = t.resolvedAt || t.closedAt;
        const diffMs = new Date(end!).getTime() - new Date(t.createdAt).getTime();
        const diffHours = +(diffMs / (1000 * 60 * 60)).toFixed(1);
        resolutionTimeHoursSum += diffHours;
        resolutionCount++;
      }

      // Satisfacción
      if (t.userRating) {
        totalRatingSum += t.userRating;
        ratedTicketsCount++;
      }

      // Carga por técnico
      if (t.assignedTechnicianName) {
        const techName = t.assignedTechnicianName;
        if (!techMap.has(techName)) {
          techMap.set(techName, { inProgress: 0, resolved: 0, total: 0, ratingSum: 0, ratingCount: 0 });
        }
        const data = techMap.get(techName)!;
        data.total++;
        if (t.status === TicketStatus.EN_ATENCION || t.status === TicketStatus.EN_LABORATORIO || t.status === TicketStatus.EN_PAUSA) {
          data.inProgress++;
        } else if (t.status === TicketStatus.RESUELTO || t.status === TicketStatus.CERRADO) {
          data.resolved++;
        }
        if (t.userRating) {
          data.ratingSum += t.userRating;
          data.ratingCount++;
        }
      }
    }

    const techniciansWorkload: TechnicianWorkload[] = Array.from(techMap.entries()).map(([techName, d]) => {
      let status: 'DISPONIBLE' | 'OCUPADO' | 'SOBRECARGADO' = 'DISPONIBLE';
      if (d.inProgress >= 4) {
        status = 'SOBRECARGADO';
      } else if (d.inProgress >= 1) {
        status = 'OCUPADO';
      }

      const avgRating = d.ratingCount > 0 ? +(d.ratingSum / d.ratingCount).toFixed(1) : 5.0;

      return {
        technicianName: techName,
        inProgressCount: d.inProgress,
        resolvedCount: d.resolved,
        totalAssigned: d.total,
        averageRating: avgRating,
        status,
      };
    });

    const solvedTotal = resolvedCount + closedCount;
    const nonCanceledTotal = totalTickets - canceledCount;
    const resolutionRatePercent =
      nonCanceledTotal > 0 ? +((solvedTotal / nonCanceledTotal) * 100).toFixed(1) : 100;

    const averageSatisfactionRating =
      ratedTicketsCount > 0 ? +(totalRatingSum / ratedTicketsCount).toFixed(1) : 4.8;

    const averageResponseTimeMinutes =
      responseCount > 0 ? Math.round(responseTimeMinutesSum / responseCount) : 15;

    const averageResolutionTimeHours =
      resolutionCount > 0 ? +(resolutionTimeHoursSum / resolutionCount).toFixed(1) : 2.5;

    return {
      totalTickets,
      openCount,
      inProgressCount,
      pausedCount,
      inLabCount,
      resolvedCount,
      closedCount,
      canceledCount,
      resolutionRatePercent,
      averageSatisfactionRating,
      averageResponseTimeMinutes,
      averageResolutionTimeHours,
      byCategory,
      byPriority,
      techniciansWorkload,
    };
  }
}
