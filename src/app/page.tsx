"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, Flame, Trophy, Heart, Zap, Play, Compass } from "lucide-react";
import Link from "next/link";
import { COURSES, LEVELS, USER_STATS } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useTracks } from "@/hooks/use-tracks";
import { useDailyLesson } from "@/hooks/use-daily-lesson";
import { TrackCard } from "@/components/tracks/TrackCard";
import { DailyLessonCard } from "@/components/tracks/DailyLessonCard";

export default function HomePage() {
  const { t } = useLanguage();
  const featuredCourses = COURSES.slice(0, 3);

  const { track: dailyTrack, lesson: dailyLesson } = useDailyLesson();
  const tracksQuery = useTracks({ limit: 6 });
  const tracks = tracksQuery.data?.tracks ?? [];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <Badge className="bg-secondary/20 text-secondary border-secondary/30 rounded-full px-4 py-1.5 font-bold text-sm">
              ✨ {t("home.heroTitle")}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              {t("home.heroTitle")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t("home.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button asChild size="lg" className="h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-10 text-xl font-bold shadow-[0_6px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto">
                <Link href="/learn" className="gap-2">
                  <Play className="h-6 w-6 fill-current" />
                  {t("common.start")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 rounded-2xl border-4 hover:bg-accent/50 px-10 text-xl font-bold transition-all w-full sm:w-auto">
                <Link href="/courses">{t("common.courses")}</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl" />
            <div className="relative bg-card border-4 border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg">
                      {USER_STATS.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{USER_STATS.name}</h3>
                      <p className="text-muted-foreground font-bold">{t("common.level")} {USER_STATS.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Flame className="h-8 w-8 text-orange-500 fill-current" />
                      <span className="font-black text-lg">{USER_STATS.streak}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Zap className="h-8 w-8 text-yellow-400 fill-current" />
                      <span className="font-black text-lg">{USER_STATS.xp}</span>
                    </div>
                  </div>
               </div>
               
               <div className="space-y-6">
                 <div className="space-y-2">
                   <div className="flex justify-between font-black text-sm uppercase tracking-wider">
                     <span>{t("dashboard.dailyProgress")}</span>
                     <span className="text-primary">{USER_STATS.dailyProgress} / {USER_STATS.dailyGoal} XP</span>
                   </div>
                   <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border-2 border-white/5">
                     <div 
                       className="h-full bg-primary rounded-full transition-all duration-1000" 
                       style={{ width: `${(USER_STATS.dailyProgress / USER_STATS.dailyGoal) * 100}%` }}
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-white/10 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-muted-foreground/30" />
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Lesson (Phase 0) */}
      {dailyLesson && dailyTrack && (
        <section>
          <DailyLessonCard track={dailyTrack} lesson={dailyLesson} />
        </section>
      )}

      {/* Tracks (Phase 0) */}
      {tracks.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-sm font-bold text-secondary border border-secondary/30">
                <Compass className="w-4 h-4" />
                {t("common.explore_tracks")}
              </div>
              <h2 className="text-4xl font-black">{t("common.tracks")}</h2>
            </div>
            <Button variant="ghost" asChild className="font-black text-primary hover:text-primary/80 hover:bg-transparent hidden sm:flex">
              <Link href="/tracks" className="gap-2">
                {t("common.all")} <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.slice(0, 6).map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: t("common.streak"), value: `7 ${t("common.streak")}`, icon: Flame, color: "text-orange-500" },
          { label: t("common.xp"), value: "1,250", icon: Zap, color: "text-yellow-400" },
          { label: t("common.hearts"), value: "5", icon: Heart, color: "text-red-500" },
          { label: t("common.level"), value: "12", icon: Trophy, color: "text-primary" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-3xl border-4 bg-card hover:scale-105 transition-transform cursor-default overflow-hidden group">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className={cn("p-3 rounded-2xl bg-muted group-hover:bg-muted/80 transition-colors", stat.color)}>
                <stat.icon className="h-8 w-8 fill-current" />
              </div>
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Level Cards */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black">{t("home.featuredCourses")}</h2>
          <div className="h-2 w-24 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEVELS.map((level) => (
            <Card key={level.id} className="rounded-3xl border-4 hover:border-primary/50 transition-all group cursor-pointer overflow-hidden relative">
              <CardContent className="p-8 space-y-6">
                <div className={cn("w-16 h-16 flex items-center justify-center rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform", level.color)}>
                  <level.icon className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase">{level.name}</h3>
                    <Badge variant="secondary" className="font-black rounded-lg">{level.code}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{level.description}</p>
                </div>
                <Button variant="ghost" className="w-full justify-between font-black group-hover:text-primary transition-colors p-0">
                  {t("common.start")} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-2">
            <h2 className="text-4xl font-black">{t("home.featuredCourses")}</h2>
            <p className="text-muted-foreground font-medium">{t("home.heroSubtitle")}</p>
          </div>
          <Button variant="ghost" asChild className="font-black text-primary hover:text-primary/80 hover:bg-transparent hidden sm:flex">
            <Link href="/courses" className="gap-2">
              {t("common.all")} <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="rounded-[2rem] border-4 overflow-hidden group hover:shadow-xl transition-all">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-4 right-4 bg-white text-black font-black rounded-xl px-3 py-1">
                  {course.level}
                </Badge>
              </div>
              <CardHeader className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-yellow-400 font-black">
                    <Star className="w-5 h-5 fill-current mr-1" />
                    {course.rating}
                  </div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{course.reviews} {t("common.reviews")}</div>
                </div>
                <CardTitle className="text-2xl font-black leading-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
                <div className="flex items-center gap-3">
                  <img src={course.instructorAvatar} className="w-8 h-8 rounded-full border-2 border-primary" alt={course.instructor} />
                  <span className="text-sm font-bold text-muted-foreground">{course.instructor}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex items-center justify-between">
                <div className="text-3xl font-black text-primary">
                  {course.price === 0 ? "FREE" : `$${course.price}`}
                </div>
                <Button asChild className="rounded-xl bg-secondary text-secondary-foreground font-black shadow-[0_4px_0_0_#1482b5] hover:bg-secondary/90 active:translate-y-1 active:shadow-none transition-all px-6">
                  <Link href={`/courses/${course.id}`}>{t("common.enroll")}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
