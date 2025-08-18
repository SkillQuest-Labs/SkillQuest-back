// src/modules/clerk/clerk.controller.ts
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ClerkService } from './clerk.service';

@Controller('api/webhooks/clerk')
export class ClerkController {
  private readonly logger = new Logger(ClerkController.name);

  constructor(private clerkService: ClerkService) {}

  @Post()
  async handleClerkWebhook(@Body() body: any) {
    this.logger.log('📥 Webhook reçu avec body : ' + JSON.stringify(body));

    const { clerkId, email, username } = body;

    if (!clerkId) {
      this.logger.error('❌ Pas de clerkId reçu');
      return { message: 'Erreur : clerkId manquant' };
    }

    const user = await this.clerkService.syncUser(
      clerkId,
      email ?? '',
      username ?? '',
      '',
      'USER',
    );

    this.logger.log('✅ Utilisateur synchronisé : ' + JSON.stringify(user));

    return { message: 'Utilisateur synchronisé', user };
  }
}
