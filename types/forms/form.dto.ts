export type FormFieldType =
  | "short_text"
  | "long_text"
  | "select"
  | "boolean"
  | "email"
  | "url";

export interface FormFieldDto {
  id: string;
  label: string;
  description?: string;
  type: FormFieldType;
  required: boolean;
  options?: unknown;
  order: number;
}

export interface FormDto {
  id: string;
  documentId: string;
  title: string;
  description?: string;
  isEnabled: boolean;
  listResponsesPublicly: boolean;
  fields: FormFieldDto[];
}

export interface SubmitFormResponseDto {
  answers: {
    fieldId: string;
    value: string;
  }[];
  isPublic?: boolean;
}

export interface FormResponseDto {
  id: string;
  formId: string;
  isPublic: boolean;
  createdAt: string;
  answers: {
    id: string;
    fieldId: string;
    fieldLabel: string;
    value: string;
  }[];
}
