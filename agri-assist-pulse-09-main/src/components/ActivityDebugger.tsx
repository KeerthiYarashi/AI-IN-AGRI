import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { activityService } from '@/services/activityService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ActivityDebugger = () => {
  const { farmer } = useAuth();
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    if (!farmer) return;

    const interval = setInterval(() => {
      const stats = activityService.getActivityStats(farmer.id);
      setActivityCount(stats.totalActivities);
    }, 1000);

    return () => clearInterval(interval);
  }, [farmer]);

  if (!farmer) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-64 bg-background/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Activity Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{activityCount}</div>
        <div className="text-xs text-muted-foreground">Total activities recorded</div>
      </CardContent>
    </Card>
  );
};
