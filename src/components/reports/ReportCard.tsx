import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Play, CreditCard as Edit, Share2, Calendar, Download, MoveVertical as MoreVertical, Clock } from 'lucide-react';

interface ReportCardProps {
  name: string;
  description?: string;
  tags?: string[];
  owner: { name: string; avatar: string };
  lastRun?: string;
  scheduled?: string;
  sparklineData?: number[];
  onRun?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onSchedule?: () => void;
  onExport?: () => void;
}

export function ReportCard({
  name,
  description,
  tags,
  owner,
  lastRun,
  scheduled,
  sparklineData,
  onRun,
  onEdit,
  onShare,
  onSchedule,
  onExport
}: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 truncate">{name}</h3>
            {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mt-1">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRun && <DropdownMenuItem onClick={onRun}><Play className="w-4 h-4 mr-2" />Run Now</DropdownMenuItem>}
              {onEdit && <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>}
              {onShare && <DropdownMenuItem onClick={onShare}><Share2 className="w-4 h-4 mr-2" />Share</DropdownMenuItem>}
              {onSchedule && <DropdownMenuItem onClick={onSchedule}><Calendar className="w-4 h-4 mr-2" />Schedule</DropdownMenuItem>}
              {onExport && <DropdownMenuItem onClick={onExport}><Download className="w-4 h-4 mr-2" />Export</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {sparklineData && sparklineData.length > 0 && (
          <div className="mb-3">
            <MiniSparkline data={sparklineData} />
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[10px]" style={{ background: 'var(--primary)' }}>
                {owner.avatar}
              </AvatarFallback>
            </Avatar>
            <span>{owner.name.split(' ')[0]}</span>
          </div>
          {scheduled ? (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {scheduled}
            </Badge>
          ) : lastRun ? (
            <span className="text-xs text-muted-foreground">Last run {lastRun}</span>
          ) : null}
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="default" onClick={onRun} className="flex-1">
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 24;
  const padding = 2;

  const points = data
    .map((value, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + (height - padding * 2) - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
