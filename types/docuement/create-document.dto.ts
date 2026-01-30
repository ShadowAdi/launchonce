import { CreateFormDto } from "../form/form-create.dto";

export interface CreateDocumentDto {
    title: string;
    subtitle?: string;
    description?: string;
    content: string;
    coverImage?: string;
    tags?: string[];
    visibility?: "draft" | "published";
    form?: CreateFormDto;
}

export interface GetDocumentPublicDto {
    title: string;
    subtitle?: string;
    description?: string;
    content: string;
    coverImage?: string;
    tags?: [string];
    visibility?: "draft" | "published";
    userId: string;
    id: string;
    slug: string;
    viewCount: number;
    createdAt: string
}