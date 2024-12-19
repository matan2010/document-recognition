import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) {}

    async create(createClientDto: CreateClientDto, companyId: string) {
        try {
            // First check if client with this reference ID already exists in this company
            const existingClient = await this.prisma.client.findFirst({
                where: {
                    companyId,
                    clientReferenceId: createClientDto.clientReferenceId
                }
            });

            if (existingClient) {
                throw new ConflictException(
                    `Client with reference ID '${createClientDto.clientReferenceId}' already exists in your company`
                );
            }

            return await this.prisma.client.create({
                data: {
                    clientReferenceId: createClientDto.clientReferenceId,
                    name: createClientDto.name,
                    email: createClientDto.email,
                    company: {
                        connect: {
                            id: companyId
                        }
                    }
                }
            });
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Handle any other Prisma-specific errors
                if (error.code === 'P2002') {
                    throw new ConflictException(
                        `Client with reference ID '${createClientDto.clientReferenceId}' already exists in your company`
                    );
                }
            }
            throw error;
        }
    }

    async findAll(companyId: string) {
        return this.prisma.client.findMany({
            where: { companyId },
            include: {
                documents: true,
            },
        });
    }

    async findOne(id: string, companyId: string) {
        const client = await this.prisma.client.findFirst({
            where: { 
                id,
                companyId,
            },
            include: {
                documents: true,
            },
        });

        if (!client) {
            throw new NotFoundException(`Client not found or does not belong to your company`);
        }

        return client;
    }

    async update(id: string, updateClientDto: UpdateClientDto, companyId: string) {
        // First check if client exists and belongs to company
        const existingClient = await this.findOne(id, companyId);

        if (!existingClient) {
            throw new NotFoundException(`Client not found or does not belong to your company`);
        }

        // If clientReferenceId is being updated, check for uniqueness
        if (updateClientDto.clientReferenceId) {
            const duplicateCheck = await this.prisma.client.findFirst({
                where: {
                    companyId,
                    clientReferenceId: updateClientDto.clientReferenceId,
                    NOT: {
                        id: id
                    }
                }
            });

            if (duplicateCheck) {
                throw new ConflictException(
                    `Client with reference ID '${updateClientDto.clientReferenceId}' already exists in your company`
                );
            }
        }

        try {
            return await this.prisma.client.update({
                where: { id },
                data: updateClientDto,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException(
                        `Client with reference ID '${updateClientDto.clientReferenceId}' already exists in your company`
                    );
                }
            }
            throw error;
        }
    }

    async remove(id: string, companyId: string) {
        // First check if client exists and belongs to company
        const client = await this.findOne(id, companyId);

        if (!client) {
            throw new NotFoundException(`Client not found or does not belong to your company`);
        }

        return this.prisma.client.delete({
            where: { id },
        });
    }
}
