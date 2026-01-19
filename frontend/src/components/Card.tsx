import { useLanguage } from "@/context/LanguageContext";
import { Button } from "./ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";
import type { Blog } from "@/types/blog";
import { Edit3, Trash2, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";


type Item = Category | Product | User | Blog;

type CardProps = {
    item: Item;
    onDelete?: (id: number) => void;
    onEdit?: (item: Item) => void;
};

export default function CardComponent({ item, onDelete, onEdit }: CardProps) {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const isAdmin = location.pathname.includes("/admin");

    // ---------- Type guards ----------
    const isUser = (i: Item): i is User => "email" in i && !("author" in i);
    const isProduct = (i: Item): i is Product => "price" in i;
    const isCategory = (i: Item): i is Category => "translations" in i && !("price" in i) && !("slug" in i);
    const isBlog = (i: Item): i is Blog => "slug" in i && "translations" in i && "author" in i;

    // ---------- Helpers ----------
    const getImageUrl = (path?: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `http://localhost:3000${path}`;
    };

    const getDisplayName = () => {
        if (isCategory(item) || isProduct(item)) {
            return (
                item.translations.find((t: any) => t.language === language)?.name ||
                item.translations[0]?.name ||
                "Unnamed"
            );
        }
        if (isBlog(item)) {
            return (
                item.translations.find((t) => t.language === language)?.title ||
                item.translations[0]?.title ||
                "Untitled Blog"
            );
        }
        if (isUser(item)) return (
            <>
                {item.email}
                {"isConfirmed" in item && <Checkbox checked={item.isConfirmed} className="mt-2 pointer-events-none" />}
            </>
        );
        return "Unnamed";
    };

    const getDisplayDescription = () => {
        if (isCategory(item) || isProduct(item)) {
            return (
                item.translations.find((t: any) => t.language === language)?.description ||
                item.translations[0]?.description ||
                ""
            );
        }
        if (isBlog(item)) {
            return (
                item.translations.find((t) => t.language === language)?.excerpt ||
                item.translations[0]?.excerpt ||
                ""
            );
        }
        if (isUser(item)) return item.role === "SUPERADMIN" ? "Super Admin" : "User";
        return "";
    };

    const getDisplayImage = () => {
        if (isProduct(item) && item.images?.length) return getImageUrl(item.images[0]);
        if (isCategory(item) && item.image) return getImageUrl(item.image);
        if (isBlog(item) && item.featuredImage) return getImageUrl(item.featuredImage);
        if (isUser(item)) return "https://via.placeholder.com/300x160?text=User";
        if (isBlog(item)) return "https://via.placeholder.com/300x160?text=Blog";
        return "https://via.placeholder.com/300x160?text=Product";
    };

    const handleView = () => {
        if (isProduct(item)) navigate(`/product/${item.id}`);
        else if (isCategory(item)) navigate(`/category/${item.id}`);
        else if (isBlog(item)) navigate(`/blog/${item.slug}`);
    };

    return (
        <Card
            key={item.id}
            className={`
                overflow-hidden bg-background flex flex-col h-full 
                ${isUser(item) ? "min-h-[180px] text-center" : "min-h-[320px] text-left"
                } text-sm text-muted-foreground`}
        >
            {/* Image */}
            {isUser(item) ? (
                <div className="flex justify-center mb-4 pt-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
            ) : (
                <img
                    src={getDisplayImage()}
                    alt={item.id.toString()}
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={handleView}
                />
            )}

            {/* Content */}
            <div className={`p-4 ${isUser(item) ? "py-6" : ""} flex flex-col flex-1`}>
                <CardTitle className={`flex flex-col items-center pb-2 text-lg text-foreground`}>
                    {getDisplayName()}
                </CardTitle>
                <Separator orientation="horizontal" />
                <CardDescription className="pb-2">
                    {getDisplayDescription()}
                </CardDescription>

                {/* Subcategories */}
                {isCategory(item) && item.subcategories?.length ? (
                    <CardDescription>
                        <span className="font-bold">Subcategories:</span>{" "}
                        {item.subcategories
                            .map((sub) =>
                                sub.translations?.find((t) => t.language === language)?.name || ""
                            )
                            .join(", ")}
                    </CardDescription>
                ) : null}
                {/* Blog status and author */}
                {isBlog(item) && (
                    <div className="flex flex-col gap-1 mb-2">
                        <CardDescription>
                            <span className="font-bold">Status:</span> {item.status}
                        </CardDescription>
                        <CardDescription>
                            <span className="font-bold">By:</span> {item.author?.email}
                        </CardDescription>
                        <CardDescription>
                            <span className="font-bold">Created:</span> {new Date(item.createdAt).toLocaleDateString()}
                        </CardDescription>
                        {item.publishedAt && (
                            <CardDescription>
                                <span className="font-bold">Published:</span> {new Date(item.publishedAt).toLocaleDateString()}
                            </CardDescription>
                        )}
                    </div>
                )}

                <div className="flex-1" /> {/* Push buttons to bottom */}

                {/* Price */}
                {isProduct(item) && (
                    <>
                        {/* <div className="flex-1" /> */}
                        <CardDescription className="text-lg font-semibold text-primary mb-2">
                            {item.price}
                        </CardDescription>
                    </>
                )}

                {/* Buttons */}
                <div className={`${isUser(item) ? "mt-6" : "mt-4"} flex gap-2 items-center justify-between`}>
                    {isAdmin ? (
                        <div className="flex w-full gap-2 justify-end">
                            <Button variant="outline" onClick={() => onEdit?.(item)}>
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button className="bg-primary text-primary-foreground" onClick={() => onDelete?.(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button className="bg-primary text-primary-foreground w-full" onClick={handleView}>
                            {t("view")}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}