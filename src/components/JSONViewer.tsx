import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface JSONViewerProps {
  data: Record<string, any>;
  maskSecrets?: boolean;
}

export function JSONViewer({ data, maskSecrets = true }: JSONViewerProps) {
  const [copied, setCopied] = useState(false);

  const maskData = (obj: any): any => {
    if (!maskSecrets) return obj;

    const secretKeys = ['password', 'secret', 'token', 'key', 'credential', 'apiKey', 'clientSecret'];

    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(maskData);
    }

    const masked: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (secretKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
        masked[key] = '••••••••';
      } else if (typeof value === 'object') {
        masked[key] = maskData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  };

  const maskedData = maskData(data);
  const jsonString = JSON.stringify(maskedData, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10">
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre
        className="p-4 rounded-lg overflow-auto text-xs font-mono max-h-[600px]"
        style={{
          backgroundColor: 'var(--surface)',
          borderWidth: '1px',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
      >
        {jsonString}
      </pre>
    </div>
  );
}
