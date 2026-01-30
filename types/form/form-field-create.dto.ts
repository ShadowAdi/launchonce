import { FormFieldType } from "./form-enum.types";

export interface CreateFormFieldDto {
    label: string;
    description?: string;
    type: FormFieldType;
    required?: boolean;

    options?: string[];
    order: number;
}