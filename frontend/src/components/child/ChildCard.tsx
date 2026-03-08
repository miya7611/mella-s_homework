import { User } from 'lucide-react';
import type { User as UserType } from '../../types/user';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ChildCardProps {
  child: Partial<UserType>;
}

export function ChildCard({ child }: ChildCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{child.username}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>等级 {child.level || 1}</span>
              <span>·</span>
              <span className="text-yellow-500">{child.total_points || 0} 积分</span>
            </div>
          </div>
          <Badge variant="secondary">孩子</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
