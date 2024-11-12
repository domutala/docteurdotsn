import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { FirebaseAuthService } from "./admin.service";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // Ignorer certaines routes en fonction de la condition (exemple : route 'public')
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) {
      return true; // Sauter l'authentification si la route est publique
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }

    const decodedToken = await this.firebaseAuthService.verifyToken(token);
    request.user = decodedToken as any;
    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authorization = request.headers["authorization"];
    if (!authorization) {
      return null;
    }

    const parts = authorization.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }
}
