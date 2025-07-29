import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, History, Crown } from "lucide-react";

const Profile = () => {
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
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Welcome Back!</h2>
                  <p className="text-muted-foreground">Medical Student</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">student@medschool.edu</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Study Level</label>
                  <p className="text-lg">USMLE Step 1 Prep</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                  <p className="text-lg">January 2024</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button variant="outline" className="w-full">
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
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Study Sessions</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Topics Covered</span>
                    <span className="font-semibold">8</span>
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
    </div>
  );
};

export default Profile;