import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

// Validates that a route parameter is a valid UUID v4.
// Using a custom pipe keeps controller methods clean and validation explicit.
@Injectable()
export class ParseUUIDParam implements PipeTransform<string, string> {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  transform(value: string): string {
    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException(
        `"${value}" is not a valid UUID. Route params must be a UUID v4.`,
      );
    }
    return value;
  }
}
