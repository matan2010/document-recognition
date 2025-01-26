import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { ClientsModule } from './clients/clients.module';
import { GoogleCloudConfig } from './config/google-cloud.config'; // Add this line

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    DocumentsModule,
    UsersModule,
    ClientsModule,
  ],
  providers: [GoogleCloudConfig],
})
export class AppModule {}
