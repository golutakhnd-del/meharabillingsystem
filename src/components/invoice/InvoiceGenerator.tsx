import { useState } from 'react';
import { Plus, Minus, Download, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/components/products/ProductCard';
import jsPDF from 'jspdf';

interface InvoiceItem {
  product: Product;
  quantity: number;
}

interface InvoiceGeneratorProps {
  selectedProducts: Product[];
  onClear: () => void;
}

export default function InvoiceGenerator({ selectedProducts, onClear }: InvoiceGeneratorProps) {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    selectedProducts.map(product => ({ product, quantity: 1 }))
  );
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });

  const updateQuantity = (productId: string, change: number) => {
    setInvoiceItems(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setInvoiceItems(items => items.filter(item => item.product.id !== productId));
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 20, 20);
    doc.setFontSize(12);
    doc.text('BillCraft Pro', 20, 35);
    doc.text(`Invoice #: INV-${Date.now()}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);

    // Customer Details
    doc.text('Bill To:', 20, 75);
    doc.text(customerDetails.name, 20, 85);
    doc.text(customerDetails.email, 20, 95);
    doc.text(customerDetails.address, 20, 105);

    // Items
    let yPos = 125;
    doc.text('Items:', 20, yPos);
    yPos += 15;

    invoiceItems.forEach(item => {
      doc.text(`${item.product.name} x ${item.quantity}`, 20, yPos);
      doc.text(`₹${(item.product.price * item.quantity).toFixed(2)}`, 150, yPos);
      yPos += 10;
    });

    // Totals
    yPos += 10;
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 20, yPos);
    doc.text(`Tax (18%): ₹${tax.toFixed(2)}`, 20, yPos + 10);
    doc.text(`Total: ₹${total.toFixed(2)}`, 20, yPos + 20);

    doc.save(`invoice-${Date.now()}.pdf`);
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="gradient-text">Invoice Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerDetails.name}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
              className="bg-surface-glass border-white/10"
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerDetails.email}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
              className="bg-surface-glass border-white/10"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              value={customerDetails.phone}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-surface-glass border-white/10"
            />
          </div>
          <div>
            <Label htmlFor="customerAddress">Address</Label>
            <Input
              id="customerAddress"
              value={customerDetails.address}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
              className="bg-surface-glass border-white/10"
            />
          </div>
        </div>

        <Separator />

        {/* Invoice Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Items</h3>
          {invoiceItems.map(item => (
            <div key={item.product.id} className="flex items-center justify-between p-4 bg-surface-glass rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-muted-foreground">₹{item.product.price} each</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product.id, -1)}
                  className="h-8 w-8"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product.id, 1)}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="w-20 text-right font-medium">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.product.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (18%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span className="text-primary">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button onClick={generatePDF} className="flex-1 bg-gradient-primary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={onClear} className="flex-1">
            Clear Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}