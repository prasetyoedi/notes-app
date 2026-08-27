'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Plus, Search, Filter, Calendar, X,
  Archive, RotateCcw, Trash2, Edit3, FileText, Tag, Pin
} from 'lucide-react';
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
  is_archived: boolean;
  is_pinned: boolean;
}

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showArchived, setShowArchived] = useState(false);
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
    queryKey: ['notes', page, limit, search, tagFilter, startDate, endDate, showArchived],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (tagFilter) params.append('tags', tagFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('isArchived', String(showArchived));

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
    if (!confirm('Yakin ingin menghapus catatan ini secara permanen?')) return;
    try {
      await fetchData(`/notes/${id}`, { method: 'DELETE' });
      toast.success('Catatan berhasil dihapus');
      refetchNotes();
    } catch (err) {
      toast.error('Gagal menghapus catatan');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await fetchData(`/notes/${id}/archive`, { method: 'PUT' });
      toast.success('Catatan diarsipkan');
      refetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengarsipkan catatan');
    }
  };

  const handleUnarchive = async (id: number) => {
    try {
      await fetchData(`/notes/${id}/unarchive`, { method: 'PUT' });
      toast.success('Catatan dikembalikan');
      refetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengembalikan catatan');
    }
  };

  const handlePin = async (id: number) => {
    try {
      await fetchData(`/notes/${id}/pin`, { method: 'PUT' });
      toast.success('Catatan di-pin');
      refetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Gagal pin catatan');
    }
  };

  const handleUnpin = async (id: number) => {
    try {
      await fetchData(`/notes/${id}/unpin`, { method: 'PUT' });
      toast.success('Catatan di-unpin');
      refetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Gagal unpin catatan');
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!confirm('Hapus tag ini? Semua relasi ke catatan akan dihapus.')) return;
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

  const toggleArchive = () => {
    setShowArchived(!showArchived);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-zinc-200">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-1.5 mt-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter className="border-t border-zinc-100 pt-4 flex justify-between">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
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
      <div className="min-h-screen bg-zinc-50/50 flex flex-col items-center justify-center p-4 text-center">
        <div className="rounded-full bg-red-50 p-4 mb-4 ring-1 ring-red-100">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900">Gagal memuat data</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm">
          {(error as Error).message || 'Terjadi kesalahan saat mengambil data dari server.'}
        </p>
        <Button variant="outline" className="mt-6 border-zinc-300" onClick={() => refetchNotes()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            {showArchived ? <Archive className="h-7 w-7 text-zinc-500" /> : <FileText className="h-7 w-7 text-indigo-600" />}
            {showArchived ? 'Arsip Catatan' : 'Catatan Saya'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {showArchived
              ? 'Kelola catatan yang telah Anda arsipkan.'
              : 'Kelola, atur, dan temukan catatan Anda dengan mudah.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTagManagementOpen(true)}
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
          >
            <Tag className="mr-2 h-4 w-4" />
            Kelola Tag
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Buat Catatan
          </Button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari judul atau konten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-zinc-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isTagsLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <Select value={tagFilter} onValueChange={(v) => setTagFilter(v || '')}>
              <SelectTrigger className="w-full lg:w-48 border-zinc-200 bg-white focus:ring-indigo-500/20">
                <SelectValue>
                  {tagFilter ? (
                    <span className="flex items-center gap-1.5 text-indigo-700 font-medium">
                      <Tag className="h-3.5 w-3.5" />
                      {tags?.find((t) => String(t.id) === tagFilter)?.name}
                    </span>
                  ) : (
                    <span className="text-zinc-500">Semua Tag</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Tag</SelectItem>
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        {tag.name}
                      </span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-3 text-sm text-zinc-500 text-center">
                    Belum ada tag
                  </div>
                )}
              </SelectContent>
            </Select>
          )}

          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={toggleArchive}
            className={`lg:w-auto transition-all ${showArchived
              ? 'bg-zinc-800 text-white hover:bg-zinc-900'
              : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
          >
            {showArchived ? <RotateCcw className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
            {showArchived ? 'Tampilkan Aktif' : 'Lihat Arsip'}
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            {(tagFilter || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-zinc-500 hover:text-red-600 hover:bg-red-50"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            <Button
              variant={isFilterOpen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="text-zinc-600"
            >
              <Filter className="mr-1.5 h-4 w-4" />
              Filter Tanggal
            </Button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tanggal Mulai</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 border-zinc-200 focus-visible:ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tanggal Akhir</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 border-zinc-200 focus-visible:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {notes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <div className="rounded-full bg-zinc-100 p-4 mb-4">
            {showArchived ? <Archive className="h-8 w-8 text-zinc-400" /> : <FileText className="h-8 w-8 text-zinc-400" />}
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">
            {showArchived ? 'Belum ada catatan di arsip' : 'Belum ada catatan'}
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mt-2 mb-6">
            {showArchived
              ? 'Catatan yang Anda arsipkan akan muncul di sini agar tidak mengganggu tampilan utama.'
              : 'Mulai buat catatan pertama Anda dengan mengklik tombol "Buat Catatan" di atas.'}
          </p>
          {!showArchived && (
            <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Plus className="mr-2 h-4 w-4" />
              Buat Catatan Sekarang
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes?.map((note) => (
            <Card
              key={note.id}
              className="group flex flex-col overflow-hidden border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200/60 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-semibold text-zinc-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {note.title}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {note.tags.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">Tanpa tag</span>
                  ) : (
                    note.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 text-xs font-medium px-2 py-0.5"
                      >
                        {tag.name}
                      </Badge>
                    ))
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-zinc-600 line-clamp-3 leading-relaxed">
                  {note.content || (
                    <span className="italic text-zinc-400">Tidak ada konten...</span>
                  )}
                </p>
              </CardContent>

              <CardFooter className="flex flex-wrap justify-between items-center border-t border-zinc-100 pt-4 text-xs text-zinc-500 gap-3 bg-zinc-50/30">
                <span className="flex items-center gap-1.5 font-medium flex-wrap">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  {format(new Date(note.created_at), 'dd MMM yyyy', { locale: id })}

                  <div className="flex gap-1.5">
                    {note.is_archived && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[10px] px-1.5 py-0">
                        <Archive className="mr-1 h-3 w-3" /> Arsip
                      </Badge>
                    )}
                  </div>
                </span>

                <div className="flex items-center gap-1 opacity-100">
                  {!note.is_archived ? (
                    <>
                      {!note.is_pinned ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePin(note.id)}
                          className="h-8 w-8 text-zinc-500 hover:text-purple-600 hover:bg-purple-50"
                          title="Pin catatan"
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnpin(note.id)}
                          className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                          title="Unpin catatan"
                        >
                          <Pin className="h-4 w-4 fill-purple-600" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleArchive(note.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-amber-600 hover:bg-amber-50"
                        title="Arsipkan"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingNote(note)}
                        className="h-8 w-8 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnarchive(note.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Kembalikan"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50"
                        title="Hapus Permanen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {notes && notes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-200">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <p className="text-sm text-zinc-500">
              Halaman <span className="font-semibold text-zinc-900">{page}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Tampil:</span>
              <Select value={String(limit)} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-20 h-8 text-sm border-zinc-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
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
              className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!notes || notes.length < limit}
              onClick={() => setPage((p) => p + 1)}
              className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
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