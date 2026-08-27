'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchData } from '@/lib/api-client';

interface Tag {
  id: number;
  name: string;
}

interface NoteCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tags: Tag[];
}

export function NoteCreateModal({
  open,
  onOpenChange,
  onSuccess,
  tags,
}: NoteCreateModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      let finalTagIds = selectedTagIds.map((id) => parseInt(id));

      if (newTagName.trim()) {
        const newTag = await fetchData<{ id: number }>('/tags', {
          method: 'POST',
          body: JSON.stringify({ name: newTagName.trim() }),
        });
        finalTagIds.push(newTag.id);
      }

      const data = await fetchData('/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          tagIds: finalTagIds,
        }),
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Note berhasil dibuat!');
      onSuccess();
      onOpenChange(false);
      setTitle('');
      setContent('');
      setSelectedTagIds([]);
      setNewTagName('');
      setError('');
    },
    onError: (err: any) => {
      const message = err.message || 'Gagal membuat note';
      setError(message);
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title wajib diisi');
      return;
    }
    setError('');
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Buat Note Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul note"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Konten</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis konten note (opsional)"
                rows={4}
              />
            </div>

            {/* Pilih tag */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !selectedTagIds.includes(value)) {
                    setSelectedTagIds([...selectedTagIds, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags && tags.length > 0 ? (
                    tags
                      .filter((tag) => !selectedTagIds.includes(String(tag.id)))
                      .map((tag) => (
                        <SelectItem key={tag.id} value={String(tag.id)}>
                          {tag.name}
                        </SelectItem>
                      ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground cursor-default">
                      Belum ada tag.
                    </div>
                  )}
                </SelectContent>
              </Select>

              {/* Daftar tag yang sudah dipilih */}
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTagIds.map((id) => {
                  const tag = tags.find((t) => t.id === parseInt(id));
                  return (
                    <span
                      key={id}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      {tag?.name || id}
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={() =>
                          setSelectedTagIds(
                            selectedTagIds.filter((t) => t !== id)
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Buat tag baru */}
            <div className="space-y-2">
              <Label htmlFor="newTag">Buat Tag Baru</Label>
              <Input
                id="newTag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nama tag baru (opsional)"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}