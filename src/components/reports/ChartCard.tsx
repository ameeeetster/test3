import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MoveVertical as MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onExport?: () => void;
  onFullscreen?: () => void;
  className?: string;
}

export function ChartCard({ title, subtitle, children, onExport, onFullscreen, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onFullscreen && <DropdownMenuItem onClick={onFullscreen}>View Fullscreen</DropdownMenuItem>}
            {onExport && <DropdownMenuItem onClick={onExport}>Export Data</DropdownMenuItem>}
            <DropdownMenuItem>Add to Dashboard</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
