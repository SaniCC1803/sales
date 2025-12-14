"use client";
import '@/styles/scrollbar.css';
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactCountryFlag from "react-country-flag";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Label } from "./ui/label";
import { ErrorMessage } from "@hookform/error-message";
import SingleImageUpload from "./SingleImageUpload";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useState, useEffect } from "react";
import type { Category } from "@/types/category";

type CategoryFormValues = {
    translations: {
        language: 'en' | 'mk';
        name: string;
        description?: string;
    }[];
    image: File | null;
};

type CreateEditDrawerProps = {
    onCategoryCreated?: () => void;
    editCategory?: Category | null;
    onEditComplete?: () => void;
};

export default function CreateEditDrawer({
    onCategoryCreated,
    editCategory,
    onEditComplete
}: CreateEditDrawerProps) {
    const { t } = useTranslation();
    const languages: ('en' | 'mk')[] = ['en', 'mk'];
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!editCategory;

    // Helper function to get default values
    const getDefaultValues = () => {
        if (editCategory) {
            return {
                translations: languages.map((lang) => {
                    const existingTranslation = editCategory.translations.find(t => t.language === lang);
                    return {
                        language: lang,
                        name: existingTranslation?.name || '',
                        description: existingTranslation?.description || '',
                    };
                }),
                image: null, // File will be handled separately for edit
            };
        }
        return {
            translations: languages.map((lang) => ({
                language: lang,
                name: '',
                description: '',
            })),
            image: null,
        };
    };

    const { control, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormValues>({
        defaultValues: getDefaultValues(),
    });

    // Reset form when editCategory changes
    useEffect(() => {
        reset(getDefaultValues());
        if (editCategory) {
            console.log('Edit category data:', editCategory);
            console.log('Image URL:', editCategory.image);
            setIsOpen(true);
        }
    }, [editCategory]);

    const onSubmit = async (data: CategoryFormValues) => {
        const formData = new FormData();
        formData.append('translations', JSON.stringify(data.translations));
        if (data.image) formData.append('image', data.image);
        console.log("Form Data to be submitted:", data);

        try {
            let res;
            if (isEditMode && editCategory) {
                // Update existing category
                res = await fetch(`http://localhost:3000/categories/${editCategory.id}`, {
                    method: 'PUT',
                    body: formData,
                });
            } else {
                // Create new category
                res = await fetch('http://localhost:3000/categories', {
                    method: 'POST',
                    body: formData,
                });
            }

            if (!res.ok) {
                console.error(`Error ${isEditMode ? 'updating' : 'creating'} category`);
            } else {
                console.log(`Category ${isEditMode ? 'updated' : 'created'}!`);
                reset();
                if (isEditMode) {
                    onEditComplete?.();
                } else {
                    onCategoryCreated?.();
                }
                setIsOpen(false);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} category:`, error);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open && isEditMode) {
            // If closing in edit mode, call onEditComplete to clear the editing state
            onEditComplete?.();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            {!isEditMode && (
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Plus size={16} />
                    </Button>
                </SheetTrigger>
            )}
            <SheetContent className="flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>
                        {isEditMode ? `${t("edit")} ${t("category")}` : `${t("create")} ${t("category")}`}
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto pr-2 scrollable-form">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <Label>{t("name")}</Label>
                        {languages.map((lang) => {
                            const countryCode = lang === "en" ? "GB" : lang === "mk" ? "MK" : "";
                            return (
                                <div key={lang} className="flex items-center gap-2">
                                    <ReactCountryFlag
                                        countryCode={countryCode}
                                        svg
                                        style={{ width: "2em", height: "2em" }}
                                    />
                                    <Controller
                                        name={`translations.${languages.indexOf(lang)}.name` as const}
                                        control={control}
                                        rules={{ required: t("nameRequired") }}
                                        render={({ field }) => (
                                            <div className="w-full">
                                                <Input {...field} placeholder={lang.toUpperCase()} />
                                                <ErrorMessage
                                                    errors={errors}
                                                    name={`translations.${languages.indexOf(lang)}.name`}
                                                    render={({ message }) => (
                                                        <p className="text-destructive text-sm mt-1">{message}</p>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            );
                        })}
                        <Separator className="my-1" />
                        <Label>{t("description")}</Label>
                        {languages.map((lang) => {
                            const countryCode = lang === "en" ? "GB" : lang === "mk" ? "MK" : "";
                            return (
                                <div key={lang} className="flex items-center gap-2">
                                    <ReactCountryFlag
                                        countryCode={countryCode}
                                        svg
                                        style={{ width: "2em", height: "2em" }}
                                    />
                                    <Controller
                                        name={`translations.${languages.indexOf(lang)}.description` as const}
                                        control={control}
                                        rules={{ required: t("descriptionRequired") }}
                                        render={({ field }) => (
                                            <div className="w-full">
                                                <Input {...field} placeholder={lang.toUpperCase()} />
                                                <ErrorMessage
                                                    errors={errors}
                                                    name={`translations.${languages.indexOf(lang)}.description`}
                                                    render={({ message }) => (
                                                        <p className="text-destructive text-sm mt-1">{message}</p>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            );
                        })}
                        <Separator className="my-1" />
                        <Label>{t("image")}</Label>
                        <Controller
                            name="image"
                            control={control}
                            rules={{ required: !isEditMode ? t("imageRequired") : false }}
                            render={({ field }) => (
                                <div>
                                    <SingleImageUpload
                                        value={field.value}
                                        existingImageUrl={isEditMode ? editCategory?.image : undefined}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                    <ErrorMessage
                                        errors={errors}
                                        name="image"
                                        render={({ message }) => (
                                            <p className="text-destructive text-sm mt-1">{message}</p>
                                        )}
                                    />
                                </div>
                            )}
                        />
                        <SheetFooter>
                            <Button type="submit">
                                {isEditMode ? t("save") : t("create")}
                            </Button>
                            <SheetClose asChild>
                                <Button variant="outline">Close</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
