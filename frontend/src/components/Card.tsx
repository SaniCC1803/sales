import { useLanguage } from "@/context/LanguageContext";
import { Button } from "./ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Category } from "@/types/category";
import { useTranslation } from "react-i18next";
import type { Application } from "@/types/application";
import { Edit3, Trash2 } from "lucide-react";

type CardProps = {
    item: Category | Application;
    onDelete?: (id: number) => void;
    onEdit?: (item: Category | Application) => void;
};

export default function CardComponent({ item, onDelete, onEdit }: CardProps) {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const isAdmin = location.pathname.includes("/admin");

    // Helper function to get full image URL
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        // If path already starts with http, return as is
        if (imagePath.startsWith('http')) return imagePath;
        // Otherwise prepend the backend URL
        return `http://localhost:3000${imagePath}`;
    };

    return (
        <Card key={item.id} className="overflow-hidden bg-background">
            <img
                src={getImageUrl("image" in item ? item.image : item.logo)}
                alt={
                    item.translations.find((t) => t.language === language)?.name
                }
                className="w-full h-40 object-cover"
            />
            <div className="p-4">
                <CardTitle>
                    {item.translations.find((t) => t.language === language)?.name}
                </CardTitle>
                <CardDescription>
                    {
                        item.translations.find((t) => t.language === language)
                            ?.description
                    }
                </CardDescription>
                <div className="mt-4 flex gap-2 items-center justify-between">
                    {isAdmin ? (
                        <div className="flex w-full gap-2 justify-end">
                            <Button variant="outline" onClick={() => onEdit?.(item)}>
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                                className="bg-primary text-primary-foreground"
                                onClick={() => onDelete?.(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button className="bg-primary text-primary-foreground w-full">{t("view")}</Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
