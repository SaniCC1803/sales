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
import { Eye, EyeOff } from "lucide-react";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Application } from "@/types/application";
import type { User } from "@/types/user";

type CategoryFormValues = {
    translations: {
        language: 'en' | 'mk';
        name: string;
        description?: string;
    }[];
    image: File | null;
};

type ProductFormValues = {
    translations: {
        language: 'en' | 'mk';
        name: string;
        description?: string;
    }[];
    price: string;
    categoryId: number;
    image: File | null;
};

type ApplicationFormValues = {
    translations: {
        language: 'en' | 'mk';
        name: string;
        description?: string;
    }[];
    logo: File | null;
    carousel: string[];
};

type UserFormValues = {
    email: string;
    password: string;
    role: 'USER' | 'SUPERADMIN';
};

type CreateEditDrawerProps = {
    onCategoryCreated?: () => void;
    onProductCreated?: () => void;
    onApplicationCreated?: () => void;
    onUserCreated?: () => void;
    editCategory?: Category | null;
    editProduct?: Product | null;
    editApplication?: Application | null;
    editUser?: User | null;
    onEditComplete?: () => void;
    onProductEditComplete?: () => void;
    onApplicationEditComplete?: () => void;
    onUserEditComplete?: () => void;
    activeSection: "categories" | "applications" | "products" | "users";
};

