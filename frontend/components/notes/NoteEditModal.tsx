'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import { fetchData } from '@/lib/api-client';

interface Tag {
  id: number;
  name: string;
}

interface Note {
  id: number;
  title: string;
  content: string | null;
  tags: Tag[];
}

interface NoteEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSuccess: () => void;
  tags: Tag[];
}

export function NoteEditModal({
  open,
  onOpenChange,
  note,
  onSuccess,
  tags,
}: NoteEditModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setSelectedTagIds(note.tags.map((t) => String(t.id)));
    }
  }, [note]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let finalTagIds = selectedTagIds.map((id) => parseInt(id));

      if (newTagName.trim()) {
        const newTag = await fetchData<{ id: number }>('/tags', {
          method: 'POST',
          body: JSON.stringify({ name: newTagName.trim() }),
        });
        finalTagIds.push(newTag.id);
      }

      const data = await fetchData(`/notes/${note?.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          tagIds: finalTagIds,
        }),
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Note berhasil diupdate!');
      onSuccess();
      onOpenChange(false);
      setNewTagName('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Gagal update note');
      toast.error(err.message || 'Gagal update note');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title wajib diisi');
      toast.error('Title wajib diisi');
      return;
    }
    setError('');
    updateMutation.mutate();
  };

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul note"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Konten</Label>
              <Textarea
                id="edit-content"
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
              <Label>Buat Tag Baru</Label>
              <Input
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
              disabled={updateMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}