import { useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Settings, Trash2, UserPlus, Shield } from 'lucide-react';
import { format } from 'date-fns';

const SystemLogs = () => {
  const { logs, fetchLogs } = useAdmin();

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'update_user_role':
        return <Shield className="h-4 w-4" />;
      case 'delete_user':
        return <Trash2 className="h-4 w-4" />;
      case 'create_user':
        return <UserPlus className="h-4 w-4" />;
      case 'login':
        return <User className="h-4 w-4" />;
      case 'update_settings':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'delete_user':
        return 'destructive';
      case 'update_user_role':
        return 'secondary';
      case 'create_user':
        return 'default';
      default:
        return 'outline';
    }
  };

  const formatActionDescription = (action: string, details: any) => {
    switch (action) {
      case 'update_user_role':
        return `Role updated to ${details?.new_role || 'unknown'}`;
      case 'delete_user':
        return 'User account deleted';
      case 'create_user':
        return 'New user created';
      case 'login':
        return 'Admin login';
      case 'update_settings':
        return `Settings updated: ${details?.setting || 'unknown'}`;
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
        <p className="text-muted-foreground">
          Audit trail of administrative actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admin Activity Log
          </CardTitle>
          <CardDescription>
            Recent administrative actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No logs found</h3>
                <p className="text-muted-foreground">
                  Administrative actions will appear here.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-muted rounded-lg">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      {formatActionDescription(log.action, log.details)}
                    </p>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Admin ID: {log.admin_id}</p>
                      {log.target_user_id && (
                        <p>Target User: {log.target_user_id}</p>
                      )}
                      {log.user_agent && (
                        <p className="truncate">User Agent: {log.user_agent}</p>
                      )}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2">
                          <details className="cursor-pointer">
                            <summary className="text-xs font-medium">Details</summary>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Actions Summary</CardTitle>
            <CardDescription>
              Overview of administrative activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['update_user_role', 'delete_user', 'create_user'].map((actionType) => {
                const count = logs.filter(log => log.action === actionType).length;
                return (
                  <div key={actionType} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(actionType)}
                      <span className="text-sm">
                        {actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Current system status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Log Entries</span>
                <Badge variant="outline">{logs.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Activity</span>
                <Badge variant="outline">
                  {logs.length > 0 
                    ? format(new Date(logs[0].created_at), 'HH:mm')
                    : 'No activity'
                  }
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant="default">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemLogs;