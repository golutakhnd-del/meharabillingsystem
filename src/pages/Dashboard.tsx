import { useState, useMemo, useEffect } from 'react';
import { Package, DollarSign, ShoppingCart, AlertTriangle, Plus, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/dashboard/StatsCard';
import ProductCard, { Product } from '@/components/products/ProductCard';
import ProductForm from '@/components/forms/ProductForm';
import InvoiceGenerator from '@/components/invoice/InvoiceGenerator';
import InvoiceHistory from '@/components/invoice/InvoiceHistory';
import { ContactInfo } from '@/components/support/ContactInfo';
import CustomerManager from '@/components/customers/CustomerManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Scene3D from '@/components/3d/Scene3D';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isDemoMode } from '@/components/layout/ProtectedRoute';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Demo sample products
const DEMO_PRODUCTS: Product[] = [
  { id: 'demo-1', name: 'Samsung Galaxy S24', price: 79999, stock: 25, category: 'Mobile', sku: 'SAM-S24-001', lowStockThreshold: 10, description: 'Latest Samsung flagship' },
  { id: 'demo-2', name: 'iPhone 15 Pro', price: 134900, stock: 15, category: 'Mobile', sku: 'APL-IP15-001', lowStockThreshold: 10, description: 'Apple flagship phone' },
  { id: 'demo-3', name: 'OnePlus 12', price: 64999, stock: 30, category: 'Mobile', sku: 'OP-12-001', lowStockThreshold: 10, description: 'OnePlus flagship' },
  { id: 'demo-4', name: 'Sony WH-1000XM5', price: 29990, stock: 8, category: 'Audio', sku: 'SNY-WH5-001', lowStockThreshold: 10, description: 'Premium headphones' },
  { id: 'demo-5', name: 'MacBook Air M3', price: 114900, stock: 12, category: 'Laptop', sku: 'APL-MBA-M3', lowStockThreshold: 10, description: 'Apple laptop' },
  { id: 'demo-6', name: 'iPad Pro 12.9"', price: 112900, stock: 5, category: 'Tablet', sku: 'APL-IPAD-001', lowStockThreshold: 10, description: 'Professional tablet' },
];

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const demoMode = isDemoMode();

  // Fetch products from database or use demo data
  useEffect(() => {
    const fetchProducts = async () => {
      // If demo mode, use sample data
      if (demoMode) {
        setProducts(DEMO_PRODUCTS);
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProducts(DEMO_PRODUCTS);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedProducts: Product[] = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          stock: p.stock,
          category: p.category || '',
          sku: p.barcode || '',
          lowStockThreshold: 10,
          description: ''
        }));

        setProducts(formattedProducts.length > 0 ? formattedProducts : DEMO_PRODUCTS);
      } catch (error: any) {
        toast({
          title: "Error loading products",
          description: error.message,
          variant: "destructive",
        });
        setProducts(DEMO_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast, demoMode]);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockItems = products.filter(product => product.stock <= product.lowStockThreshold).length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      totalStock,
    };
  }, [products]);

  const handleSaveProduct = async (productData: Omit<Product, 'id'> & { id?: string }) => {
    // Demo mode - just update local state
    if (demoMode) {
      if (productData.id) {
        setProducts(prev => prev.map(p => 
          p.id === productData.id ? { ...productData, id: productData.id } : p
        ));
        toast({ title: "Product updated (Demo Mode)", description: "Changes are temporary in demo mode" });
      } else {
        const newProduct: Product = {
          ...productData,
          id: `demo-${Date.now()}`,
          lowStockThreshold: productData.lowStockThreshold || 10,
          description: productData.description || ''
        };
        setProducts(prev => [...prev, newProduct]);
        toast({ title: "Product added (Demo Mode)", description: "Changes are temporary in demo mode" });
      }
      setShowProductForm(false);
      setEditingProduct(null);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage products",
          variant: "destructive",
        });
        return;
      }

      if (productData.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: productData.name,
            price: productData.price,
            stock: productData.stock,
            category: productData.category,
            barcode: productData.sku,
          })
          .eq('id', productData.id);

        if (error) throw error;

        setProducts(prev => prev.map(p => 
          p.id === productData.id ? { ...productData, id: productData.id } : p
        ));

        toast({
          title: "Product updated",
          description: "Product has been updated successfully",
        });
      } else {
        // Add new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            user_id: user.id,
            name: productData.name,
            price: productData.price,
            stock: productData.stock,
            category: productData.category,
            barcode: productData.sku,
          })
          .select()
          .single();

        if (error) throw error;

        const newProduct: Product = {
          id: data.id,
          name: data.name,
          price: Number(data.price),
          stock: data.stock,
          category: data.category || '',
          sku: data.barcode || '',
          lowStockThreshold: 10,
          description: ''
        };

        setProducts(prev => [...prev, newProduct]);

        toast({
          title: "Product added",
          description: "Product has been added successfully",
        });
      }

      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    // Demo mode - just update local state
    if (demoMode) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product deleted (Demo Mode)", description: "Changes are temporary in demo mode" });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));

      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddToInvoice = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product]);
    }
    setActiveTab('invoice');
  };

  const handleClearInvoice = () => {
    setSelectedProducts([]);
  };

  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const newStock = Math.max(0, product.stock - quantity);

      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ));
    } catch (error: any) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Background 3D Scene */}
        <div className="fixed inset-0 opacity-20 pointer-events-none">
          <Scene3D enableControls={true} />
        </div>
        
        <main className="relative z-10 container mx-auto px-4 py-6">
          <Header onSearch={setSearchQuery} />

          {/* Demo Mode Banner */}
          {demoMode && (
            <Alert className="mb-6 border-primary/50 bg-primary/10">
              <AlertDescription className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-sm">
                  👁️ <strong>Demo Mode</strong> - You're viewing sample data. Sign in for full access!
                </span>
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-primary"
                >
                  Sign In Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass-card border-white/10">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Products"
                  value={stats.totalProducts}
                  icon={Package}
                  color="#06b6d4"
                />
                <StatsCard
                  title="Inventory Value"
                  value={`₹${stats.totalValue.toLocaleString()}`}
                  icon={DollarSign}
                  color="#10b981"
                />
                <StatsCard
                  title="Total Stock"
                  value={stats.totalStock}
                  icon={ShoppingCart}
                  color="#3b82f6"
                />
                <StatsCard
                  title="Low Stock Alerts"
                  value={stats.lowStockItems}
                  icon={AlertTriangle}
                  color="#f59e0b"
                />
              </div>

              {/* Recent Products */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold gradient-text">Recent Products</h2>
                  <Button 
                    onClick={() => setActiveTab('products')}
                    className="bg-gradient-primary"
                  >
                    View All Products
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onAddToInvoice={handleAddToInvoice}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {showProductForm ? (
                <ProductForm
                  product={editingProduct || undefined}
                  onSave={handleSaveProduct}
                  onCancel={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold gradient-text">Product Management</h2>
                    <Button 
                      onClick={() => setShowProductForm(true)}
                      className="bg-gradient-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onAddToInvoice={handleAddToInvoice}
                      />
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No products found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search query' : 'Add your first product to get started'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <CustomerManager />
            </TabsContent>

            <TabsContent value="invoice" className="space-y-6">
              {selectedProducts.length > 0 ? (
                <div className="relative">
                  {/* 3D Invoice Container */}
                  <div className="glass-card border-white/10 shadow-elegant transform perspective-1000 hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
                    <div className="relative z-10">
                      <InvoiceGenerator
                        selectedProducts={selectedProducts}
                        onClear={handleClearInvoice}
                        onUpdateStock={handleUpdateStock}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Add products to your invoice to get started
                  </p>
                  <Button 
                    onClick={() => setActiveTab('products')}
                    className="bg-gradient-primary"
                  >
                    Browse Products
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <InvoiceHistory />
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="max-w-md mx-auto">
                <ContactInfo />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}