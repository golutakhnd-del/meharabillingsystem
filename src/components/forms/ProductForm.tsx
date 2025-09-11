import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/components/products/ProductCard';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || '',
    sku: product?.sku || '',
    lowStockThreshold: product?.lowStockThreshold || 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(product?.id && { id: product.id }),
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="glass-card border-white/10 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="gradient-text">
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="bg-surface-glass border-white/10"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="bg-surface-glass border-white/10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="bg-surface-glass border-white/10"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className="bg-surface-glass border-white/10"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                className="bg-surface-glass border-white/10"
                required
              />
            </div>
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                className="bg-surface-glass border-white/10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="bg-surface-glass border-white/10"
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {product ? 'Update Product' : 'Add Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}