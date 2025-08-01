import { useState } from 'react';
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, History, Crown, Calendar } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuth();
  const { profile, statistics, loading, updateProfile } = useProfile();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const displayName = profile?.display_name || 'Medical Student';
  const studyLevel = profile?.study_level || 'Beginner';
  const joinDate = profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Recently';

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">User Profile</h1>
            <p className="text-muted-foreground">Manage your account and track your progress</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">Welcome Back, {displayName}!</h2>
                  <p className="text-muted-foreground">{studyLevel}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{user?.email || 'No email available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Study Level</label>
                  <p className="text-lg">{studyLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-lg">{joinDate}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <History className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Learning Progress</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Questions Asked</span>
                    <span className="font-semibold">{statistics?.questions_asked || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Study Sessions</span>
                    <span className="font-semibold">{statistics?.study_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Topics Covered</span>
                    <span className="font-semibold">{statistics?.topics_covered || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-card bg-gradient-primary text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Upgrade to Pro</h3>
                </div>
                <p className="mb-4 opacity-90">
                  Unlock unlimited questions, advanced features, and personalized study plans.
                </p>
                <Button variant="elegant" className="w-full">
                  Upgrade Now
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onSave={updateProfile}
      />
    </div>
  );
};

export default Profile;