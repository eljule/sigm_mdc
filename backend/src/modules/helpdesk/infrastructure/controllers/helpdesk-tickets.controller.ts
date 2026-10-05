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
import { ManageTicketsUseCase } from '../../application/use-cases/manage-tickets.use-case';
import { ManageTicketDetailsUseCase } from '../../application/use-cases/manage-ticket-details.use-case';
import { ManageProvisionalLoansUseCase } from '../../application/use-cases/manage-provisional-loans.use-case';
import {
  CreateTicketDto,
  TakeTicketDto,
  UpdateTicketStatusDto,
  AddTechnicalDetailDto,
  AddSupplyToTicketDto,
  AssignProvisionalAssetDto,
  ReturnProvisionalAssetDto,
  UserConformityDto,
  ReassignTechnicianDto,
} from '../../application/dtos/helpdesk.dto';

@Controller('api/v1/helpdesk/tickets')
export class HelpdeskTicketsController {
  constructor(
    private readonly ticketsUseCase: ManageTicketsUseCase,
    private readonly detailsUseCase: ManageTicketDetailsUseCase,
    private readonly loansUseCase: ManageProvisionalLoansUseCase,
  ) {}

  @Get()
  async getTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('officeName') officeName?: string,
    @Query('technicianId') technicianId?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.ticketsUseCase.findAllTickets({
      status,
      priority,
      category,
      officeName,
      technicianId,
      search,
    });
    return {
      success: true,
      message: 'Tickets de mesa de ayuda obtenidos',
      data,
    };
  }

  @Get('my-tickets')
  async getMyTickets(
    @Query('applicantName') applicantName?: string,
    @Query('officeName') officeName?: string,
  ) {
    const data = await this.ticketsUseCase.findMyTickets(applicantName, officeName);
    return {
      success: true,
      message: 'Tickets del solicitante recuperados',
      data,
    };
  }

  @Get('lookup-asset')
  async lookupAsset(@Query('code') code: string) {
    const data = await this.ticketsUseCase.lookupAssetByCode(code);
    return {
      success: true,
      message: 'Activo tecnológico localizado para precarga',
      data,
    };
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    const data = await this.ticketsUseCase.findTicketById(id);
    return {
      success: true,
      message: 'Detalle de ticket obtenido exitosamente',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTicket(@Body() dto: CreateTicketDto) {
    const data = await this.ticketsUseCase.createTicket(dto);
    return {
      success: true,
      message: `Ticket ${data.ticketNumber} registrado exitosamente`,
      data,
    };
  }

  @Post(':id/take')
  @HttpCode(HttpStatus.OK)
  async takeTicket(@Param('id') id: string, @Body() dto: TakeTicketDto) {
    const data = await this.ticketsUseCase.takeTicket(id, dto);
    return {
      success: true,
      message: `Ticket ${data.ticketNumber} tomado para atención por ${dto.technicianName}`,
      data,
    };
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    const data = await this.ticketsUseCase.updateTicketStatus(id, dto);
    return {
      success: true,
      message: `Estado de ticket actualizado a ${dto.status}`,
      data,
    };
  }

  @Post(':id/reassign')
  @HttpCode(HttpStatus.OK)
  async reassignTicket(
    @Param('id') id: string,
    @Body() dto: ReassignTechnicianDto,
  ) {
    const data = await this.ticketsUseCase.reassignTicket(id, dto);
    return {
      success: true,
      message: `Ticket reasignado a ${dto.technicianName}`,
      data,
    };
  }

  @Post(':id/technical-detail')
  @HttpCode(HttpStatus.OK)
  async addTechnicalDetail(
    @Param('id') id: string,
    @Body() dto: AddTechnicalDetailDto,
  ) {
    const data = await this.detailsUseCase.saveTechnicalDetail(id, dto);
    return {
      success: true,
      message: 'Diagnóstico técnico y solución registrados. Ticket resuelto.',
      data,
    };
  }

  @Post(':id/supplies')
  @HttpCode(HttpStatus.CREATED)
  async addSupply(
    @Param('id') id: string,
    @Body() dto: AddSupplyToTicketDto,
  ) {
    const data = await this.detailsUseCase.addSupply(id, dto);
    return {
      success: true,
      message: `Insumo '${data.supplyName}' descargado de almacén para el ticket`,
      data,
    };
  }

  @Post(':id/loans/provisional')
  @HttpCode(HttpStatus.CREATED)
  async assignProvisional(
    @Param('id') id: string,
    @Body() dto: AssignProvisionalAssetDto,
  ) {
    const data = await this.loansUseCase.assignProvisional(id, dto);
    return {
      success: true,
      message: `Activo de reserva provisional '${data.temporaryAssetCode}' asignado al usuario`,
      data,
    };
  }

  @Post('loans/:loanId/return')
  @HttpCode(HttpStatus.OK)
  async returnProvisional(
    @Param('loanId') loanId: string,
    @Body() dto: ReturnProvisionalAssetDto,
  ) {
    const data = await this.loansUseCase.returnProvisional(loanId, dto);
    return {
      success: true,
      message: `Componente provisional '${data.temporaryAssetCode}' devuelto al stock de reserva`,
      data,
    };
  }

  @Post(':id/conformity')
  @HttpCode(HttpStatus.OK)
  async userConformity(
    @Param('id') id: string,
    @Body() dto: UserConformityDto,
  ) {
    const data = await this.ticketsUseCase.userConformity(id, dto);
    return {
      success: true,
      message: dto.userConformity
        ? `Ticket ${data.ticketNumber} finalizado y cerrado formalmente con visto bueno del usuario`
        : `Observación registrada. Ticket ${data.ticketNumber} devuelto a atención técnica`,
      data,
    };
  }
}
