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

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    display_name: string | null;
    study_level: string | null;
    avatar_url: string | null;
  } | null;
  onSave: (data: { display_name: string; study_level: string }) => Promise<boolean>;
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
              <Button type="button" variant="outline" size="sm" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Change Photo (Coming Soon)
              </Button>
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