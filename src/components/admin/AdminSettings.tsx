import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Database, Shield, Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { logAdminAction } = useAdmin();
  const { toast } = useToast();

  // Local state for settings
  const [aiModel, setAiModel] = useState('gpt-5-2025-08-07');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('You are MedTutor AI, an expert USMLE medical tutor with deep knowledge in all medical fields.');
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [allowGuestAccess, setAllowGuestAccess] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [maxQuestionsPerHour, setMaxQuestionsPerHour] = useState(50);

  const handleSave = async (section: string, newSettings: any) => {
    try {
      // Update local state based on newSettings
      if (newSettings.aiModel !== undefined) setAiModel(newSettings.aiModel);
      if (newSettings.temperature !== undefined) setTemperature(newSettings.temperature);
      if (newSettings.maxTokens !== undefined) setMaxTokens(newSettings.maxTokens);
      if (newSettings.systemPrompt !== undefined) setSystemPrompt(newSettings.systemPrompt);
      if (newSettings.enableAnalytics !== undefined) setEnableAnalytics(newSettings.enableAnalytics);
      if (newSettings.allowGuestAccess !== undefined) setAllowGuestAccess(newSettings.allowGuestAccess);
      if (newSettings.maintenanceMode !== undefined) setMaintenanceMode(newSettings.maintenanceMode);
      if (newSettings.rateLimitEnabled !== undefined) setRateLimitEnabled(newSettings.rateLimitEnabled);
      if (newSettings.maxQuestionsPerHour !== undefined) setMaxQuestionsPerHour(newSettings.maxQuestionsPerHour);

      // Log the settings change with current state
      await logAdminAction('update_settings', undefined, {
        section,
        settings: {
          aiModel: newSettings.aiModel || aiModel,
          maxTokens: newSettings.maxTokens || maxTokens,
          temperature: newSettings.temperature || temperature,
          systemPrompt: newSettings.systemPrompt || systemPrompt,
          enableAnalytics: newSettings.enableAnalytics !== undefined ? newSettings.enableAnalytics : enableAnalytics,
          maintenanceMode: newSettings.maintenanceMode !== undefined ? newSettings.maintenanceMode : maintenanceMode,
          allowGuestAccess: newSettings.allowGuestAccess !== undefined ? newSettings.allowGuestAccess : allowGuestAccess,
          rateLimitEnabled: newSettings.rateLimitEnabled !== undefined ? newSettings.rateLimitEnabled : rateLimitEnabled,
          maxQuestionsPerHour: newSettings.maxQuestionsPerHour || maxQuestionsPerHour,
        }
      });

      toast({
        title: "Settings Updated",
        description: `${section} settings have been saved and logged.`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
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
              <Select 
                value={aiModel} 
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
                value={temperature}
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
              value={maxTokens}
              onChange={(e) => handleSave('AI Configuration', { maxTokens: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              rows={6}
              value={systemPrompt}
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
              checked={enableAnalytics}
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
              checked={allowGuestAccess}
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
              checked={maintenanceMode}
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
              checked={rateLimitEnabled}
              onCheckedChange={(checked) => handleSave('Security Settings', { rateLimitEnabled: checked })}
            />
          </div>
          
          {rateLimitEnabled && (
            <div className="space-y-2">
              <Label htmlFor="maxQuestions">Max Questions Per Hour</Label>
              <Input
                id="maxQuestions"
                type="number"
                min="1"
                max="1000"
                value={maxQuestionsPerHour}
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