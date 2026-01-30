import { CreateFormFieldDto } from "./form-field-create.dto";

export interface CreateFormDto {
  title: string;
  description?: string;

  listResponsesPublicly?: boolean;
  isEnabled?: boolean;

  fields: CreateFormFieldDto[];
}