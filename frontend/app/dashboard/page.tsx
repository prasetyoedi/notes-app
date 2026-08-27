'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Search, Filter, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NoteCreateModal } from '@/components/notes/NoteCreateModal';
import { NoteEditModal } from '@/components/notes/NoteEditModal';
import { TagManagementModal } from '@/components/tags/TagManagementModal';
import { fetchData } from '@/lib/api-client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Tag {
  id: number;
  name: string;
}

interface Note {
  id: number;
  title: string;
  content: string | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);

  const {
    data: notes,
    isLoading,
    error,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ['notes', page, limit, search, tagFilter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (tagFilter) params.append('tags', tagFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const result = await fetchData<Note[]>(`/notes?${params.toString()}`);
      return result;
    },
  });

  const {
    data: tags,
    isLoading: isTagsLoading,
    refetch: refetchTags,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const result = await fetchData<Tag[]>('/tags');
      return result;
    },
  });

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Yakin ingin menghapus note ini?')) return;
    try {
      await fetchData(`/notes/${id}`, { method: 'DELETE' });
      toast.success('Note berhasil dihapus');
      refetchNotes();
    } catch (err) {
      toast.error('Gagal menghapus note');
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!confirm('Hapus tag ini? Semua relasi ke notes akan dihapus.')) return;
    try {
      await fetchData(`/tags/${id}`, { method: 'DELETE' });
      toast.success('Tag berhasil dihapus');
      refetchTags();
      if (tagFilter === String(id)) setTagFilter('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus tag');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTagFilter('');
    setStartDate('');
    setEndDate('');
  };

  const handleNoteSuccess = () => {
    setPage(1);
    refetchNotes();
  };

  const handleLimitChange = (newLimit: string | null) => {
    if (newLimit === null) return;
    setLimit(Number(newLimit));
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-1 mt-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-red-100 p-3">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {(error as Error).message}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetchNotes()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* <div>
          <h2 className="text-2xl font-bold tracking-tight">📝 Semua Notes</h2>
          <p className="text-sm text-muted-foreground">
            Kelola catatan Anda dengan mudah
          </p>
        </div> */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTagManagementOpen(true)}
            className="border-slate-200/80 bg-white/70 backdrop-blur-sm"
          >
            🏷️ Kelola Tag
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Buat Note
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau konten..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/70 backdrop-blur-sm border-slate-200/80 focus-visible:ring-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="shrink-0 border-slate-200/80 bg-white/70 backdrop-blur-sm"
        >
          <Filter className="h-4 w-4" />
        </Button>

        {isTagsLoading ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <Select value={tagFilter} onValueChange={(v) => setTagFilter(v || '')}>
            <SelectTrigger className="w-45 bg-white/70 backdrop-blur-sm border-slate-200/80">
              <SelectValue>
                {tagFilter ? (
                  <span className="flex items-center gap-1">
                    <span className="text-blue-600">#</span>
                    {tags?.find((t) => String(t.id) === tagFilter)?.name || 'Filter Tag'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Filter Tag</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Tag</SelectItem>
              {tags && tags.length > 0 ? (
                tags.map((tag) => (
                  <SelectItem key={tag.id} value={String(tag.id)}>
                    #{tag.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground cursor-default">
                  Belum ada tag. Buat di "Kelola Tag"
                </div>
              )}
            </SelectContent>
          </Select>
        )}

        {(tagFilter || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Reset filter
          </Button>
        )}
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg border bg-white/70 backdrop-blur-sm shadow-sm animate-in slide-in-from-top-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 bg-white/50 border-slate-200/80"
              placeholder="Mulai"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 bg-white/50 border-slate-200/80"
              placeholder="Sampai"
            />
          </div>
        </div>
      )}

      {notes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-lg font-semibold">Belum ada note</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Mulai buat catatan pertama Anda dengan klik tombol &quot;Buat Note&quot; di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes?.map((note) => (
            <Card
              key={note.id}
              className="group flex flex-col overflow-hidden border-slate-200/80 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-100/50 hover:border-blue-200/50 transition-all duration-300"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {note.title}
                </CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  {note.tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground/60">
                      Tanpa tag
                    </span>
                  ) : (
                    note.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 text-xs font-normal"
                      >
                        #{tag.name}
                      </Badge>
                    ))
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.content || (
                    <span className="italic text-muted-foreground/50">
                      (Konten kosong)
                    </span>
                  )}
                </p>
              </CardContent>

              <CardFooter className="flex flex-wrap justify-between items-center border-t border-slate-100/80 pt-3 text-xs text-muted-foreground gap-2">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                  {format(new Date(note.created_at), 'dd MMM yyyy', { locale: id })}
                </span>
                <div className="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingNote(note)}
                    className="h-8 px-3 text-xs bg-orange-50 text-orange-400"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="h-8 px-3 text-xs bg-red-50 text-red-600"
                  >
                    Hapus
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {notes && notes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-3 order-2 sm:order-1">
            <p className="text-sm text-muted-foreground">
              Halaman <span className="font-medium text-foreground">{page}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tampil:</span>
              <Select value={String(limit)} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-20 h-8 text-sm bg-white/50 border-slate-200/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-slate-200/80 hover:bg-slate-50 flex-1 sm:flex-none"
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!notes || notes.length < limit}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-200/80 hover:bg-slate-50 flex-1 sm:flex-none"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      <NoteCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleNoteSuccess}
        tags={tags || []}
      />

      <NoteEditModal
        open={!!editingNote}
        onOpenChange={(open: boolean) => !open && setEditingNote(null)}
        note={editingNote}
        onSuccess={handleNoteSuccess}
        tags={tags || []}
      />

      <TagManagementModal
        open={isTagManagementOpen}
        onOpenChange={setIsTagManagementOpen}
        tags={tags || []}
        onTagChange={refetchTags}
      />
    </div>
  );
}