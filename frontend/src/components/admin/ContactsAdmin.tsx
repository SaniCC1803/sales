import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Mail, Phone, User } from "lucide-react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import type { Contact } from "@/types/contact";

export default function ContactsAdmin() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number;
    name: string;
  }>({
    open: false,
    id: 0,
    name: '',
  });

  const fetchContacts = () => {
    fetchWithAuth(`${import.meta.env.VITE_API_URL}/contact`)
      .then((res) => res.json())
      .then(setContacts)
      .catch(() => setError("Failed to load contacts"));
  };

  const handleDelete = (id: number) => {
    const contact = contacts.find(c => c.id === id);
    setDeleteModal({
      open: true,
      id,
      name: contact?.name || contact?.email || contact?.phone || 'Unknown Contact',
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/contact/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchContacts();
        setDeleteModal({ ...deleteModal, open: false });
      } else {
        setError('Failed to delete contact');
      }
    } catch {
      setError('Failed to delete contact');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <>
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold capitalize">{t("contacts")}</h1>
        <span className="text-sm text-muted-foreground">{contacts.length} {t("messages")}</span>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {t("noContactMessages")}
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {contact.name || 'Anonymous'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {formatDate(contact.createdAt)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {!contact.email && !contact.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs italic">No contact information provided</span>
                      </div>
                    )}
                  </div>
                  {contact.message && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm leading-relaxed">{contact.message}</p>
                    </div>
                  )}
                  {!contact.message && (
                    <div className="bg-muted/30 p-3 rounded-md text-center">
                      <p className="text-sm text-muted-foreground italic">{t("noMessage")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={confirmDelete}
        title={t('deleteContactMessage')}
        itemName={deleteModal.name}
      />
    </>
  );
}
