"use client";

import { useState } from "react";
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
  Lock
} from "lucide-react";
import { COURSES } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function StudyPage() {
  const { t } = useLanguage();
  const params = useParams();
  const courseId = params?.courseId as string;
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule.lessons[currentLessonIndex];
  
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = 5; // Mock data
  const progress = (completedLessons / totalLessons) * 100;

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
              <span>{completedLessons} / {totalLessons} {t("study.course_content")}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 w-full bg-slate-800" />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex border-slate-700 hover:bg-slate-800">
            {t("study.qa")}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Video Player Area */}
          <div className="aspect-video bg-black relative group flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
               <PlayCircle className="w-20 h-20 text-white/50 group-hover:text-primary group-hover:scale-110 transition-all cursor-pointer" />
            </div>
            
            {/* Fake Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center px-4 gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 fill-current" />
              <div className="flex-1 h-1 bg-slate-600 rounded-full relative">
                <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-primary rounded-full" />
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
              </div>
              <span className="text-xs font-mono">03:45 / 10:00</span>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto w-full">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight">{currentLesson.title}</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                In this lesson, we will explore the core concepts of {currentLesson.title.toLowerCase()} and how they apply to real-world scenarios in the {course.title} context.
              </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-slate-900 border border-slate-800 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800">{t("study.overview")}</TabsTrigger>
                <TabsTrigger value="qa" className="data-[state=active]:bg-slate-800">{t("study.qa")}</TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-slate-800">{t("study.resources")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="pt-6 space-y-6">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    About this lesson
                  </h3>
                  <p className="text-slate-400">
                    This lesson covers the fundamental building blocks of technical communication. 
                    By the end of this session, you'll be able to identify key terminology and use it effectively in your daily work.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="qa" className="pt-6">
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        U{i}
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm">User {i} <span className="text-slate-500 font-normal ml-2">2 hours ago</span></p>
                        <p className="text-slate-400 text-sm">I have a question about the specific use case mentioned at 04:20. Could you clarify?</p>
                        <Button variant="link" className="p-0 h-auto text-primary text-xs">Reply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Lesson Notes.pdf", size: "1.2 MB" },
                    { name: "Terminology Cheat Sheet.pdf", size: "850 KB" }
                  ].map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-primary/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                        <div>
                          <p className="font-bold text-sm">{res.name}</p>
                          <p className="text-xs text-slate-500">{res.size}</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-0 mt-auto border-t border-slate-800 bg-slate-950/80 backdrop-blur-md p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
                  {t("study.previous_lesson")}
                </Button>
              </div>
              <div className="flex items-center gap-4 flex-1 md:flex-none">
                <Button className="flex-1 md:flex-none h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl">
                  {t("study.complete_continue")}
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-800">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/30 hidden lg:flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold">{t("study.course_content")}</h3>
          </div>
          <ScrollArea className="flex-1">
            <Accordion type="multiple" defaultValue={[`module-${currentModuleIndex}`]} className="w-full">
              {course.modules.map((module, mIdx) => (
                <AccordionItem key={mIdx} value={`module-${mIdx}`} className="border-b border-slate-800 last:border-0">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-slate-800/50">
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section {mIdx + 1}</span>
                      <span className="font-bold text-sm line-clamp-1">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="flex flex-col">
                      {module.lessons.map((lesson, lIdx) => {
                        const isActive = mIdx === currentModuleIndex && lIdx === currentLessonIndex;
                        const isCompleted = lesson.status === "completed";
                        const isLocked = lesson.status === "locked";
                        
                        return (
                          <button
                            key={lIdx}
                            onClick={() => {
                              if (!isLocked) {
                                setCurrentModuleIndex(mIdx);
                                setCurrentLessonIndex(lIdx);
                              }
                            }}
                            disabled={isLocked}
                            className={cn(
                              "flex items-start gap-3 px-4 py-4 text-left transition-colors",
                              !isLocked && "hover:bg-slate-800/30",
                              isActive && "bg-slate-800 border-l-4 border-primary px-[13px]",
                              isLocked && "cursor-not-allowed"
                            )}
                          >
                            <div className="mt-0.5">
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-green-500 fill-green-500/10" />
                              ) : isLocked ? (
                                <Lock className="w-4 h-4 text-slate-500" />
                              ) : (
                                <PlayCircle className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className={cn(
                                "text-sm font-medium leading-tight",
                                isActive ? "text-white" : isLocked ? "text-slate-500" : "text-slate-400"
                              )}>
                                {lIdx + 1}. {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                <Play className="w-2 h-2 fill-current" />
                                <span>10:00</span>
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
