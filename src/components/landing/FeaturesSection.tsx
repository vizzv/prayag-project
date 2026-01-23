import { BookOpen, Code2, BarChart3, Clock, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "MCQ Practice",
    description: "Thousands of curated MCQs covering aptitude, reasoning, and technical subjects with detailed explanations.",
    color: "primary",
  },
  {
    icon: Code2,
    title: "Coding Challenges",
    description: "Practice Data Structures, Algorithms, and company-specific coding problems with solutions.",
    color: "accent",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visualize your learning journey with detailed analytics and performance insights.",
    color: "info",
  },
  {
    icon: Clock,
    title: "Timed Tests",
    description: "Simulate real placement tests with timed practice sessions and instant results.",
    color: "warning",
  },
  {
    icon: Shield,
    title: "Quality Content",
    description: "Questions curated by industry experts and alumni from top companies.",
    color: "success",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get immediate feedback on your answers with detailed explanations and tips.",
    color: "primary",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10 px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive tools and resources designed to help you ace every placement round.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  return (
    <div 
      className="group p-6 rounded-2xl bg-card border border-border/50 card-hover"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
        <feature.icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  );
};

export default FeaturesSection;
