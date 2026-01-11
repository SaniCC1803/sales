export type CategoryFormValues = {
    translations: {
        language: 'en' | 'mk';
        name: string;
        description?: string;
    }[];
    image: File | null;
    parentId?: number | null;
};

export type ProductFormValues = {
    translations: {
        language: 'en' | 'mk';
        name: string;
        description?: string;
    }[];
    price: string;
    categoryId: number;
    images: string[];
};

export type ApplicationFormValues = {
    translations: {
        language: 'en' | 'mk';
        name: string;
        description?: string;
    }[];
    logo: File | null;
    carousel: string[];
};

export type UserFormValues = {
    email: string;
    password: string;
    role: 'USER' | 'SUPERADMIN';
};
