import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { Blog } from "@/types/blog";
import SingleImageUpload from "@/components/SingleImageUpload";

interface CreateEditBlogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: Blog | null;
  onSuccess: () => void;
}

interface BlogFormData {
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  featuredImage?: File;
  translations: {
    en: {
      title: string;
      content: string;
      excerpt: string;
    };
    mk: {
      title: string;
      content: string;
      excerpt: string;
    };
  };
}

export default function CreateEditBlogModal({ open, onOpenChange, blog, onSuccess }: CreateEditBlogModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'mk'>('en');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BlogFormData>({
    slug: '',
    status: 'DRAFT',
    translations: {
      en: {
        title: '',
        content: '',
        excerpt: '',
      },
      mk: {
        title: '',
        content: '',
        excerpt: '',
      },
    },
  });

  useEffect(() => {
    if (blog) {
      // Populate form with existing blog data
      const enTranslation = blog.translations.find(t => t.language === 'en');
      const mkTranslation = blog.translations.find(t => t.language === 'mk');
      
      setFormData({
        slug: blog.slug,
        status: blog.status,
        translations: {
          en: {
            title: enTranslation?.title || '',
            content: enTranslation?.content || '',
            excerpt: enTranslation?.excerpt || '',
          },
          mk: {
            title: mkTranslation?.title || '',
            content: mkTranslation?.content || '',
            excerpt: mkTranslation?.excerpt || '',
          },
        },
      });
      setCurrentFeaturedImage(blog.featuredImage || null);
    } else {
      // Reset form for creating new blog
      setFormData({
        slug: '',
        status: 'DRAFT',
        translations: {
          en: {
            title: '',
            content: '',
            excerpt: '',
          },
          mk: {
            title: '',
            content: '',
            excerpt: '',
          },
        },
      });
      setCurrentFeaturedImage(null);
    }
    setFeaturedImageFile(null);
    setError(null);
  }, [blog, open]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLanguage]: {
          ...prev.translations[activeLanguage],
          title: value,
        },
      },
      // Auto-generate slug from English title if creating new blog
      slug: !blog && activeLanguage === 'en' ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('status', formData.status);
      
      // Add featured image if selected
      if (featuredImageFile) {
        formDataToSend.append('featuredImage', featuredImageFile);
      }
      
      // Add translations as JSON
      const translations = [
        {
          language: 'en',
          title: formData.translations.en.title,
          content: formData.translations.en.content,
          excerpt: formData.translations.en.excerpt,
        },
        {
          language: 'mk',
          title: formData.translations.mk.title,
          content: formData.translations.mk.content,
          excerpt: formData.translations.mk.excerpt,
        },
      ].filter(t => t.title.trim() !== ''); // Only include languages with titles
      
      formDataToSend.append('translations', JSON.stringify(translations));

      const url = blog 
        ? `http://localhost:3000/blogs/${blog.id}`
        : 'http://localhost:3000/blogs';
      
      const method = blog ? 'PATCH' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        onSuccess();
        onOpenChange(false);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setError(errorData.message || 'Failed to save blog');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const currentTranslation = formData.translations[activeLanguage];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blog ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Language Tabs */}
          <div className="flex space-x-2 mb-4">
            <Badge
              variant={activeLanguage === 'en' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setActiveLanguage('en')}
            >
              English
            </Badge>
            <Badge
              variant={activeLanguage === 'mk' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setActiveLanguage('mk')}
            >
              Macedonian
            </Badge>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="blog-post-slug"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'DRAFT' | 'PUBLISHED') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label>Featured Image</Label>
            <SingleImageUpload
              value={featuredImageFile}
              existingImageUrl={currentFeaturedImage || undefined}
              onChange={setFeaturedImageFile}
            />
          </div>

          {/* Language-specific fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title ({activeLanguage.toUpperCase()})</Label>
              <Input
                id="title"
                value={currentTranslation.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required={activeLanguage === 'en'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt ({activeLanguage.toUpperCase()})</Label>
              <Textarea
                id="excerpt"
                value={currentTranslation.excerpt}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    [activeLanguage]: {
                      ...prev.translations[activeLanguage],
                      excerpt: e.target.value,
                    },
                  },
                }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content ({activeLanguage.toUpperCase()})</Label>
              <Textarea
                id="content"
                value={currentTranslation.content}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    [activeLanguage]: {
                      ...prev.translations[activeLanguage],
                      content: e.target.value,
                    },
                  },
                }))}
                rows={10}
                required={activeLanguage === 'en'}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (blog ? 'Update Blog' : 'Create Blog')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}