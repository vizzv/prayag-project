import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Clock, 
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MCQQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
}

const categories = ["All", "aptitude", "reasoning", "programming", "dsa", "os", "verbal"];

const MCQPractice = () => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [score, setScore] = useState({ correct: 0, attempted: 0 });
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase.from("mcq_questions").select("*");
      
      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory as "aptitude" | "reasoning" | "programming" | "dsa" | "os" | "verbal" | "dbms" | "networking");
      }
      
      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      
      // Parse the options from JSONB
      const parsedData = (data || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      }));
      
      setQuestions(parsedData);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const question = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAnswerSelect = async (index: number) => {
    if (selectedAnswer !== null || !question) return;
    
    const isCorrect = index === question.correct_answer;
    setSelectedAnswer(index);
    setShowExplanation(true);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      attempted: prev.attempted + 1
    }));

    // Save attempt to database
    if (user) {
      try {
        await supabase.from("mcq_attempts").insert({
          user_id: user.id,
          question_id: question.id,
          selected_answer: index,
          is_correct: isCorrect,
        });
      } catch (error) {
        console.error("Error saving attempt:", error);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container px-4 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading questions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container px-4">
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {formatCategory(cat)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-center py-16">
              <p className="text-muted-foreground">No questions found for this category.</p>
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
          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search questions..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {formatCategory(cat)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Question Area */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8">
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                      {formatCategory(question.difficulty)}
                    </Badge>
                    <Badge variant="secondary">{formatCategory(question.category)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">No time limit</span>
                  </div>
                </div>

                <Progress value={progress} className="mb-8 h-2" />

                {/* Question */}
                <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === question.correct_answer;
                    const showResult = selectedAnswer !== null;

                    let optionClass = "relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ";
                    
                    if (!showResult) {
                      optionClass += "hover:border-primary/50 hover:bg-primary/5 border-border";
                    } else if (isCorrect) {
                      optionClass += "border-success bg-success/10";
                    } else if (isSelected && !isCorrect) {
                      optionClass += "border-destructive bg-destructive/10";
                    } else {
                      optionClass += "border-border opacity-60";
                    }

                    return (
                      <button
                        key={index}
                        className={optionClass}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm ${
                          showResult && isCorrect 
                            ? "bg-success text-success-foreground" 
                            : showResult && isSelected && !isCorrect
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-secondary"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1 text-left">{option}</span>
                        {showResult && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && question.explanation && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6 animate-fade-in">
                    <h3 className="font-semibold text-primary mb-2">Explanation</h3>
                    <p className="text-muted-foreground">{question.explanation}</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNext} 
                    disabled={selectedAnswer === null || currentQuestion === questions.length - 1}
                    size="lg"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-card rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4">Your Score</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-success/10">
                    <div className="text-2xl font-bold text-success">{score.correct}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary">
                    <div className="text-2xl font-bold">{score.attempted}</div>
                    <div className="text-sm text-muted-foreground">Attempted</div>
                  </div>
                </div>
                {score.attempted > 0 && (
                  <div className="mt-4 text-center">
                    <div className="text-lg font-semibold">
                      {Math.round((score.correct / score.attempted) * 100)}% Accuracy
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-card rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Questions</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary">{formatCategory(question.category)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Difficulty</span>
                    <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                      {formatCategory(question.difficulty)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MCQPractice;
