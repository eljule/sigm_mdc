import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Función recursiva que limpia cadenas de texto en objetos o arreglos:
 * - Recorta espacios iniciales y finales (.trim())
 * - Convierte dobles espacios en espacios simples
 */
function cleanStrings(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return obj.trim();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanStrings(item));
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = cleanStrings(obj[key]);
    }
    return cleaned;
  }

  return obj;
}

@Injectable()
export class SanitizeBodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req?.body && typeof req.body === 'object') {
      req.body = cleanStrings(req.body);
    }

    if (req?.query && typeof req.query === 'object') {
      req.query = cleanStrings(req.query);
    }

    return next.handle();
  }
}
