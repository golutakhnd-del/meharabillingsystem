import { Package, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  lowStockThreshold: number;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddToInvoice?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onAddToInvoice 
}: ProductCardProps) {
  const isLowStock = product.stock <= product.lowStockThreshold;

  return (
    <Card className="glass-card border-white/10 hover:shadow-glow transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(product)}
              className="h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(product.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold text-primary">₹{product.price}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock</p>
              <div className="flex items-center space-x-2">
                <p className={`text-lg font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                  {product.stock}
                </p>
                {isLowStock && <AlertTriangle className="w-4 h-4 text-destructive" />}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={isLowStock ? "destructive" : "secondary"}>
            {product.category}
          </Badge>
          {onAddToInvoice && (
            <Button
              size="sm"
              onClick={() => onAddToInvoice(product)}
              className="bg-gradient-primary text-white hover:opacity-90"
            >
              Add to Invoice
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}