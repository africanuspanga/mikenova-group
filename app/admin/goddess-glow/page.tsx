"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, LogOut, Package, ImageIcon, ArrowLeft, X, Upload, Edit2, Save, Eye } from "lucide-react"
import { getProducts, saveProducts, deleteProduct, isAuthenticated, logout, type Product } from "@/lib/products-store"

export default function AdminGoddessGlowPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    images: [] as string[],
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [] as string[],
  })

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/admin-login")
      return
    }

    // Load products
    setProducts(getProducts())
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/admin-login")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        if (isEdit) {
          setEditForm((prev) => ({
            ...prev,
            images: [...prev.images, imageUrl],
          }))
        } else {
          setNewProduct((prev) => ({
            ...prev,
            images: [...prev.images, imageUrl],
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    } else {
      setNewProduct((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    }
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      alert("Please fill in all fields")
      return
    }

    const price = Number.parseInt(newProduct.price)
    const product: Product = {
      id: `product-${Date.now()}`,
      name: newProduct.name,
      price: price,
      originalPrice: Math.round(price * 1.25), // 20% markup for "discount" display
      description: newProduct.description.slice(0, 120),
      images: newProduct.images.length > 0 ? newProduct.images : ["/placeholder.svg?height=400&width=400"],
    }

    const updatedProducts = [...products, product]
    setProducts(updatedProducts)
    saveProducts(updatedProducts)

    // Reset form
    setNewProduct({ name: "", price: "", description: "", images: [] })
    setIsAddingProduct(false)
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      images: product.images,
    })
  }

  const handleSaveEdit = (productId: string) => {
    if (!editForm.name || !editForm.price || !editForm.description) {
      alert("Please fill in all fields")
      return
    }

    const price = Number.parseInt(editForm.price)
    const updatedProducts = products.map((p) =>
      p.id === productId
        ? {
            ...p,
            name: editForm.name,
            price: price,
            originalPrice: Math.round(price * 1.25),
            description: editForm.description.slice(0, 120),
            images: editForm.images.length > 0 ? editForm.images : p.images,
          }
        : p,
    )

    setProducts(updatedProducts)
    saveProducts(updatedProducts)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B1A17] flex items-center justify-center">
        <div className="text-[#F0A500] text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1B1A17]">
      {/* Header */}
      <header className="bg-[#2A2925] border-b border-[#F0A500]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[#FAFAF8]/70 hover:text-[#F0A500] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Home</span>
            </Link>
            <div className="h-6 w-px bg-[#FAFAF8]/20" />
            <h1 className="text-lg sm:text-xl font-bold text-[#FAFAF8] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F0A500]" />
              <span className="hidden sm:inline">Goddess Glow</span> Admin
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/goddess-glow/" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="border-[#F0A500]/30 text-[#F0A500] hover:bg-[#F0A500]/10 bg-transparent"
              >
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">View Shop</span>
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-[#FAFAF8]/70 hover:text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card className="!bg-[#2A2925] border-[#F0A500]/20">
            <CardContent className="p-4">
              <p className="text-[#FAFAF8]/60 text-sm">Total Products</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#F0A500]">{products.length}</p>
            </CardContent>
          </Card>
          <Card className="!bg-[#2A2925] border-[#F0A500]/20">
            <CardContent className="p-4">
              <p className="text-[#FAFAF8]/60 text-sm">With Images</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#FAFAF8]">
                {products.filter((p) => p.images.length > 0).length}
              </p>
            </CardContent>
          </Card>
          <Card className="!bg-[#2A2925] border-[#F0A500]/20 col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-[#FAFAF8]/60 text-sm">Avg. Price</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#FAFAF8]">
                TZS {Math.round(products.reduce((a, p) => a + p.price, 0) / products.length || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Product Button */}
        {!isAddingProduct && (
          <Button
            onClick={() => setIsAddingProduct(true)}
            className="w-full sm:w-auto mb-6 bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        )}

        {/* Add Product Form */}
        {isAddingProduct && (
          <Card className="!bg-[#2A2925] border-[#F0A500]/20 mb-6 sm:mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-[#FAFAF8] flex items-center justify-between">
                <span>Add New Product</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingProduct(false)
                    setNewProduct({ name: "", price: "", description: "", images: [] })
                  }}
                  className="text-[#FAFAF8]/60 hover:text-[#FAFAF8]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#FAFAF8]/80">Product Name</label>
                  <Input
                    placeholder="e.g. Goddess Glow Serum"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8] placeholder:text-[#FAFAF8]/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#FAFAF8]/80">Price (TZS)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 45000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8] placeholder:text-[#FAFAF8]/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#FAFAF8]/80">
                  Description{" "}
                  <span className="text-[#FAFAF8]/40">({newProduct.description.length}/120 characters)</span>
                </label>
                <Textarea
                  placeholder="Brief product description..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value.slice(0, 120) })}
                  maxLength={120}
                  rows={2}
                  className="bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8] placeholder:text-[#FAFAF8]/40 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#FAFAF8]/80">Product Images</label>
                <div className="flex flex-wrap gap-3">
                  {newProduct.images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-[#F0A500]/30 rounded-lg flex flex-col items-center justify-center text-[#FAFAF8]/40 hover:border-[#F0A500] hover:text-[#F0A500] transition-colors"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddProduct}
                className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <Card key={product.id} className="!bg-[#2A2925] border-[#F0A500]/20 overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 sm:h-56 bg-[#1B1A17]">
                {product.images[0] ? (
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[#FAFAF8]/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-[#F0A500] text-[#1B1A17] text-xs font-bold px-2 py-1 rounded">
                  -20%
                </div>
              </div>

              <CardContent className="p-4">
                {editingProduct === product.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8]"
                    />
                    <Input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8]"
                    />
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value.slice(0, 120) })}
                      maxLength={120}
                      rows={2}
                      className="bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveEdit(product.id)}
                        size="sm"
                        className="flex-1 bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17]"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingProduct(null)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-[#FAFAF8]/20 text-[#FAFAF8]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <h3 className="font-semibold text-[#FAFAF8] mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-[#FAFAF8]/60 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#F0A500] font-bold">TZS {product.price.toLocaleString()}</span>
                      <span className="text-[#FAFAF8]/40 text-sm line-through">
                        TZS {product.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEdit(product)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-[#F0A500]/30 text-[#F0A500] hover:bg-[#F0A500]/10"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-[#FAFAF8]/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#FAFAF8] mb-2">No Products Yet</h3>
            <p className="text-[#FAFAF8]/60 mb-4">Add your first product to get started</p>
            <Button
              onClick={() => setIsAddingProduct(true)}
              className="bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
