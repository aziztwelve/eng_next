"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  PlayCircle, 
  CheckCircle, 
  FileText, 
  Info, 
  Play, 
  Download,
  ChevronRight,
  Lock,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  type: string;
  title: string;
  content: string;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  steps: Step[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  language: string;
  modules: Module[];
}

export default function StudyPage() {
  const { t } = useLanguage();
  const params = useParams();
  const courseId = params?.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // Загрузка курса
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/v1/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch course");
        
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Загрузка URL видео при смене шага
  useEffect(() => {
    if (!course) return;
    
    const currentModule = course.modules[currentModuleIndex];
    if (!currentModule) return;
    
    const currentLesson = currentModule.lessons[currentLessonIndex];
    if (!currentLesson) return;
    
    const currentStep = currentLesson.steps[currentStepIndex];
    if (!currentStep || currentStep.type !== "video") {
      setVideoUrl(null);
      return;
    }

    const fetchVideoUrl = async () => {
      try {
        setLoadingVideo(true);
        const content = JSON.parse(currentStep.content);
        const videoId = content.video_id;
        
        if (!videoId) return;

        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/v1/videos/${videoId}/url`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch video URL");
        
        const data = await response.json();
        setVideoUrl(data.signed_url);
      } catch (error) {
        console.error("Error fetching video URL:", error);
      } finally {
        setLoadingVideo(false);
      }
    };

    fetchVideoUrl();
  }, [course, currentModuleIndex, currentLessonIndex, currentStepIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <p>Course not found</p>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];
  const currentStep = currentLesson?.steps[currentStepIndex];
  
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = 0; // TODO: Get from progress API
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const goToNextStep = () => {
    if (!currentLesson) return;
    
    if (currentStepIndex < currentLesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentStepIndex(0);
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
      setCurrentStepIndex(0);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else if (currentLessonIndex > 0) {
      const prevLesson = currentModule.lessons[currentLessonIndex - 1];
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentStepIndex(prevLesson.steps.length - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      const prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(prevModule.lessons.length - 1);
      setCurrentStepIndex(prevLesson.steps.length - 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-white">
            <Link href={`/courses/${course.id}`}>
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
          <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block" />
          <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end gap-1 min-w-[150px]">
            <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>{completedLessons} / {totalLessons} Lessons</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 w-full bg-slate-800" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Video Player Area */}
          {currentStep?.type === "video" && (
            <div className="aspect-video bg-black relative">
              {loadingVideo ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : videoUrl ? (
                <video
                  key={videoUrl}
                  controls
                  className="w-full h-full"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <p>Video not available</p>
                </div>
              )}
            </div>
          )}

          {/* Step Content */}
          <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto w-full">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight">
                {currentStep?.title || currentLesson?.title}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                {currentLesson?.description}
              </p>
            </div>

            {currentStep?.type === "text" && (
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: currentStep.content }} />
              </div>
            )}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-0 mt-auto border-t border-slate-800 bg-slate-950/80 backdrop-blur-md p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToPreviousStep}
                disabled={currentModuleIndex === 0 && currentLessonIndex === 0 && currentStepIndex === 0}
                className="hidden md:flex gap-2 text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-4 flex-1 md:flex-none">
                <Button 
                  onClick={goToNextStep}
                  className="flex-1 md:flex-none h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl"
                >
                  Complete & Continue
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToNextStep}
                  className="h-12 w-12 rounded-xl border-slate-800"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/30 hidden lg:flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold">Course Content</h3>
          </div>
          <ScrollArea className="flex-1">
            <Accordion type="multiple" defaultValue={[`module-${currentModuleIndex}`]} className="w-full">
              {course.modules.map((module, mIdx) => (
                <AccordionItem key={module.id} value={`module-${mIdx}`} className="border-b border-slate-800 last:border-0">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-slate-800/50">
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Section {module.order_index}
                      </span>
                      <span className="font-bold text-sm line-clamp-1">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="flex flex-col">
                      {module.lessons.map((lesson, lIdx) => {
                        const isActive = mIdx === currentModuleIndex && lIdx === currentLessonIndex;
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setCurrentModuleIndex(mIdx);
                              setCurrentLessonIndex(lIdx);
                              setCurrentStepIndex(0);
                            }}
                            className={cn(
                              "flex items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-800/30",
                              isActive && "bg-slate-800 border-l-4 border-primary px-[13px]"
                            )}
                          >
                            <div className="mt-0.5">
                              <PlayCircle className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
                            </div>
                            <div className="space-y-1">
                              <p className={cn(
                                "text-sm font-medium leading-tight",
                                isActive ? "text-white" : "text-slate-400"
                              )}>
                                {lesson.order_index}. {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                <span>{lesson.steps.length} steps</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
