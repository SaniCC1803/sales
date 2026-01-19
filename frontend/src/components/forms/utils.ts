import type { User } from "@/types/user";
import type { UserFormValues } from "./UserForm";
import type { Language } from "@/types/application";
import type { Category } from "@/types/category";
import type { CategoryFormValues } from "./CategoryForm";
import type { Product } from "@/types/product";
import type { ProductFormValues } from "./ProductForm";
import type { Blog } from "@/types/blog";

export function getUserDefaultValues(editUser?: User | null): UserFormValues {
  if (!editUser) {
    return {
      email: "",
      password: "",
      role: "USER",
    };
  }

  return {
    email: editUser.email,
    password: "",
    role: editUser.role,
  };
}

export function getDefaultCategoryValues(
  editCategory: Category | null | undefined,
  languages: Language[]
): CategoryFormValues {
  if (editCategory) {
    return {
      translations: languages.map((lang) => {
        const existing = editCategory.translations.find(
          (t) => t.language === lang
        );
        return {
          language: lang,
          name: existing?.name || "",
          description: existing?.description || "",
        };
      }),
      parentId: editCategory.parentId ?? null,
      image: null,
    };
  }

  return {
    translations: languages.map((lang) => ({
      language: lang,
      name: "",
      description: "",
    })),
    parentId: null,
    image: null,
  };
}

export function getDefaultProductValues(
  editProduct: Product | null | undefined,
  languages: Language[]
): ProductFormValues {
  if (editProduct) {
    return {
      translations: languages.map((lang) => {
        const existing = editProduct.translations.find(
          (t) => t.language === lang
        );
        return {
          language: lang,
          name: existing?.name || "",
          description: existing?.description || "",
        };
      }),
      price: editProduct.price.toString(),
      categoryId: editProduct.category?.id || editProduct.categoryId || null,
      images: Array.isArray(editProduct.images) ? editProduct.images : [],
    };
  }

  return {
    translations: languages.map((lang) => ({
      language: lang,
      name: "",
      description: "",
    })),
    price: "",
    categoryId: null,
    images: [],
  };
}

export const getDefaultBlogValues = (editBlog?: Blog | null) => {
  const enTranslation = editBlog?.translations.find((t) => t.language === "en");
  const mkTranslation = editBlog?.translations.find((t) => t.language === "mk");

  return {
    slug: editBlog?.slug || "",
    status: editBlog?.status || ("DRAFT" as const),
    translations: {
      en: {
        title: enTranslation?.title || "",
        content: enTranslation?.content || "",
        excerpt: enTranslation?.excerpt || "",
      },
      mk: {
        title: mkTranslation?.title || "",
        content: mkTranslation?.content || "",
        excerpt: mkTranslation?.excerpt || "",
      },
    },
  };
};
