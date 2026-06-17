import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';

// PartialType makes ALL fields from CreateApplicationDto optional,
// while PRESERVING all the validation decorators.
// This means PATCH can send any subset of fields, and whatever
// is sent still gets validated the same way as POST.
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}
