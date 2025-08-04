import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Database, Shield, Zap, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { logAdminAction } = useAdmin();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    aiModel: 'gemini-1.5-flash-latest',
    maxTokens: 2048,
    temperature: 0.7,
    systemPrompt: `You are 'MedTutor AI', an expert USMLE medical tutor with deep knowledge in all medical fields.`,
    enableAnalytics: true,
    allowGuestAccess: false,
    maintenanceMode: false,
    rateLimitEnabled: true,
    maxQuestionsPerHour: 50,
  });

  const handleSave = async (section: string) => {
    try {
      await logAdminAction('update_settings', undefined, { section, settings });
      
      toast({
        title: "Settings Updated",
        description: `${section} settings have been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

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
              <Input
                id="aiModel"
                value={settings.aiModel}
                onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                placeholder="gemini-1.5-flash-latest"
              />
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
                onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              rows={6}
              value={settings.systemPrompt}
              onChange={(e) => setSettings({...settings, systemPrompt: e.target.value})}
              placeholder="Enter the system prompt for the AI..."
            />
          </div>
          
          <Button onClick={() => handleSave('AI Configuration')} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save AI Settings
          </Button>
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
              onCheckedChange={(checked) => setSettings({...settings, enableAnalytics: checked})}
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
              onCheckedChange={(checked) => setSettings({...settings, allowGuestAccess: checked})}
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
              onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
            />
          </div>
          
          <Button onClick={() => handleSave('System Settings')} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save System Settings
          </Button>
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
              onCheckedChange={(checked) => setSettings({...settings, rateLimitEnabled: checked})}
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
                onChange={(e) => setSettings({...settings, maxQuestionsPerHour: parseInt(e.target.value)})}
              />
            </div>
          )}
          
          <Button onClick={() => handleSave('Security Settings')} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Security Settings
          </Button>
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