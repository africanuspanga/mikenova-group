"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Plus, X, Loader2 } from "lucide-react"
import { PageHeader, Badge, Spinner, EmptyState, Button, Card, inputClass, labelClass, Alert } from "../ui"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", sku: "", size: "", description: "", image_url: "" })

  async function load() {
    const res = await fetch("/api/hakiki/admin/products/")
    const data = await res.json()
    setProducts(data.products ?? [])
  }
  useEffect(() => { load() }, [])

  async function create() {
    setBusy(true); setError("")
    const res = await fetch("/api/hakiki/admin/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setError(data.error)
    setForm({ name: "", sku: "", size: "", description: "", image_url: "" })
    setAdding(false)
    load()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Products"
        subtitle="Every batch is produced against one of these."
        action={
          <Button onClick={() => setAdding((v) => !v)}>
            {adding ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New product</>}
          </Button>
        }
      />

      {adding && (
        <Card className="mb-5 p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">New product</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name *</label>
              <input className={inputClass} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Goddess Glow Body Cream" />
            </div>
            <div>
              <label className={labelClass}>SKU *</label>
              <input className={`${inputClass} uppercase`} value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="GG-CREAM-250" />
            </div>
            <div>
              <label className={labelClass}>Size</label>
              <input className={inputClass} value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="250ml" />
            </div>
            <div>
              <label className={labelClass}>Image URL</label>
              <input className={inputClass} value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="/goddess-glow/..." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} min-h-20`} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          {error && <div className="mt-4"><Alert tone="danger">{error}</Alert></div>}
          <Button className="mt-5" onClick={create} disabled={busy || !form.name || !form.sku}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Create product"}
          </Button>
        </Card>
      )}

      {products === null ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" body="Create the product you are about to manufacture, then open Batches to generate its authentication codes." />
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="flex gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No image</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                <p className="num mt-0.5 text-xs text-muted-foreground">{p.sku}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.size}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={p.is_active ? "success" : "neutral"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                  <Badge>{p.batches?.[0]?.count ?? 0} batches</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
