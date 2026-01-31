"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getFormBySlug, submitFormResponse } from "@/actions/form.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { FormDto } from "@/types/forms/form.dto";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function PublicFormPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const [form, setForm] = useState<FormDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [makePublic, setMakePublic] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchForm = async () => {
            setIsLoading(true);
            try {
                const result = await getFormBySlug(resolvedParams.slug);

                if (result.success && result.data) {
                    setForm(result.data);
                    // Initialize form data with empty strings
                    const initialData: Record<string, string> = {};
                    result.data.fields.forEach((field) => {
                        initialData[field.id] = "";
                    });
                    setFormData(initialData);
                } else {
                    const errorMessage = result.success ? "Failed to load form" : result.error;
                    toast.error(errorMessage);
                    router.push(`/${resolvedParams.slug}`);
                }
            } catch (error) {
                console.error("Error fetching form:", error);
                toast.error("An unexpected error occurred");
                router.push(`/${resolvedParams.slug}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForm();
    }, [resolvedParams.slug, router]);

    const handleFieldChange = (fieldId: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form) return;

        // Validate required fields
        const missingFields = form.fields
            .filter((field) => field.required && !formData[field.id]?.trim())
            .map((field) => field.label);

        if (missingFields.length > 0) {
            toast.error(`Please fill in required fields: ${missingFields.join(", ")}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const answers = Object.entries(formData)
                .filter(([_, value]) => value.trim() !== "")
                .map(([fieldId, value]) => ({
                    fieldId,
                    value,
                }));

            const result = await submitFormResponse(resolvedParams.slug, {
                answers,
                isPublic: makePublic,
            });

            if (result.success) {
                toast.success("Form submitted successfully!");
                setIsSubmitted(true);
            } else {
                toast.error(result.error || "Failed to submit form");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormDto["fields"][0]) => {
        const value = formData[field.id] || "";

        switch (field.type) {
            case "short_text":
                return (
                    <Input
                        id={field.id}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                    />
                );

            case "long_text":
                return (
                    <Textarea
                        id={field.id}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        rows={4}
                    />
                );

            case "email":
                return (
                    <Input
                        id={field.id}
                        type="email"
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.description || "Enter email address"}
                        required={field.required}
                    />
                );

            case "url":
                return (
                    <Input
                        id={field.id}
                        type="url"
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.description || "Enter URL"}
                        required={field.required}
                    />
                );

            case "boolean":
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={field.id}
                            checked={value === "true"}
                            onCheckedChange={(checked) =>
                                handleFieldChange(field.id, checked ? "true" : "false")
                            }
                        />
                        <Label htmlFor={field.id} className="cursor-pointer">
                            {field.description || "Toggle option"}
                        </Label>
                    </div>
                );

            case "select":
                const options = field.options as string[] | undefined;
                return (
                    <Select
                        value={value}
                        onValueChange={(val) => handleFieldChange(field.id, val)}
                    >
                        <SelectTrigger id={field.id}>
                            <SelectValue placeholder={field.description || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent>
                            {options && options.length > 0 ? (
                                options.map((option, idx) => (
                                    <SelectItem key={idx} value={option}>
                                        {option}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-options" disabled>
                                    No options available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                );

            default:
                return (
                    <Input
                        id={field.id}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.description}
                        required={field.required}
                    />
                );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-12 bg-muted rounded w-2/3"></div>
                        <div className="h-6 bg-muted rounded w-1/2"></div>
                        <Card>
                            <CardContent className="py-6 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-muted rounded"></div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (!form) {
        return null;
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-lg w-full">
                    <CardContent className="py-12">
                        <div className="text-center space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Thank You!</h2>
                                <p className="text-muted-foreground">
                                    Your response has been submitted successfully.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <Link href={`/${resolvedParams.slug}`}>
                                    <Button className="w-full">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Document
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        const initialData: Record<string, string> = {};
                                        form.fields.forEach((field) => {
                                            initialData[field.id] = "";
                                        });
                                        setFormData(initialData);
                                        setMakePublic(false);
                                    }}
                                >
                                    Submit Another Response
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href={`/${resolvedParams.slug}`}>
                        <Button variant="ghost" size="sm" className="mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Document
                        </Button>
                    </Link>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold">{form.title}</h1>
                        {form.description && (
                            <p className="text-lg text-muted-foreground">{form.description}</p>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardDescription>
                            Fields marked with <span className="text-destructive font-medium">*</span> are required
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {form.fields.map((field, index) => (
                                <div key={field.id} className="space-y-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm text-muted-foreground font-medium">{index + 1}.</span>
                                        <Label htmlFor={field.id} className="text-base">
                                            {field.label}
                                            {field.required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                    </div>
                                    {field.description && (
                                        <p className="text-sm text-muted-foreground ml-6">{field.description}</p>
                                    )}
                                    <div className="ml-6">
                                        {renderField(field)}
                                    </div>
                                </div>
                            ))}

                            {form.listResponsesPublicly && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="make-public" className="text-base cursor-pointer">
                                                Make my response public
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow others to see your response
                                            </p>
                                        </div>
                                        <Switch
                                            id="make-public"
                                            checked={makePublic}
                                            onCheckedChange={setMakePublic}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Response"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                </div>
            </div>
        );
}