export default function CreateEditDrawer({
    onCategoryCreated,
    onProductCreated,
    onApplicationCreated,
    onUserCreated,
    editCategory,
    editProduct,
    editApplication,
    editUser,
    onEditComplete,
    onProductEditComplete,
    onApplicationEditComplete,
    onUserEditComplete,
    activeSection
}: CreateEditDrawerProps) {
    const { t } = useTranslation();
    const languages: ('en' | 'mk')[] = ['en', 'mk'];
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const isEditMode = !!(editCategory || editProduct || editApplication || editUser);
    const isProductMode = activeSection === 'products';
    const isApplicationMode = activeSection === 'applications';
    const isUserMode = activeSection === 'users';

    // Fetch categories for product creation
    useEffect(() => {
        if (isProductMode) {
            fetch('http://localhost:3000/categories')
                .then(res => res.json())
                .then(setCategories)
                .catch(console.error);
        }
    }, [isProductMode]);

    // Helper function to get default values for categories
    const getCategoryDefaultValues = () => {
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

    // Helper function to get default values for products
    const getProductDefaultValues = () => {
        if (editProduct) {
            return {
                translations: languages.map((lang) => {
                    const existingTranslation = editProduct.translations.find(t => t.language === lang);
                    return {
                        language: lang,
                        name: existingTranslation?.name || '',
                        description: existingTranslation?.description || '',
                    };
                }),
                price: editProduct.price.toString(),
                categoryId: editProduct.category?.id || editProduct.categoryId || 0,
                image: null,
            };
        }
        return {
            translations: languages.map((lang) => ({
                language: lang,
                name: '',
                description: '',
            })),
            price: '',
            categoryId: 0,
            image: null,
        };
    };

    // Helper function to get default values for applications
    const getApplicationDefaultValues = () => {
        if (editApplication) {
            return {
                translations: languages.map((lang) => {
                    const existingTranslation = editApplication.translations.find(t => t.language === lang);
                    return {
                        language: lang,
                        name: existingTranslation?.name || '',
                        description: existingTranslation?.description || '',
                    };
                }),
                logo: null,
                carousel: Array.isArray(editApplication.carousel) ? editApplication.carousel : [],
            };
        }
        return {
            translations: languages.map((lang) => ({
                language: lang,
                name: '',
                description: '',
            })),
            logo: null,
            carousel: [],
        };
    };

    // Helper function to get default values for users
    const getUserDefaultValues = () => {
        if (editUser) {
            return {
                email: editUser.email,
                password: '', // Don't pre-fill password for security
                role: editUser.role,
            };
        }
        return {
            email: '',
            password: '',
            role: 'USER' as const,
        };
    };

    const { control, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormValues | ProductFormValues | ApplicationFormValues | UserFormValues>({
        defaultValues: isUserMode ? getUserDefaultValues() : isApplicationMode ? getApplicationDefaultValues() : isProductMode ? getProductDefaultValues() : getCategoryDefaultValues(),
    });

    // Reset form when editCategory, editProduct, editApplication, or editUser changes
    useEffect(() => {
        if (isUserMode) {
            reset(getUserDefaultValues());
            if (editUser) {
                setIsOpen(true);
            }
        } else if (isApplicationMode) {
            reset(getApplicationDefaultValues());
            if (editApplication) {
                setIsOpen(true);
            }
        } else if (isProductMode) {
            reset(getProductDefaultValues());
            if (editProduct) {
                setIsOpen(true);
            }
        } else {
            reset(getCategoryDefaultValues());
            if (editCategory) {
                console.log('Edit category data:', editCategory);
                console.log('Image URL:', editCategory.image);
                setIsOpen(true);
            }
        }
    }, [editCategory, editProduct, editApplication, editUser, isProductMode, isApplicationMode, isUserMode]);

    const onSubmit = async (data: CategoryFormValues | ProductFormValues | ApplicationFormValues | UserFormValues) => {
        if (isApplicationMode) {
            // Handle application submission
            const applicationData = data as ApplicationFormValues;
            const formData = new FormData();
            formData.append('translations', JSON.stringify(applicationData.translations));
            if (applicationData.logo) formData.append('logo', applicationData.logo);
            formData.append('carousel', JSON.stringify(applicationData.carousel));

            try {
                let res;
                if (isEditMode && editApplication) {
                    res = await fetch(`http://localhost:3000/applications/${editApplication.id}`, {
                        method: 'PUT',
                        body: formData,
                    });
                } else {
                    res = await fetch('http://localhost:3000/applications', {
                        method: 'POST',
                        body: formData,
                    });
                }

                if (!res.ok) {
                    console.error(`Error ${isEditMode ? 'updating' : 'creating'} application`);
                } else {
                    console.log(`Application ${isEditMode ? 'updated' : 'created'}!`);
                    reset();
                    if (isEditMode) {
                        onApplicationEditComplete?.();
                    } else {
                        onApplicationCreated?.();
                    }
                    setIsOpen(false);
                }
            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'creating'} application:`, error);
            }
        } else if (isUserMode) {
            // Handle user submission
            const userData = data as UserFormValues;
            
            try {
                let res;
                if (isEditMode && editUser) {
                    // Update existing user
                    res = await fetch(`http://localhost:3000/users/${editUser.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: userData.email,
                            password: userData.password || undefined, // Only include password if provided
                            role: userData.role
                        }),
                    });
                } else {
                    // Create new user
                    res = await fetch('http://localhost:3000/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: userData.email,
                            password: userData.password,
                            role: userData.role
                        }),
                    });
                }

                if (!res.ok) {
                    console.error(`Error ${isEditMode ? 'updating' : 'creating'} user`);
                } else {
                    console.log(`User ${isEditMode ? 'updated' : 'created'}!`);
                    reset();
                    if (isEditMode) {
                        onUserEditComplete?.();
                    } else {
                        onUserCreated?.();
                    }
                    setIsOpen(false);
                }
            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
            }
        } else if (isProductMode) {
            // Handle product submission
            const productData = data as ProductFormValues;
            const formData = new FormData();
            formData.append('translations', JSON.stringify(productData.translations));
            formData.append('price', productData.price.toString());
            formData.append('categoryId', productData.categoryId.toString());
            if (productData.image) formData.append('image', productData.image);
            
            try {
                let res;
                if (isEditMode && editProduct) {
                    res = await fetch(`http://localhost:3000/products/${editProduct.id}`, {
                        method: 'PUT',
                        body: formData,
                    });
                } else {
                    res = await fetch('http://localhost:3000/products', {
                        method: 'POST',
                        body: formData,
                    });
                }

                if (!res.ok) {
                    console.error(`Error ${isEditMode ? 'updating' : 'creating'} product`);
                } else {
                    console.log(`Product ${isEditMode ? 'updated' : 'created'}!`);
                    reset();
                    if (isEditMode) {
                        onProductEditComplete?.();
                    } else {
                        onProductCreated?.();
                    }
                    setIsOpen(false);
                }
            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, error);
            }
        } else {
            // Handle category submission
            const categoryData = data as CategoryFormValues;
            const formData = new FormData();
            formData.append('translations', JSON.stringify(categoryData.translations));
            if (categoryData.image) formData.append('image', categoryData.image);
            console.log("Form Data to be submitted:", categoryData);

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
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open && isEditMode) {
            // If closing in edit mode, call appropriate completion handler
            if (editCategory) {
                onEditComplete?.();
            } else if (editProduct) {
                onProductEditComplete?.();
            } else if (editApplication) {
                onApplicationEditComplete?.();
            }
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            {!isEditMode && !isApplicationMode && (
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Plus size={16} />
                    </Button>
                </SheetTrigger>
            )}
            <SheetContent className="flex flex-col md:max-w-md md:w-[400px] bg-background z-[100]">
                <SheetHeader>
                    <SheetTitle>
                        {isEditMode 
                            ? `${t("edit")} ${isApplicationMode ? t("application") : isProductMode ? t("product") : isUserMode ? t("user") : t("category")}` 
                            : `${t("create")} ${isApplicationMode ? t("application") : isProductMode ? t("product") : isUserMode ? t("user") : t("category")}`}
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto scrollable-form">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-1">
                        {isApplicationMode ? (
                            <>
                                {/* Application Form */}
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
                                                render={({ field }) => (
                                                    <div className="w-full">
                                                        <Input {...field} placeholder={lang.toUpperCase()} />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                                <Separator className="my-1" />
                                <Label>{t("logo")}</Label>
                                <Controller
                                    name="logo"
                                    control={control}
                                    rules={{ required: !isEditMode ? t("logoRequired") : false }}
                                    render={({ field }) => (
                                        <div>
                                            <SingleImageUpload
                                                value={field.value}
                                                existingImageUrl={editApplication?.logo ? 
                                                  (editApplication.logo.startsWith('http') ? editApplication.logo : `http://localhost:3000${editApplication.logo}`) 
                                                  : undefined
                                                }
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                            />
                                            <ErrorMessage
                                                errors={errors}
                                                name="logo"
                                                render={({ message }) => (
                                                    <p className="text-destructive text-sm mt-1">{message}</p>
                                                )}
                                            />
                                        </div>
                                    )}
                                />
                                <Separator className="my-1" />
                                <Label>Promotional Carousel Images</Label>
                                <Controller
                                    name="carousel"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            {field.value && field.value.length > 0 && field.value.map((url: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Input
                                                        value={url}
                                                        onChange={e => {
                                                            const newArr = [...field.value];
                                                            newArr[idx] = e.target.value;
                                                            field.onChange(newArr);
                                                        }}
                                                        placeholder={`Image URL #${idx + 1}`}
                                                    />
                                                    <Button type="button" variant="destructive" size="icon" onClick={() => {
                                                        const newArr = field.value.filter((_: any, i: number) => i !== idx);
                                                        field.onChange(newArr);
                                                    }} aria-label="Remove image">✕</Button>
                                                </div>
                                            ))}
                                            {(!field.value || field.value.length < 5) && (
                                                <Button type="button" variant="outline" onClick={() => field.onChange([...(field.value || []), ""])}>
                                                    + Add Image
                                                </Button>
                                            )}
                                            <p className="text-xs text-muted-foreground">Add up to 5 horizontal promotional image URLs for the homepage carousel.</p>
                                        </div>
                                    )}
                                />
                            </>
                        ) : isProductMode ? (
                            <>
                                {/* Product Form */}
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
                                                render={({ field }) => (
                                                    <div className="w-full">
                                                        <Input {...field} placeholder={lang.toUpperCase()} />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                                <Separator className="my-1" />
                                
                                <Label>{t("price")}</Label>
                                <Controller
                                    name="price"
                                    control={control}
                                    rules={{ 
                                        required: t("priceRequired"),
                                        pattern: {
                                            value: /^\d+(\.\d{1,2})?$/,
                                            message: t("priceValidFormat")
                                        },
                                        validate: (value) => {
                                            const num = parseFloat(value.toString());
                                            if (isNaN(num) || num <= 0) {
                                                return t("priceMinimum");
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field }) => (
                                        <div className="w-full">
                                            <Input 
                                                {...field} 
                                                type="text"
                                                inputMode="decimal"
                                                placeholder={t("price")} 
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Only allow numbers and decimal point
                                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                        field.onChange(value);
                                                    }
                                                }}
                                            />
                                            <ErrorMessage
                                                errors={errors}
                                                name="price"
                                                render={({ message }) => (
                                                    <p className="text-destructive text-sm mt-1">{message}</p>
                                                )}
                                            />
                                        </div>
                                    )}
                                />
                                
                                <Label>{t("category")}</Label>
                                <Controller
                                    name="categoryId"
                                    control={control}
                                    rules={{ 
                                        required: t("categoryRequired"),
                                        validate: (value) => value !== 0 || t("categoryRequired")
                                    }}
                                    render={({ field }) => (
                                        <div className="w-full">
                                            <select 
                                                {...field}
                                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            >
                                                <option value={0}>{t("selectCategory")}</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.translations.find(t => t.language === 'en')?.name || 
                                                         cat.translations[0]?.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ErrorMessage
                                                errors={errors}
                                                name="categoryId"
                                                render={({ message }) => (
                                                    <p className="text-destructive text-sm mt-1">{message}</p>
                                                )}
                                            />
                                        </div>
                                    )}
                                />
                                
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
                                                existingImageUrl={isEditMode ? editProduct?.image : undefined}
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
                            </>
                        ) : isUserMode ? (
                            <>
                                {/* User Form */}
                                <Label>{t("email")}</Label>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{ 
                                        required: t("emailRequired"),
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: t("emailInvalid")
                                        }
                                    }}
                                    render={({ field }) => (
                                        <div className="w-full">
                                            <Input 
                                                {...field} 
                                                type="email"
                                                placeholder={t("email")} 
                                            />
                                            <ErrorMessage
                                                errors={errors}
                                                name="email"
                                                render={({ message }) => (
                                                    <p className="text-destructive text-sm mt-1">{message}</p>
                                                )}
                                            />
                                        </div>
                                    )}
                                />
                                
                                <Separator className="my-1" />
                                <Label>{isEditMode ? t("newPassword") : t("password")}</Label>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{ 
                                        required: !isEditMode ? t("passwordRequired") : false,
                                        minLength: {
                                            value: 6,
                                            message: t("passwordMinLength")
                                        }
                                    }}
                                    render={({ field }) => {
                                        const [showPassword, setShowPassword] = useState(false);
                                        return (
                                            <div className="w-full relative">
                                                <Input 
                                                    {...field} 
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={isEditMode ? t("newPassword") : t("password")} 
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground focus:outline-none h-6 w-6 flex items-center justify-center"
                                                    tabIndex={-1}
                                                    onClick={() => setShowPassword(v => !v)}
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <ErrorMessage
                                                    errors={errors}
                                                    name="password"
                                                    render={({ message }) => (
                                                        <p className="text-destructive text-sm mt-1">{message}</p>
                                                    )}
                                                />
                                                {isEditMode && (
                                                    <p className="text-muted-foreground text-xs mt-1">
                                                        {t("leaveBlankToKeepCurrent")}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                                
                                <Separator className="my-1" />
                                <Label>{t("role")}</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    rules={{ required: t("roleRequired") }}
                                    render={({ field }) => (
                                        <div className="w-full">
                                            <select 
                                                {...field} 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">{t("selectRole")}</option>
                                                <option value="SUPERADMIN">{t("superadmin")}</option>
                                                <option value="USER">{t("user")}</option>
                                            </select>
                                            <ErrorMessage
                                                errors={errors}
                                                name="role"
                                                render={({ message }) => (
                                                    <p className="text-destructive text-sm mt-1">{message}</p>
                                                )}
                                            />
                                        </div>
                                    )}
                                />
                            </>
                        ) : (
                            <>
                                {/* Category Form */}
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
                            </>
                        )}
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
