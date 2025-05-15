import { Injectable, Logger } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  constructor(
    private readonly clientsService: ClientsService,
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get all clients with their documents for a company
   */
  async getClientsWithDocuments(companyId: string) {
    try {
      // Get all clients for the company
      const clients = await this.clientsService.findAll(companyId);

      // Return clients with their documents already included
      return clients;
    } catch (error) {
      this.logger.error(
        `Failed to get clients with documents: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get client details with all associated documents
   */
  async getClientWithDocuments(clientId: string, companyId: string) {
    try {
      // Get client details (includes documents)
      const client = await this.clientsService.findOne(clientId, companyId);

      return client;
    } catch (error) {
      this.logger.error(
        `Failed to get client with documents: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get client dashboard data
   * Combines client info with document statistics
   */
  async getClientDashboard(clientId: string, companyId: string) {
    try {
      // Get client details
      const client = await this.clientsService.findOne(clientId, companyId);

      // Get document statistics for this client
      const docCount = client.documents.length;

      // Count documents by status
      const documentsByStatus = client.documents.reduce((acc, doc) => {
        const status = doc.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        client,
        documentStats: {
          totalDocuments: docCount,
          documentsByStatus,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get client dashboard: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get company dashboard data
   * Combines client statistics and document statistics
   */
  async getCompanyDashboard(companyId: string) {
    try {
      // Get all clients for the company
      const clients = await this.clientsService.findAll(companyId);

      // Get all documents for the company's clients
      const allDocuments = clients.flatMap((client) => client.documents);

      // Count documents by status across all clients
      const documentsByStatus = allDocuments.reduce((acc, doc) => {
        const status = doc.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        companyStats: {
          totalClients: clients.length,
          totalDocuments: allDocuments.length,
          documentsByStatus,
          clients: clients.map((client) => ({
            id: client.id,
            name: client.name,
            documentCount: client.documents.length,
          })),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get company dashboard: ${error.message}`);
      throw error;
    }
  }
}
