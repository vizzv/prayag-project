import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  BarChart3,
  ChevronRight,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CodingProblem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  acceptance_rate: number | null;
}

interface CodingAttempt {
  problem_id: string;
  status: string;
}

const CodingPractice = () => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const { user } = useAuth();

  useEffect(() => {
    fetchProblems();
    if (user) {
      fetchUserAttempts();
    }
  }, [user]);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_problems")
        .select("id, title, difficulty, category, acceptance_rate")
        .order("difficulty", { ascending: true });
      
      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("coding_attempts")
        .select("problem_id, status")
        .eq("user_id", user.id)
        .eq("status", "solved");
      
      if (error) throw error;
      
      const solved = new Set((data || []).map(a => a.problem_id));
      setSolvedProblems(solved);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-success/10 text-success border-success/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      case "hard": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "";
    }
  };

  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const categories = ["All", ...new Set(problems.map(p => p.category))];
  const filteredProblems = selectedCategory === "All" 
    ? problems 
    : problems.filter(p => p.category === selectedCategory);

  const stats = {
    total: problems.length,
    solved: solvedProblems.size,
    easy: problems.filter(p => p.difficulty === "easy").length,
    easySolved: problems.filter(p => p.difficulty === "easy" && solvedProblems.has(p.id)).length,
    medium: problems.filter(p => p.difficulty === "medium").length,
    mediumSolved: problems.filter(p => p.difficulty === "medium" && solvedProblems.has(p.id)).length,
    hard: problems.filter(p => p.difficulty === "hard").length,
    hardSolved: problems.filter(p => p.difficulty === "hard" && solvedProblems.has(p.id)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container px-4 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading problems...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Coding Practice</h1>
            <p className="text-muted-foreground">
              Sharpen your problem-solving skills with curated coding challenges
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Your Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Problems Solved</span>
                      <span className="text-sm font-medium">{stats.solved}/{stats.total}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${stats.total > 0 ? (stats.solved / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Easy</span>
                      <span className="text-sm font-medium">{stats.easySolved}/{stats.easy}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${stats.easy > 0 ? (stats.easySolved / stats.easy) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Medium</span>
                      <span className="text-sm font-medium">{stats.mediumSolved}/{stats.medium}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning rounded-full transition-all"
                        style={{ width: `${stats.medium > 0 ? (stats.mediumSolved / stats.medium) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Hard</span>
                      <span className="text-sm font-medium">{stats.hardSolved}/{stats.hard}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-destructive rounded-full transition-all"
                        style={{ width: `${stats.hard > 0 ? (stats.hardSolved / stats.hard) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter by Category */}
              <div className="bg-card rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge 
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {formatCategory(cat)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Problems List */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-sm font-medium text-muted-foreground border-b">
                  <div className="col-span-1">Status</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Difficulty</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Acceptance</div>
                </div>

                {/* Problems */}
                {filteredProblems.map((problem, index) => (
                  <div 
                    key={problem.id}
                    className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors cursor-pointer group ${
                      index !== filteredProblems.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="col-span-1">
                      {solvedProblems.has(problem.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {index + 1}. {problem.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                        {formatCategory(problem.difficulty)}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="secondary">{problem.category}</Badge>
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {problem.acceptance_rate || 50}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingPractice;
