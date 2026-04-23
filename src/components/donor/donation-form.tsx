'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Package,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  Send,
  LeafyGreen,
} from 'lucide-react';

const categories = [
  { value: 'cooked_meals', label: 'Cooked Meals' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'fresh_produce', label: 'Fresh Produce' },
  { value: 'packaged', label: 'Packaged' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'other', label: 'Other' },
];

const urgencyLevels = [
  { value: 'low', label: 'Low — flexible timing' },
  { value: 'medium', label: 'Medium — within a few hours' },
  { value: 'high', label: 'High — urgent pickup needed' },
];

export function DonationForm({ donorArea }: { donorArea?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    foodType: '',
    quantity: '',
    unit: 'kg',
    urgency: 'medium',
    locationName: donorArea || '',
    pickupStart: '',
    pickupEnd: '',
    notes: '',
    isVegetarian: false,
  });

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          donation: {
            ...form,
            quantity: Number(form.quantity),
          },
        }),
      });

      if (res.ok) {
        toast.success('Donation created!', {
          description: 'AI is now matching your donation with nearby NGOs.',
        });
        router.push('/dashboard/donor');
        router.refresh();
      } else {
        toast.error('Failed to create donation');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-fb-surface-container transition-colors text-fb-on-surface-variant"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-fb-on-surface">
            Create Donation
          </h1>
          <p className="text-sm text-fb-on-surface-variant mt-0.5">
            Describe your surplus food for AI-powered matching
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== FORM ===== */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-[family-name:var(--font-heading)] font-semibold flex items-center gap-2 text-fb-on-surface">
                <Package className="w-4 h-4 text-fb-outline" />
                Food Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-fb-on-surface">Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="e.g. Leftover pasta from lunch service"
                  required
                  className="bg-fb-surface-container border-fb-outline-variant/40 focus:ring-[#2D6A4F]/30 rounded-xl h-11"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-fb-on-surface">Category</Label>
                  <Select value={form.category} onValueChange={(v) => update('category', v)}>
                    <SelectTrigger className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-fb-on-surface">Food Type</Label>
                  <Input
                    value={form.foodType}
                    onChange={(e) => update('foodType', e.target.value)}
                    placeholder="e.g. Pasta, Rice, Sandwiches"
                    className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-fb-on-surface">Quantity</Label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    placeholder="Amount"
                    required
                    min={1}
                    className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-fb-on-surface">Unit</Label>
                  <Select value={form.unit} onValueChange={(v) => update('unit', v)}>
                    <SelectTrigger className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="portions">Portions</SelectItem>
                      <SelectItem value="litres">Litres</SelectItem>
                      <SelectItem value="items">Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <Label className="text-sm font-medium text-fb-on-surface flex items-center gap-2">
                  <LeafyGreen className="w-4 h-4 text-emerald-500" />
                  Vegetarian
                </Label>
                <Switch
                  checked={form.isVegetarian}
                  onCheckedChange={(v) => update('isVegetarian', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-[family-name:var(--font-heading)] font-semibold flex items-center gap-2 text-fb-on-surface">
                <MapPin className="w-4 h-4 text-fb-outline" />
                Pickup Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-fb-on-surface">Pickup Location</Label>
                <Input
                  value={form.locationName}
                  onChange={(e) => update('locationName', e.target.value)}
                  placeholder="e.g. 123 High Street, London"
                  required
                  className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-fb-on-surface flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-fb-outline" />
                    Window Start
                  </Label>
                  <Input
                    type="time"
                    value={form.pickupStart}
                    onChange={(e) => update('pickupStart', e.target.value)}
                    required
                    className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-fb-on-surface flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-fb-outline" />
                    Window End
                  </Label>
                  <Input
                    type="time"
                    value={form.pickupEnd}
                    onChange={(e) => update('pickupEnd', e.target.value)}
                    required
                    className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-fb-on-surface">Urgency</Label>
                <Select value={form.urgency} onValueChange={(v) => update('urgency', v)}>
                  <SelectTrigger className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-fb-on-surface">Notes (optional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Allergens, storage requirements, access instructions…"
                  rows={3}
                  className="bg-fb-surface-container border-fb-outline-variant/40 rounded-xl resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading || !form.title || !form.category || !form.quantity}
            className="w-full h-12 rounded-xl gap-2 bg-[#2D6A4F] hover:bg-[#245a43] text-white font-semibold shadow-ambient-2 hover:shadow-ambient-3 transition-all text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Create Donation
              </>
            )}
          </Button>
        </form>

        {/* ===== AI INSIGHTS SIDEBAR ===== */}
        <div className="space-y-4">
          <Card className="border-[#2D6A4F]/20 bg-gradient-to-br from-[#b1f0ce]/10 to-[#e1e6c2]/10 shadow-ambient-1 sticky top-6">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2D6A4F]">AI Tips</p>
                  <p className="text-[11px] text-fb-outline">Auto-generated suggestions</p>
                </div>
              </div>
              <div className="space-y-3">
                <TipItem text={'Specific titles like "Vegetable biryani \u2014 20 portions" get matched 2x faster.'} />
                <TipItem text="Cooked meals and bakery items have the highest acceptance rate in your area." />
                <TipItem text="Morning pickup windows (9-11 AM) see 40% faster NGO response times." />
                <TipItem text="Adding allergen info in notes increases match quality scores by 15%." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mt-2 shrink-0" />
      <p className="text-sm text-fb-on-surface-variant leading-relaxed">{text}</p>
    </div>
  );
}
