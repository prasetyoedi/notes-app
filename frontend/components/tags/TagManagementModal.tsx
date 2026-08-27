'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { fetchData } from '@/lib/api-client';

interface Tag {
  id: number;
  name: string;
}

interface TagManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onTagChange: () => void;
}

export function TagManagementModal({
  open,
  onOpenChange,
  tags,
  onTagChange,
}: TagManagementModalProps) {
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreating(true);
    try {
      await fetchData('/tags', {
        method: 'POST',
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      toast.success('Tag berhasil dibuat');
      setNewTagName('');
      onTagChange();
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat tag');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!confirm('Hapus tag ini? Semua relasi ke notes akan dihapus.')) return;
    try {
      await fetchData(`/tags/${id}`, { method: 'DELETE' });
      toast.success('Tag berhasil dihapus');
      onTagChange();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus tag');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>🏷️ Manajemen Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nama tag baru..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            />
            <Button onClick={handleCreateTag} disabled={isCreating || !newTagName.trim()}>
              {isCreating ? '...' : 'Tambah'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-3">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada tag.</p>
            ) : (
              tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="group flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 pl-3 pr-1 py-1"
                >
                  #{tag.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="ml-1 rounded-full p-0.5 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                    title="Hapus tag"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}