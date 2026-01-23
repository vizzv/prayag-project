import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Free access to basic questions",
  "Track your progress over time",
  "Practice on your schedule",
  "Join a community of aspirants",
];

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-dark opacity-95" />
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Ace Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Placement Interview?
            </span>
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Join thousands of students who have already started their journey to placement success.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit) => (
              <div 
                key={benefit}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {benefit}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link to="/register">
            <Button variant="success" size="xl" className="group">
              Start Your Journey
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
