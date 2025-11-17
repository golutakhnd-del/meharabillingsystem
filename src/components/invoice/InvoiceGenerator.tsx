import { useState } from 'react';
import { Plus, Minus, Download, Send, User, Building, Save, RotateCcw, RefreshCw } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useInvoices } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/components/products/ProductCard';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface InvoiceItem {
  product: Product;
  quantity: number;
  customPrice?: number;
}

interface InvoiceGeneratorProps {
  selectedProducts: Product[];
  onClear: () => void;
  onUpdateStock: (productId: string, quantity: number) => void;
}

export default function InvoiceGenerator({ selectedProducts, onClear, onUpdateStock }: InvoiceGeneratorProps) {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    selectedProducts.map(product => ({ product, quantity: 1 }))
  );
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  
  const { settings: companySettings, loading: loadingSettings, saveSettings, setSettings: setCompanySettings } = useCompanySettings();
  const { addInvoice } = useInvoices();
  const { toast } = useToast();

  const companyDetails = {
    name: companySettings.company_name,
    address: companySettings.company_address,
    phone: companySettings.company_phone,
    email: companySettings.company_email,
    gst: companySettings.company_gst,
  };

  const invoiceSettings = {
    taxRate: companySettings.tax_rate,
    currency: companySettings.currency,
    invoicePrefix: companySettings.invoice_prefix,
    gstRate: companySettings.gst_rate,
  };

  const setCompanyDetails = (details: typeof companyDetails) => {
    setCompanySettings({
      company_name: details.name,
      company_address: details.address,
      company_phone: details.phone,
      company_email: details.email,
      company_gst: details.gst,
      currency: companySettings.currency,
      invoice_prefix: companySettings.invoice_prefix,
      tax_rate: companySettings.tax_rate,
      gst_rate: companySettings.gst_rate,
    });
  };

  const setInvoiceSettings = (settings: typeof invoiceSettings) => {
    setCompanySettings({
      company_name: companySettings.company_name,
      company_address: companySettings.company_address,
      company_phone: companySettings.company_phone,
      company_email: companySettings.company_email,
      company_gst: companySettings.company_gst,
      currency: settings.currency,
      invoice_prefix: settings.invoicePrefix,
      tax_rate: settings.taxRate,
      gst_rate: settings.gstRate,
    });
  };

  const saveCompanyDetails = () => {
    saveSettings({
      company_name: companyDetails.name,
      company_address: companyDetails.address,
      company_phone: companyDetails.phone,
      company_email: companyDetails.email,
      company_gst: companyDetails.gst,
    });
  };

  const resetCompanyDetails = () => {
    setCompanyDetails({
      name: 'YUGFMSEREG',
      address: '',
      phone: '',
      email: '',
      gst: ''
    });
    toast({
      title: "Company details reset",
      description: "Company information has been reset to default.",
    });
  };

  const resetPrices = () => {
    setInvoiceItems(items =>
      items.map(item => ({
        ...item,
        quantity: 1
      }))
    );
    toast({
      title: "Prices reset",
      description: "All item quantities have been reset to 1.",
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setInvoiceItems(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const updatePrice = (productId: string, newPrice: number) => {
    if (newPrice < 0 || newPrice > 999999.99 || !Number.isFinite(newPrice)) {
      toast({
        title: "Invalid Price",
        description: "Price must be between ₹0 and ₹999,999.99",
        variant: "destructive",
      });
      return;
    }

    setInvoiceItems(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, customPrice: newPrice }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setInvoiceItems(items => items.filter(item => item.product.id !== productId));
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + ((item.customPrice ?? item.product.price) * item.quantity), 0);
  const gstAmount = (subtotal * invoiceSettings.gstRate) / 100;
  const total = subtotal + gstAmount;

  const generatePDF = async () => {
    if (!customerDetails.name.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter customer name before generating invoice",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const invoiceNumber = `${invoiceSettings.invoicePrefix}-${Date.now().toString().slice(-6)}`;

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 220, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(invoiceNumber, 105, 30, { align: 'center' });

    // Company Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(companyDetails.name, 20, 55);
    doc.setFontSize(10);
    doc.text(companyDetails.address, 20, 65);
    doc.text(`Phone: ${companyDetails.phone}`, 20, 72);
    doc.text(`Email: ${companyDetails.email}`, 20, 79);
    doc.text(`GST: ${companyDetails.gst}`, 20, 86);

    // Customer Details
    doc.setFontSize(14);
    doc.text('Bill To:', 120, 55);
    doc.setFontSize(10);
    doc.text(customerDetails.name, 120, 65);
    if (customerDetails.email) doc.text(customerDetails.email, 120, 72);
    if (customerDetails.phone) doc.text(customerDetails.phone, 120, 79);
    if (customerDetails.address) doc.text(customerDetails.address, 120, 86);

    // Date
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 100);

    // Items Table
    let yPos = 115;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, yPos);
    doc.text('Qty', 100, yPos);
    doc.text('Price', 130, yPos);
    doc.text('Amount', 165, yPos);

    yPos += 7;
    doc.line(20, yPos, 190, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    invoiceItems.forEach((item) => {
      const price = item.customPrice ?? item.product.price;
      const amount = price * item.quantity;
      
      doc.text(item.product.name, 20, yPos);
      doc.text(item.quantity.toString(), 100, yPos);
      doc.text(`${invoiceSettings.currency}${price.toFixed(2)}`, 130, yPos);
      doc.text(`${invoiceSettings.currency}${amount.toFixed(2)}`, 165, yPos);
      yPos += 7;
    });

    // Totals
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.text('Subtotal:', 130, yPos);
    doc.text(`${invoiceSettings.currency}${subtotal.toFixed(2)}`, 165, yPos);
    yPos += 7;

    doc.text(`GST (${invoiceSettings.gstRate}%):`, 130, yPos);
    doc.text(`${invoiceSettings.currency}${gstAmount.toFixed(2)}`, 165, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 130, yPos);
    doc.text(`${invoiceSettings.currency}${total.toFixed(2)}`, 165, yPos);

    // Save invoice to database
    try {
      await addInvoice({
        invoice_number: invoiceNumber,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email || null,
        customer_phone: customerDetails.phone || null,
        customer_address: customerDetails.address || null,
        total,
        gst_amount: gstAmount,
        subtotal,
        items: invoiceItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.customPrice ?? item.product.price,
        })),
        company_name: companyDetails.name,
        company_email: companyDetails.email,
        company_phone: companyDetails.phone,
        company_address: companyDetails.address,
        company_gst: companyDetails.gst,
      });
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }

    // Update stock for each item
    invoiceItems.forEach(item => {
      onUpdateStock(item.product.id, item.quantity);
    });

    doc.save(`${invoiceNumber}.pdf`);
    
    toast({
      title: "Invoice Generated!",
      description: `Invoice ${invoiceNumber} has been created and downloaded`,
    });

    // Reset form
    setCustomerDetails({ name: '', email: '', address: '', phone: '' });
    onClear();
  };

  if (loadingSettings) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 gradient-text">
          <Send className="w-5 h-5" />
          Generate Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Details Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company Details
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetCompanyDetails}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={saveCompanyDetails}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyDetails.name}
                onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={companyDetails.email}
                onChange={(e) => setCompanyDetails({ ...companyDetails, email: e.target.value })}
                placeholder="company@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone</Label>
              <Input
                id="company-phone"
                value={companyDetails.phone}
                onChange={(e) => setCompanyDetails({ ...companyDetails, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-gst">GST Number</Label>
              <Input
                id="company-gst"
                value={companyDetails.gst}
                onChange={(e) => setCompanyDetails({ ...companyDetails, gst: e.target.value })}
                placeholder="GST123456789"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-address">Address</Label>
              <Input
                id="company-address"
                value={companyDetails.address}
                onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                placeholder="Business Address"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoice Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Invoice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
              <Input
                id="invoice-prefix"
                value={invoiceSettings.invoicePrefix}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                placeholder="INV"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency Symbol</Label>
              <Input
                id="currency"
                value={invoiceSettings.currency}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, currency: e.target.value })}
                placeholder="₹"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst-rate">GST Rate (%)</Label>
              <Input
                id="gst-rate"
                type="number"
                value={invoiceSettings.gstRate}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, gstRate: parseFloat(e.target.value) || 0 })}
                placeholder="18"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Customer Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name *</Label>
              <Input
                id="customer-name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                placeholder="Customer Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-address">Address</Label>
              <Input
                id="customer-address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                placeholder="Customer Address"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoice Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Invoice Items</h3>
            <Button variant="outline" size="sm" onClick={resetPrices}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset Quantities
            </Button>
          </div>

          <div className="space-y-3">
            {invoiceItems.map((item) => (
              <div key={item.product.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoiceSettings.currency}{(item.customPrice ?? item.product.price).toFixed(2)} × {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={item.customPrice ?? item.product.price}
                    onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value))}
                    className="w-24"
                    step="0.01"
                    min="0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Minus className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{invoiceSettings.currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>GST ({invoiceSettings.gstRate}%):</span>
            <span>{invoiceSettings.currency}{gstAmount.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="gradient-text">{invoiceSettings.currency}{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={generatePDF} className="flex-1" disabled={invoiceItems.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
