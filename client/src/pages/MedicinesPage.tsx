import { useState } from 'react';
import { Plus, Search, Pill } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { useMedicines } from '@/features/medicines/hooks/useMedicines';
import MedicineCard from '@/features/medicines/components/MedicineCard';
import MedicineForm from '@/features/medicines/components/MedicineForm';

export default function MedicinesPage() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data, isLoading } = useMedicines();
  const medicines = data?.data ?? [];

  const filtered = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.dosage.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && m.isActive) ||
      (filter === 'inactive' && !m.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medicines</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} total
          </p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} /> Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent
            title="Add New Medicine"
            description="Fill in the details of the medicine you want to track."
          >
            <MedicineForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex rounded-md border border-border overflow-hidden shrink-0">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Pill size={36} className="text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {search ? 'No medicines found' : 'No medicines yet'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {search ? 'Try a different search term' : 'Add your first medicine to get started'}
            </p>
          </div>
          {!search && (
            <Button onClick={() => setAddOpen(true)} variant="outline" size="sm">
              <Plus size={14} /> Add Medicine
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((medicine) => (
            <MedicineCard key={medicine.id} medicine={medicine} />
          ))}
        </div>
      )}
    </div>
  );
}
