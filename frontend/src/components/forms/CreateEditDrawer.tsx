import { useTranslation } from "react-i18next";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";

import CategoryForm from "./CategoryForm";
import ProductForm from "./ProductForm";
import ApplicationForm from "./ApplicationForm";
import UserForm from "./UserForm";
import { Button } from "@/components/ui/button";

import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Application } from "@/types/application";
import type { User } from "@/types/user";

type Props = {
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
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
    activeSection,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation();
    const isEditMode = !!(editCategory || editProduct || editApplication || editUser);

    const title = isEditMode
        ? `${t("edit")} ${activeSection.slice(0, -1)}`
        : `${t("create")} ${activeSection.slice(0, -1)}`;

    const closeDrawer = () => onOpenChange(false);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col md:max-w-md md:w-[400px] bg-background z-[100]">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollable-form">
                    {activeSection === "categories" && (
                        <CategoryForm
                            editCategory={editCategory}
                            onCreated={onCategoryCreated}
                            onEditComplete={onEditComplete}
                            closeDrawer={closeDrawer}
                        />
                    )}

                    {activeSection === "products" && (
                        <ProductForm
                            editProduct={editProduct}
                            onCreated={onProductCreated}
                            onEditComplete={onProductEditComplete}
                            closeDrawer={closeDrawer}
                        />
                    )}

                    {activeSection === "applications" && (
                        <ApplicationForm
                            editApplication={editApplication}
                            onCreated={onApplicationCreated}
                            onEditComplete={onApplicationEditComplete}
                            closeDrawer={closeDrawer}
                        />
                    )}

                    {activeSection === "users" && (
                        <>
                            <UserForm
                                editUser={editUser}
                                onCreated={onUserCreated}
                                onEditComplete={onUserEditComplete}
                                closeDrawer={closeDrawer}
                                formId="user-form"
                            />
                        </>
                    )}
                </div>

                {activeSection === "users" && (
                    <SheetFooter>
                        <Button type="submit" form="user-form">
                            {isEditMode ? t("save") : t("create")}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">{t("close")}</Button>
                        </SheetClose>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
