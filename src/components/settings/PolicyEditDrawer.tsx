import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../ui/drawer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { TriangleAlert as AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PolicyEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  warning?: string;
}

export function PolicyEditDrawer({ open, onOpenChange, title, children, onSave, warning }: PolicyEditDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Edit {title}</DrawerTitle>
          <DrawerDescription>Configure policy settings and requirements</DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          {warning && (
            <div className="mb-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">{warning}</p>
            </div>
          )}
          {children}
        </div>

        <DrawerFooter className="border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface MFAPolicyEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    requirement: string;
    factors: string[];
    gracePeriod: number;
    fallbackFactor: string;
  };
  onSave: (data: any) => void;
}

export function MFAPolicyEdit({ open, onOpenChange, initialData, onSave }: MFAPolicyEditProps) {
  const [data, setData] = useState(initialData);

  const handleSave = () => {
    onSave(data);
    toast.success('MFA policy updated');
    onOpenChange(false);
  };

  const warning =
    data.requirement === 'always' && data.gracePeriod < 7
      ? 'Short grace period may disrupt user onboarding'
      : undefined;

  return (
    <PolicyEditDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Multi-Factor Authentication"
      onSave={handleSave}
      warning={warning}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mfa-requirement">MFA Requirement</Label>
          <Select value={data.requirement} onValueChange={v => setData({ ...data, requirement: v })}>
            <SelectTrigger id="mfa-requirement">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never require</SelectItem>
              <SelectItem value="risk-based">Risk-based (recommended)</SelectItem>
              <SelectItem value="always">Always require</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">When users must complete MFA verification</p>
        </div>

        {data.requirement !== 'never' && (
          <>
            <div className="space-y-3">
              <Label>Allowed Factors</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="factor-totp"
                    checked={data.factors.includes('totp')}
                    onCheckedChange={checked => {
                      setData({
                        ...data,
                        factors: checked
                          ? [...data.factors, 'totp']
                          : data.factors.filter(f => f !== 'totp')
                      });
                    }}
                  />
                  <Label htmlFor="factor-totp" className="text-sm font-normal">
                    Authenticator App (TOTP)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="factor-push"
                    checked={data.factors.includes('push')}
                    onCheckedChange={checked => {
                      setData({
                        ...data,
                        factors: checked
                          ? [...data.factors, 'push']
                          : data.factors.filter(f => f !== 'push')
                      });
                    }}
                  />
                  <Label htmlFor="factor-push" className="text-sm font-normal">
                    Push Notification
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="factor-webauthn"
                    checked={data.factors.includes('webauthn')}
                    onCheckedChange={checked => {
                      setData({
                        ...data,
                        factors: checked
                          ? [...data.factors, 'webauthn']
                          : data.factors.filter(f => f !== 'webauthn')
                      });
                    }}
                  />
                  <Label htmlFor="factor-webauthn" className="text-sm font-normal">
                    Security Key (WebAuthn)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="factor-sms"
                    checked={data.factors.includes('sms')}
                    onCheckedChange={checked => {
                      setData({
                        ...data,
                        factors: checked
                          ? [...data.factors, 'sms']
                          : data.factors.filter(f => f !== 'sms')
                      });
                    }}
                  />
                  <Label htmlFor="factor-sms" className="text-sm font-normal">
                    SMS (not recommended)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grace-period">Enrollment Grace Period</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="grace-period"
                  type="number"
                  value={data.gracePeriod}
                  onChange={e => setData({ ...data, gracePeriod: parseInt(e.target.value) })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground">Time allowed for users to enroll their first MFA device</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fallback-factor">Fallback Factor</Label>
              <Select value={data.fallbackFactor} onValueChange={v => setData({ ...data, fallbackFactor: v })}>
                <SelectTrigger id="fallback-factor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="recovery-code">Recovery Code</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Backup method if primary factor is unavailable</p>
            </div>
          </>
        )}
      </div>
    </PolicyEditDrawer>
  );
}
