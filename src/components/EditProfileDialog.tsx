import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    display_name: string | null;
    study_level: string | null;
    avatar_url: string | null;
  } | null;
  onSave: (data: { display_name?: string; study_level?: string; avatar_url?: string }) => Promise<boolean>;
}

interface FormData {
  display_name: string;
  study_level: string;
}

const studyLevels = [
  'Beginner',
  'USMLE Step 1 Prep',
  'USMLE Step 2 Prep',
  'USMLE Step 3 Prep',
  'Residency',
  'Fellowship',
  'Attending Physician'
];

export const EditProfileDialog = ({ open, onOpenChange, profile, onSave }: EditProfileDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormData>({
    defaultValues: {
      display_name: profile?.display_name || '',
      study_level: profile?.study_level || 'Beginner'
    }
  });

  // Reset form when profile changes
  useState(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || '',
        study_level: profile.study_level || 'Beginner'
      });
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const success = await onSave(data);
    if (success) {
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await onSave({ avatar_url: publicUrl });

      toast({
        title: "Photo uploaded successfully!",
        description: "Your profile photo has been updated.",
      });

    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and study preferences.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback className="bg-gradient-primary text-white">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={isUploadingPhoto}
                    asChild
                  >
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="display_name"
              rules={{ required: 'Display name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="study_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your study level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {studyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};