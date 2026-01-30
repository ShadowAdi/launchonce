import { FormFieldType } from "./form-enum.types";

export interface UpdateFormFieldDto {
  id?: string; // present → update, missing → create

  label?: string;
  description?: string;
  type?: FormFieldType;
  required?: boolean;
  options?: string[];
  order?: number;
}

export interface UpdateFormDto {
  title?: string;
  description?: string;
  listResponsesPublicly?: boolean;
  isEnabled?: boolean;

  fields?: UpdateFormFieldDto[];

  deleteFieldIds?: string[];
}