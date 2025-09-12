import { Card } from '@/components/ui/card';
import { Phone, Mail, HeadphonesIcon } from 'lucide-react';

export function ContactInfo() {
  return (
    <Card className="p-6 bg-gradient-to-br from-background to-primary/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <HeadphonesIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Help Center</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Support Phone</p>
            <p className="font-medium">+91 6377359642</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Support Email</p>
            <p className="font-medium">golutakhnd@gmail.com</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
        <p className="text-xs text-primary">
          Owner: YUGFMSEREG Team
        </p>
      </div>
    </Card>
  );
}