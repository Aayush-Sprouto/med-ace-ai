import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, Zap, BookOpen, Clock, Target } from "lucide-react";
import Header from "@/components/Header";
import heroImage from "@/assets/hero-bg.jpg";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Advanced AI technology provides personalized tutoring tailored to your learning style and pace."
    },
    {
      icon: BookOpen,
      title: "USMLE-Focused Content",
      description: "Comprehensive coverage of all USMLE topics with verified medical knowledge and practice questions."
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get immediate answers to your medical questions with detailed explanations and references."
    },
    {
      icon: Target,
      title: "Targeted Practice",
      description: "Practice with questions designed to test your knowledge and identify areas for improvement."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Study anytime, anywhere with your personal AI tutor always ready to help."
    },
    {
      icon: MessageSquare,
      title: "Interactive Chat",
      description: "Engage in natural conversations about medical concepts, cases, and exam strategies."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="AI Medical Education" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
        </div>
        
        <div className="relative z-10 container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
              USMLE MedTutor AI
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 leading-relaxed">
              Your intelligent companion for USMLE success. Master medical concepts with AI-powered tutoring 
              designed specifically for medical students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild className="animate-pulse-glow">
                <Link to="/chat">Start Learning Now</Link>
              </Button>
              <Button variant="elegant" size="xl" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose MedTutor AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of medical education with our advanced AI tutoring system
              designed specifically for USMLE preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Ready to Excel in Your USMLE?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-slide-up">
            Join thousands of medical students who are already using MedTutor AI to 
            accelerate their learning and achieve their goals.
          </p>
          <Button variant="elegant" size="xl" asChild className="animate-pulse-glow">
            <Link to="/chat">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MedTutor AI
            </span>
          </div>
          <p className="text-muted-foreground">
            Empowering medical students with intelligent AI tutoring.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;