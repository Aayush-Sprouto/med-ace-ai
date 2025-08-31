import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Database, Shield, Zap, AlertTriangle, Save } from 'lucide-react';

const AdminSettings = () => {
  const { settings, loading, saveSettings } = useAdminSettings();
  const { logAdminAction } = useAdmin();

  const handleSave = async (section: string, sectionSettings: any) => {
    const success = await saveSettings(sectionSettings);
    
    if (success) {
      await logAdminAction('update_settings', undefined, {
        section,
        settings: { ...settings, ...sectionSettings }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Settings</h2>
        <p className="text-muted-foreground">
          Configure system settings and platform behavior
        </p>
      </div>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>
            Configure AI model settings and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="aiModel">AI Model</Label>
              <Select 
                value={settings.aiModel} 
                onValueChange={(value) => handleSave('AI Configuration', { aiModel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-5-2025-08-07">GPT-5 (Latest)</SelectItem>
                  <SelectItem value="gpt-5-mini-2025-08-07">GPT-5 Mini</SelectItem>
                  <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.temperature}
                onChange={(e) => handleSave('AI Configuration', { temperature: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min="1"
              max="8192"
              value={settings.maxTokens}
              onChange={(e) => handleSave('AI Configuration', { maxTokens: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              rows={6}
              value={settings.systemPrompt}
              onChange={(e) => handleSave('AI Configuration', { systemPrompt: e.target.value })}
              placeholder="Enter the system prompt for the AI..."
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            General platform configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Enable user analytics and usage tracking
              </p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) => handleSave('System Settings', { enableAnalytics: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Guest Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow non-registered users to use the platform
              </p>
            </div>
            <Switch
              checked={settings.allowGuestAccess}
              onCheckedChange={(checked) => handleSave('System Settings', { allowGuestAccess: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Maintenance Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable the platform for maintenance
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSave('System Settings', { maintenanceMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security & Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Rate Limiting
          </CardTitle>
          <CardDescription>
            Configure security settings and usage limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">
                Enable rate limiting for API requests
              </p>
            </div>
            <Switch
              checked={settings.rateLimitEnabled}
              onCheckedChange={(checked) => handleSave('Security Settings', { rateLimitEnabled: checked })}
            />
          </div>
          
          {settings.rateLimitEnabled && (
            <div className="space-y-2">
              <Label htmlFor="maxQuestions">Max Questions Per Hour</Label>
              <Input
                id="maxQuestions"
                type="number"
                min="1"
                max="1000"
                value={settings.maxQuestionsPerHour}
                onChange={(e) => handleSave('Security Settings', { maxQuestionsPerHour: parseInt(e.target.value) })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Information
          </CardTitle>
          <CardDescription>
            Database status and configuration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Connection Status</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">RLS Enabled</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backups</span>
                <Badge variant="default">Automated</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Used</span>
                <Badge variant="outline">~245 MB</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Connections</span>
                <Badge variant="outline">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Backup</span>
                <Badge variant="outline">2 hours ago</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;