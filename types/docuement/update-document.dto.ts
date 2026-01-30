export type Visibility = "draft" | "published";

export interface DocumentUpdateDto {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  content?: string;
  coverImage?: string | null;
  tags?: string[] | null;
  visibility?: Visibility;
}

export interface UpdateFormDto {
  title?: string;
  description?: string | null;
  isEnabled?: boolean;
  listResponsesPublicly?: boolean;
}

export type FormFieldType =
  | "short_text"
  | "long_text"
  | "select"
  | "boolean"
  | "email"
  | "url";

export interface FormFieldCreateDto {
  label: string;
  description?: string | null;
  type: FormFieldType;
  required?: boolean;
  options?: unknown | null;
  order: number;
}

export interface FormFieldUpdateDto {
  id: string;
  label?: string;
  description?: string | null;
  type?: FormFieldType;
  required?: boolean;
  options?: unknown | null;
  order?: number;
}

export interface UpdateFormFieldsDto {
  formMetaIfMissing?: {
    title: string;
    description?: string | null;
    isEnabled?: boolean;
    listResponsesPublicly?: boolean;
  };
  updates?: FormFieldUpdateDto[];
  creates?: FormFieldCreateDto[];
  deletes?: string[];
}
