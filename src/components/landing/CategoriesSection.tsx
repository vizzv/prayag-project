import { Link } from "react-router-dom";
import { ArrowRight, Brain, Calculator, Code, Database, Cpu, MessageSquare } from "lucide-react";

const categories = [
  {
    name: "Aptitude",
    icon: Calculator,
    questionCount: 1200,
    color: "from-blue-500 to-blue-600",
    href: "/mcq?category=aptitude",
  },
  {
    name: "Logical Reasoning",
    icon: Brain,
    questionCount: 800,
    color: "from-purple-500 to-purple-600",
    href: "/mcq?category=reasoning",
  },
  {
    name: "Data Structures",
    icon: Database,
    questionCount: 600,
    color: "from-green-500 to-green-600",
    href: "/mcq?category=dsa",
  },
  {
    name: "Programming",
    icon: Code,
    questionCount: 900,
    color: "from-orange-500 to-orange-600",
    href: "/mcq?category=programming",
  },
  {
    name: "Operating Systems",
    icon: Cpu,
    questionCount: 450,
    color: "from-red-500 to-red-600",
    href: "/mcq?category=os",
  },
  {
    name: "Verbal Ability",
    icon: MessageSquare,
    questionCount: 550,
    color: "from-teal-500 to-teal-600",
    href: "/mcq?category=verbal",
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Practice by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-muted-foreground">
              Choose your area and start practicing now
            </p>
          </div>
          <Link 
            to="/mcq" 
            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View all categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={category.href}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 card-hover"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {category.questionCount}+ questions
                </p>
              </div>

              <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
