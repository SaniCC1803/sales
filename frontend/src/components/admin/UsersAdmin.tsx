import type { Item } from '../Card';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CardComponent from '@/components/Card';
import CreateEditDrawer from '@/components/forms/CreateEditDrawer';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import type { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

export default function UsersAdmin() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number;
    name: string;
  }>({
    open: false,
    id: 0,
    name: '',
  });

  const fetchUsers = () => {
    fetchWithAuth('http://localhost:3000/users')
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setError('Failed to load users'));
  };

  const handleDeleteUser = (id: number) => {
    const user = users.find((u) => u.id === id);
    setDeleteModal({
      open: true,
      id,
      name: user?.email || 'Unknown User',
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/users/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchUsers();
        setDeleteModal({ ...deleteModal, open: false });
      } else {
        setError('Failed to delete user');
      }
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleEdit = (item: Item) => {
    setCreateDrawerOpen(false);
    setEditingUser({ ...item } as User);
  };

  const handleEditComplete = () => {
    setEditingUser(null);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return (
    <>
      <div className="w-full flex justify-end items-center mb-6">
        <Button
          variant="outline"
          onClick={() => {
            setEditingUser(null);
            setCreateDrawerOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <CardComponent
            key={user.id}
            item={user}
            onDelete={handleDeleteUser}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <CreateEditDrawer
        onUserCreated={fetchUsers}
        editUser={editingUser}
        onUserEditComplete={handleEditComplete}
        activeSection="users"
        open={Boolean(editingUser || createDrawerOpen)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
            setCreateDrawerOpen(false);
          }
        }}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={confirmDelete}
        title="Delete User"
        itemName={deleteModal.name}
      />
    </>
  );
}
