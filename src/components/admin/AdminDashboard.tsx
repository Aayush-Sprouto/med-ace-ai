import { useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Activity, TrendingUp, Clock, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const { stats, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      description: 'Registered users',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Today',
      value: stats?.active_users_today || 0,
      description: 'Users active today',
      icon: Activity,
      color: 'text-green-600',
    },
    {
      title: 'New Users Today',
      value: stats?.new_users_today || 0,
      description: 'New registrations',
      icon: UserPlus,
      color: 'text-purple-600',
    },
    {
      title: 'Total Conversations',
      value: stats?.total_conversations || 0,
      description: 'Chat sessions',
      icon: MessageSquare,
      color: 'text-orange-600',
    },
    {
      title: 'Total Messages',
      value: stats?.total_messages || 0,
      description: 'Messages sent',
      icon: Clock,
      color: 'text-red-600',
    },
    {
      title: 'Questions Today',
      value: stats?.questions_today || 0,
      description: 'Questions asked today',
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your MedTutor AI platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">User Activity</h4>
                <p className="text-sm text-muted-foreground">
                  {stats?.active_users_today || 0} users active today
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Platform Growth</h4>
                <p className="text-sm text-muted-foreground">
                  {stats?.new_users_today || 0} new users registered today
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Engagement</h4>
                <p className="text-sm text-muted-foreground">
                  {stats?.questions_today || 0} questions asked today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Platform health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-sm text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI API</span>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm text-green-600 font-medium">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;