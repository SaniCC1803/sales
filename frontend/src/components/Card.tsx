import { useLanguage } from "@/context/LanguageContext";
import { Button } from "./ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Category } from "@/types/category";
import { useTranslation } from "react-i18next";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";
import { Edit3, Trash2, User as UserIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";

type CardProps = {
    item: Category | Product | User;
    onDelete?: (id: number) => void;
    onEdit?: (item: Category | Product | User) => void;
};

export default function CardComponent({ item, onDelete, onEdit }: CardProps) {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const isAdmin = location.pathname.includes("/admin");

    const navigate = useNavigate();

    // Helper function to get full image URL
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        // If path already starts with http, return as is
        if (imagePath.startsWith('http')) return imagePath;
        // Otherwise prepend the backend URL
        return `http://localhost:3000${imagePath}`;
    };

    // Helper function to get display name for any item type
    const getDisplayName = () => {
        if ('translations' in item) {
            return item.translations.find((t) => t.language === language)?.name || item.translations[0]?.name || 'Unnamed';
        } else if ('email' in item) {
            return item.email; // User
        }
        return 'Unnamed';
    };

    // Helper function to get display description for any item type
    const getDisplayDescription = () => {
        if ('translations' in item) {
            return item.translations.find((t) => t.language === language)?.description || item.translations[0]?.description || '';
        } else if ('role' in item) {
            return item.role === 'SUPERADMIN' ? 'Super Admin' : 'User'; // User
        }
        return '';
    };

    // Helper function to get image for any item type
    const getDisplayImage = () => {
        if ('translations' in item) {
            if ('images' in item && Array.isArray(item.images) && item.images.length > 0) {
                return getImageUrl(item.images[0]); // Show first image for product
            } else if ('image' in item) {
                return getImageUrl(item.image || ''); // Category
            }
        } else if ('email' in item) {
            // User - return a default user avatar
            return 'https://via.placeholder.com/300x160?text=User';
        }
        return 'https://via.placeholder.com/300x160?text=Product';
    };

    const isUser = 'email' in item;

    return (
        <Card
            key={item.id}
            className={`overflow-hidden bg-background flex flex-col h-full ${isUser ? 'min-h-[180px]' : 'min-h-[320px]'}`}
        >
            {!isUser && (
                (() => {
                    // Determine navigation target
                    let onClick;
                    if ('translations' in item && 'price' in item) {
                        onClick = () => navigate(`/product/${item.id}`);
                    } else if ('translations' in item && 'id' in item) {
                        onClick = () => navigate(`/category/${item.id}`);
                    }
                    return (
                        <img
                            src={getDisplayImage()}
                            alt={getDisplayName()}
                            className={"w-full h-40 object-cover cursor-pointer"}
                            onClick={onClick}
                        />
                    );
                })()
            )}
            <div className={`p-4 ${isUser ? 'py-6' : ''} flex flex-col flex-1`}>
                {isUser && (
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                )}
                <CardTitle className={isUser ? 'text-center' : ''}>{getDisplayName()}</CardTitle>
                <CardDescription className={isUser ? 'text-center' : ''}>{getDisplayDescription()}</CardDescription>
                <div className="flex flex-col flex-1">
                    <div className="flex-1" />
                    {'price' in item && (
                        <div className="mb-2">
                            <span className="text-lg font-semibold text-primary">{item.price}</span>
                        </div>
                    )}
                    <div className={`${isUser ? 'mt-6' : 'mt-4'} flex gap-2 items-center justify-between`}>
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
                        ) :
                            ('translations' in item && 'price' in item)
                                ? (
                                    <Button
                                        className="bg-primary text-primary-foreground w-full"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                    >
                                        {t("view")}
                                    </Button>
                                )
                            : ('translations' in item && 'id' in item)
                                ? (
                                    <Button
                                        className="bg-primary text-primary-foreground w-full"
                                        onClick={() => navigate(`/category/${item.id}`)}
                                    >
                                        {t("view")}
                                    </Button>
                                )
                                : (
                                    <Button className="bg-primary text-primary-foreground w-full">{t("view")}</Button>
                                )
                        }
                    </div>
                </div>
            </div>
        </Card>
    );
}
