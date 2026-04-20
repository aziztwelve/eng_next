"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, CheckCircle, Clock, Globe, Shield, PlayCircle, Users, Award, Play, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCourse, useEnrollCourse } from "@/hooks/use-courses";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function CourseDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params?.id as string;
  
  const { data: course, isLoading, error } = useCourse(id);
  const enrollMutation = useEnrollCourse();

  const handleEnroll = () => {
    if (id) {
      enrollMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-3xl font-black">Course not found</h2>
        <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Course Header Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full px-4 py-1.5 font-bold text-sm">
                  {course.level}
                </Badge>
                <div className="flex items-center gap-2 text-yellow-400 font-black">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg">{course.rating || 0}</span>
                  <span className="text-muted-foreground font-bold text-sm">({course.reviews || 0} {t("common.reviews")})</span>
                </div>
              </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl font-medium leading-relaxed">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <img 
                  src={course.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} 
                  className="w-12 h-12 rounded-full border-4 border-primary" 
                  alt={course.instructor || 'Instructor'} 
                />
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Instructor</p>
                  <p className="font-black text-lg">{course.instructor || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-bold text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>{course.lastUpdated || 'Recently updated'}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-muted-foreground">
                <Globe className="w-5 h-5 text-primary" />
                <span>{course.language || 'English'}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span>{course.students?.toLocaleString() || 0} Students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          {/* Video Placeholder */}
          <div className="aspect-video bg-card rounded-[2.5rem] flex items-center justify-center border-4 relative group cursor-pointer overflow-hidden shadow-2xl">
              <img 
                src={course.image || course.thumbnail_url || 'https://via.placeholder.com/1200x675?text=Course+Preview'} 
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
                alt="Video preview" 
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                 <div className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                   <Play className="w-12 h-12 fill-current ml-2" />
                 </div>
                 <p className="text-white font-black text-xl uppercase tracking-widest">Preview Course</p>
              </div>
          </div>

          {/* What you'll learn */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <div className="space-y-8">
               <h2 className="text-3xl font-black">{t("common.curriculum")}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.map((item, i) => (
                    <Card key={i} className="rounded-2xl border-4 p-6 flex items-start gap-4 bg-card">
                      <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                      <span className="text-muted-foreground font-bold leading-relaxed">{item}</span>
                    </Card>
                  ))}
               </div>
            </div>
          )}

          {/* Course Content */}
          {course.modules && course.modules.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">{t("common.curriculum")}</h2>
                <div className="font-bold text-muted-foreground">
                  {course.modules.length} Modules • {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                </div>
              </div>
              <Accordion type="multiple" className="w-full space-y-4">
                {course.modules.map((module, i) => (
                <AccordionItem key={i} value={`module-${i}`} className="border-4 rounded-[2rem] px-6 bg-card overflow-hidden">
                  <AccordionTrigger className="hover:no-underline py-8">
                    <div className="flex flex-col items-start text-left gap-1">
                      <span className="font-black text-primary uppercase tracking-widest text-xs">Module {i + 1}</span>
                      <span className="font-black text-2xl tracking-tight">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 space-y-2">
                    {module.lessons.map((lesson, j) => {
                      const isLocked = lesson.status === "locked";
                      const isCompleted = lesson.status === "completed";
                      const isCurrent = lesson.status === "current";

                      const LessonContent = (
                        <>
                          <div className="flex items-center gap-4">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : isLocked ? (
                              <Lock className="w-5 h-5 text-slate-500" />
                            ) : (
                              <PlayCircle className={cn("w-5 h-5", isCurrent ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                            )}
                            <span className={cn(
                              "font-bold",
                              isLocked ? "text-slate-500" : isCurrent ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-sm font-black text-muted-foreground">10:00</span>
                        </>
                      );

                      if (isLocked) {
                        return (
                          <div
                            key={j}
                            className="flex items-center justify-between py-4 px-6 rounded-2xl border-2 border-transparent cursor-not-allowed opacity-70"
                          >
                            {LessonContent}
                          </div>
                        );
                      }

                      return (
                        <Link 
                          key={j} 
                          href={`/study/${course.id}`}
                          className="flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-muted transition-colors group cursor-pointer border-2 border-transparent hover:border-primary/20"
                        >
                          {LessonContent}
                        </Link>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          )}
        </div>

        {/* Sidebar - Price & Enrollment */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <Card className="rounded-[2.5rem] border-4 overflow-hidden shadow-2xl bg-card">
              <CardContent className="p-0">
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="text-5xl font-black text-primary">
                      {course.price === 0 ? "FREE" : `$${course.price}`}
                    </div>
                    {course.price > 0 && (
                      <div className="text-2xl text-muted-foreground line-through font-bold">
                        $199.99
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {course.enrolled ? (
                      <Button 
                        asChild 
                        size="lg" 
                        className="w-full h-20 rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-[0_6px_0_0_#46a302] hover:bg-primary/90 active:translate-y-1 active:shadow-none transition-all"
                      >
                        <Link href={`/study/${course.id}`}>
                          {t("common.start_learning")}
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        asChild 
                        size="lg" 
                        className="w-full h-20 rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-[0_6px_0_0_#46a302] hover:bg-primary/90 active:translate-y-1 active:shadow-none transition-all"
                        disabled={enrollMutation.isPending}
                      >
                        <button onClick={handleEnroll}>
                          {enrollMutation.isPending ? 'Enrolling...' : t("common.enroll")}
                        </button>
                      </Button>
                    )}
                    <Button variant="outline" size="lg" className="w-full h-20 rounded-2xl border-4 font-black text-2xl hover:bg-accent/50">
                      Add to Wishlist
                    </Button>
                  </div>

                  <div className="space-y-6 pt-4">
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">This course includes:</p>
                    <ul className="space-y-5">
                      {[
                        { icon: PlayCircle, text: "15.5h Video Lessons" },
                        { icon: Award, text: "Certificate of Completion" },
                        { icon: Shield, text: "Lifetime Access" },
                        { icon: Users, text: "Community Support" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 font-bold text-muted-foreground">
                          <item.icon className="w-6 h-6 text-primary" />
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-4 border-dashed p-8 bg-primary/5 space-y-4">
              <h3 className="text-xl font-black text-primary">Gift this course</h3>
              <p className="font-bold text-muted-foreground leading-relaxed">
                Share the joy of learning with your friends and family.
              </p>
              <Button variant="outline" className="w-full h-14 rounded-xl border-2 font-black">
                Buy as a Gift
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
