import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import type { Blog } from "@/types/blog";
import { useLanguage } from "@/context/LanguageContext";
import CardComponent from "@/components/Card";
import CreateEditDrawer from "@/components/forms/CreateEditDrawer";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";

export default function BlogsAdmin() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        id: number;
        title: string;
    }>({
        open: false,
        id: 0,
        title: '',
    });
    const { language } = useLanguage();

    const fetchBlogs = () => {
        fetchWithAuth("http://localhost:3000/blogs")
            .then((res) => res.json())
            .then(setBlogs)
            .catch(() => setError("Failed to load blogs"));
    };

    const getBlogTranslation = (blog: Blog) => {
        return blog.translations.find(t => t.language === language) || blog.translations[0];
    };

    const handleDeleteBlog = (id: number) => {
        const blog = blogs.find(b => b.id === id);
        const translation = blog ? getBlogTranslation(blog) : null;
        const blogTitle = translation?.title || 'Unknown Blog';

        setDeleteModal({
            open: true,
            id,
            title: blogTitle,
        });
    };

    const confirmDelete = async () => {
        try {
            const res = await fetchWithAuth(`http://localhost:3000/blogs/${deleteModal.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchBlogs();
                setDeleteModal({ ...deleteModal, open: false });
            } else {
                setError('Failed to delete blog');
            }
        } catch {
            setError('Failed to delete blog');
        }
    };

    const handleEdit = (item: Blog | Category | Product | User) => {
        setCreateDrawerOpen(false);
        // Only allow editing if item is a Blog
        if ('slug' in item && 'author' in item) {
            setEditingBlog(item as Blog);
        }
    };

    const handleEditComplete = () => {
        setEditingBlog(null);
        fetchBlogs();
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <>
            <div className="w-full flex justify-end items-center mb-6">
                <Button variant="outline" onClick={() => { setEditingBlog(null); setCreateDrawerOpen(true); }}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <CardComponent
                        key={blog.id}
                        item={blog}
                        onDelete={handleDeleteBlog}
                        onEdit={handleEdit}
                    />
                ))}
            </div>

            <CreateEditDrawer
                onBlogCreated={fetchBlogs}
                editBlog={editingBlog}
                onBlogEditComplete={handleEditComplete}
                activeSection="blogs"
                open={Boolean(editingBlog || createDrawerOpen)}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingBlog(null);
                        setCreateDrawerOpen(false);
                    }
                }}
            />

            <ConfirmDeleteModal
                open={deleteModal.open}
                onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
                onConfirm={confirmDelete}
                title="Delete Blog"
                itemName={deleteModal.title}
            />
        </>
    );
}