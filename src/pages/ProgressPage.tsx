import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  BookOpen,
  Code2,
  BarChart3,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressStats {
  mcqAttempted: number;
  mcqCorrect: number;
  codingSolved: number;
  totalMcq: number;
  totalCoding: number;
}

interface CategoryProgress {
  name: string;
  progress: number;
  color: string;
}

interface RecentActivity {
  type: "mcq" | "coding";
  title: string;
  result: string;
  time: string;
}

const ProgressPage = () => {
  const [stats, setStats] = useState<ProgressStats>({
    mcqAttempted: 0,
    mcqCorrect: 0,
    codingSolved: 0,
    totalMcq: 0,
    totalCoding: 0,
  });
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Fetch MCQ stats
      const { data: mcqAttempts } = await supabase
        .from("mcq_attempts")
        .select("is_correct, question_id")
        .eq("user_id", user.id);

      const { count: totalMcq } = await supabase
        .from("mcq_questions")
        .select("*", { count: "exact", head: true });

      // Fetch coding stats
      const { data: codingAttempts } = await supabase
        .from("coding_attempts")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "solved");

      const { count: totalCoding } = await supabase
        .from("coding_problems")
        .select("*", { count: "exact", head: true });

      // Calculate stats
      const uniqueQuestions = new Set((mcqAttempts || []).map(a => a.question_id));
      const correctAnswers = (mcqAttempts || []).filter(a => a.is_correct).length;

      setStats({
        mcqAttempted: uniqueQuestions.size,
        mcqCorrect: correctAnswers,
        codingSolved: (codingAttempts || []).length,
        totalMcq: totalMcq || 0,
        totalCoding: totalCoding || 0,
      });

      // Fetch category progress
      const { data: mcqQuestions } = await supabase
        .from("mcq_questions")
        .select("id, category");

      const categoryMap = new Map<string, { total: number; attempted: number }>();
      
      (mcqQuestions || []).forEach(q => {
        const cat = q.category;
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { total: 0, attempted: 0 });
        }
        categoryMap.get(cat)!.total++;
        if ((mcqAttempts || []).some(a => a.question_id === q.id)) {
          categoryMap.get(cat)!.attempted++;
        }
      });

      const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-red-500", "bg-teal-500"];
      const progress: CategoryProgress[] = [];
      let colorIndex = 0;
      
      categoryMap.forEach((value, key) => {
        progress.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          progress: value.total > 0 ? Math.round((value.attempted / value.total) * 100) : 0,
          color: colors[colorIndex % colors.length],
        });
        colorIndex++;
      });

      setCategoryProgress(progress);

      // Fetch recent activity
      const { data: recentMcq } = await supabase
        .from("mcq_attempts")
        .select("is_correct, attempted_at, question_id")
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = (recentMcq || []).map(a => ({
        type: "mcq" as const,
        title: "MCQ Practice",
        result: a.is_correct ? "Correct" : "Incorrect",
        time: formatTimeAgo(new Date(a.attempted_at)),
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const mcqAccuracy = stats.mcqAttempted > 0 
    ? Math.round((stats.mcqCorrect / stats.mcqAttempted) * 100) 
    : 0;
  const mcqProgress = stats.totalMcq > 0 
    ? Math.round((stats.mcqAttempted / stats.totalMcq) * 100) 
    : 0;
  const codingProgress = stats.totalCoding > 0 
    ? Math.round((stats.codingSolved / stats.totalCoding) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container px-4 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading progress...</p>
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
            <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
            <p className="text-muted-foreground">
              Track your placement preparation journey
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={BookOpen}
              label="MCQ Accuracy"
              value={`${mcqAccuracy}%`}
              subtext={`${stats.mcqCorrect}/${stats.mcqAttempted} correct`}
              color="primary"
            />
            <StatCard
              icon={Code2}
              label="Problems Solved"
              value={stats.codingSolved.toString()}
              subtext={`Out of ${stats.totalCoding} problems`}
              color="accent"
            />
            <StatCard
              icon={Target}
              label="MCQ Attempted"
              value={stats.mcqAttempted.toString()}
              subtext={`Out of ${stats.totalMcq} questions`}
              color="warning"
            />
            <StatCard
              icon={TrendingUp}
              label="Overall Progress"
              value={`${Math.round((mcqProgress + codingProgress) / 2)}%`}
              subtext="Keep practicing!"
              color="info"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Progress Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Progress */}
              <div className="bg-card rounded-2xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Overall Progress
                </h3>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">MCQ Practice</span>
                      <span className="text-sm text-muted-foreground">{mcqProgress}%</span>
                    </div>
                    <Progress value={mcqProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {stats.mcqAttempted} of {stats.totalMcq} questions attempted
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Coding Problems</span>
                      <span className="text-sm text-muted-foreground">{codingProgress}%</span>
                    </div>
                    <Progress value={codingProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {stats.codingSolved} of {stats.totalCoding} problems solved
                    </p>
                  </div>
                </div>
              </div>

              {/* Category-wise Progress */}
              <div className="bg-card rounded-2xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6">Category Progress</h3>
                {categoryProgress.length > 0 ? (
                  <div className="space-y-4">
                    {categoryProgress.map((category) => (
                      <div key={category.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground">{category.progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${category.color} rounded-full transition-all duration-500`}
                            style={{ width: `${category.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Start practicing to see your category progress!
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievement */}
              {stats.mcqAttempted >= 5 && (
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Getting Started!</h3>
                      <p className="text-sm opacity-80">You've attempted 5+ questions</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-80">
                    Keep practicing to unlock more achievements!
                  </p>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-card rounded-2xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Activity
                </h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type === "mcq" ? "bg-primary/10" : "bg-accent/10"
                        }`}>
                          {activity.type === "mcq" ? (
                            <BookOpen className="w-4 h-4 text-primary" />
                          ) : (
                            <Code2 className="w-4 h-4 text-accent" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={activity.result === "Correct" ? "text-success" : "text-destructive"}>
                              {activity.result}
                            </span>
                            <span>•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No recent activity. Start practicing!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  subtext: string;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
