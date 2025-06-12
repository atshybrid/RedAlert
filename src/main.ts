import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Enable CORS
  app.enableCors();

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("RedAlert News API")
    .setDescription(
      `# RedAlert News Platform API

## Overview
Complete news management system with authentication, reporter management, article publishing, location hierarchy, and subscription services.

## Quick Start
1. **Register**: Create a new user account
2. **Set MPIN**: Activate your account with mobile PIN
3. **Login**: Get JWT token for authentication
4. **Create Reporter Profile**: Set up your reporter profile
5. **Start Publishing**: Create and manage articles

## Authentication Flow
- Register → Request OTP → Set MPIN → Login → Get JWT Token
- Use JWT token in Authorization header: \`Bearer <token>\`

## Test Data
- **Phone**: Use 10-digit Indian mobile numbers (e.g., 9876543210)
- **Location IDs**: Country: 1 (India), State: 1 (Telangana)
- **Amount**: Subscription amounts in paise (50000 = ₹500)

## Environment Variables
- **Development**: http://localhost:3004
- **Staging**: https://app.hrcitodaynews.in`
    )
    .setVersion("1.0.0")
    .addTag(
      "🔐 Authentication",
      "User registration, login, OTP, and MPIN management"
    )
    .addTag("👥 Reporters", "Reporter profile management and KYC verification")
    .addTag(
      "📰 Articles",
      "Article creation, publishing, and content management"
    )
    .addTag(
      "🌍 Locations",
      "Geographic location hierarchy (Countries → States → Districts → Constituencies → Mandals)"
    )
    .addTag(
      "💳 Payments",
      "Subscription management and payment processing via Razorpay"
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token received from login endpoint",
        in: "header",
      },
      "JWT-auth"
    )
    .addServer("http://localhost:3004", "Local Development Server")
    .addServer("https://app.hrcitodaynews.in", "Staging Server")
    .setExternalDoc(
      "Postman Collection",
      "https://documenter.getpostman.com/view/19692468/2sB2x5HYBq"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
      docExpansion: "list",
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        // Add custom headers or modify requests if needed
        return req;
      },
    },
    customSiteTitle: "RedAlert News API - Interactive Documentation",
    customfavIcon: "/favicon.ico",
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #d32f2f; font-size: 2.5em; }
      .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
      .swagger-ui .auth-wrapper { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 10px 0; }
      .swagger-ui .opblock.opblock-post { border-color: #4caf50; }
      .swagger-ui .opblock.opblock-get { border-color: #2196f3; }
      .swagger-ui .opblock.opblock-put { border-color: #ff9800; }
      .swagger-ui .opblock.opblock-delete { border-color: #f44336; }
      .swagger-ui .btn.authorize { background-color: #4caf50; border-color: #4caf50; }
      .swagger-ui .btn.authorize:hover { background-color: #45a049; }
    `,
    customJs: `
      // Auto-expand authentication section
      setTimeout(() => {
        const authSection = document.querySelector('.auth-wrapper');
        if (authSection) {
          authSection.style.display = 'block';
        }
      }, 1000);
    `,
  });

  // Set port explicitly to 3004
  const port = 3004;

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api/docs`
  );
}
bootstrap();
