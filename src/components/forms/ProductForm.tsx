import { useState } from 'react';
import { Save, X, ScanLine } from 'lucide-react';
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner';
import { useSecureValidation, validators, sanitizers } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/components/products/ProductCard';
import { SecureForm } from '@/components/common/SecureForm';

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
  const [showScanner, setShowScanner] = useState(false);
  const { validateAndSanitize } = useSecureValidation();

  const handleSubmit = (data: any) => {
    // Validate and sanitize all inputs
    const nameValidation = validateAndSanitize('name', data.name, validators.name, sanitizers.text);
    const skuValidation = validateAndSanitize('SKU', data.sku, validators.sku, sanitizers.text, 'SKU must be 3-50 alphanumeric characters');
    const priceValidation = validateAndSanitize('price', Number(data.price), validators.price, sanitizers.number, 'Price must be between 0 and 999,999.99');
    const stockValidation = validateAndSanitize('stock', Number(data.stock), validators.quantity, sanitizers.number, 'Stock must be a positive integer');
    const thresholdValidation = validateAndSanitize('threshold', Number(data.lowStockThreshold), validators.quantity, sanitizers.number, 'Threshold must be a positive integer');

    if (!nameValidation.isValid || !skuValidation.isValid || !priceValidation.isValid || !stockValidation.isValid || !thresholdValidation.isValid) {
      return;
    }

    const sanitizedData = {
      name: nameValidation.value,
      description: sanitizers.text(data.description || ''),
      price: priceValidation.value,
      stock: stockValidation.value,
      category: sanitizers.text(data.category),
      sku: skuValidation.value,
      lowStockThreshold: thresholdValidation.value,
    };

    onSave({
      ...sanitizedData,
      ...(product?.id && { id: product.id }),
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Card className="glass-card border-white/10 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="gradient-text">
            {product ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SecureForm onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <div className="flex gap-2">
                  <Input
                    name="name"
                    id="name"
                    defaultValue={formData.name}
                    className="bg-surface-glass border-white/10"
                    placeholder="Enter product name or scan barcode"
                    maxLength={100}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowScanner(true)}
                    className="shrink-0"
                  >
                    <ScanLine className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  name="sku"
                  id="sku"
                  defaultValue={formData.sku}
                  className="bg-surface-glass border-white/10"
                  placeholder="e.g., PROD-001"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                id="description"
                defaultValue={formData.description}
                className="bg-surface-glass border-white/10"
                placeholder="Enter product description"
                maxLength={1000}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  name="price"
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999.99"
                  defaultValue={formData.price}
                  className="bg-surface-glass border-white/10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  name="stock"
                  id="stock"
                  type="number"
                  min="0"
                  max="99999"
                  defaultValue={formData.stock}
                  className="bg-surface-glass border-white/10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                <Input
                  name="lowStockThreshold"
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  max="9999"
                  defaultValue={formData.lowStockThreshold}
                  className="bg-surface-glass border-white/10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                name="category"
                id="category"
                defaultValue={formData.category}
                className="bg-surface-glass border-white/10"
                placeholder="e.g., Electronics, Clothing"
                maxLength={50}
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
          </SecureForm>
        </CardContent>
      </Card>

      {showScanner && (
        <BarcodeScanner
          onScan={(result) => {
            handleChange('name', result);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}