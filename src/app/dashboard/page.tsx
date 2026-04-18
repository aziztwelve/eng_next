"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Star, Trophy, Clock, BookOpen, ChevronRight, Award, Calendar, BarChart3, Zap } from "lucide-react";
import Link from "next/link";
import { ACHIEVEMENTS, COURSES, LEADERBOARD, USER_STATS } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { t } = useLanguage();
  const currentCourses = COURSES.slice(0, 2);

  return (
    <div className="space-y-12 pb-20">
      {/* Dashboard Header */}
      <section className="relative py-8 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-primary rounded-3xl shadow-xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${USER_STATS.name}`} />
                <AvatarFallback>{USER_STATS.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border-4 border-background shadow-xl">
                {USER_STATS.level}
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">{t("dashboard.welcome")} {USER_STATS.name}!</h1>
              <p className="text-muted-foreground flex items-center gap-3 font-bold text-lg">
                <Calendar className="w-6 h-6 text-primary" />
                Joined {USER_STATS.joinedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <Card className="rounded-3xl border-4 px-8 py-6 bg-card shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="text-orange-500">
                    <Flame className="w-10 h-10 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">{t("common.streak")}</p>
                    <p className="text-3xl font-black">{USER_STATS.streak} 🔥</p>
                  </div>
                </div>
             </Card>
             <Card className="rounded-3xl border-4 px-8 py-6 bg-card shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="text-yellow-400">
                    <Star className="w-10 h-10 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">{t("common.xp")}</p>
                    <p className="text-3xl font-black">{USER_STATS.xp.toLocaleString()} ⚡</p>
                  </div>
                </div>
             </Card>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Dashboard Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Daily Goal */}
          <Card className="rounded-[2.5rem] border-4 overflow-hidden bg-card shadow-xl">
            <CardHeader className="pb-4 border-b-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  {t("common.dailyGoal")}
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground font-black rounded-xl px-4 py-1 text-lg">
                  {USER_STATS.dailyProgress} / {USER_STATS.dailyGoal} XP
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="h-8 bg-muted rounded-full overflow-hidden p-1.5 border-4">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(88,204,2,0.5)]" 
                  style={{ width: `${(USER_STATS.dailyProgress / USER_STATS.dailyGoal) * 100}%` }}
                />
              </div>
              <p className="text-xl font-bold text-muted-foreground text-center">
                {USER_STATS.dailyGoal - USER_STATS.dailyProgress} XP more to reach your goal! You can do it! 🚀
              </p>
            </CardContent>
          </Card>

          {/* Continue Learning */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-3xl font-black">{t("common.enrolled")}</h2>
              <Button variant="ghost" asChild className="font-black text-primary hover:text-primary/80 hover:bg-transparent text-lg">
                <Link href="/courses" className="gap-2">{t("common.all")} <ChevronRight className="w-6 h-6" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentCourses.map((course) => (
                <Card key={course.id} className="rounded-[2rem] border-4 overflow-hidden group hover:shadow-xl transition-all bg-card">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <Badge className="bg-white text-black font-black rounded-xl px-3 py-1 mb-3">{course.level}</Badge>
                      <h3 className="text-white font-black text-xl leading-tight line-clamp-1">{course.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between font-black text-sm uppercase tracking-widest mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary">65%</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border-2">
                      <div className="h-full bg-primary rounded-full w-2/3" />
                    </div>
                    <Button asChild className="w-full h-14 rounded-xl bg-secondary text-secondary-foreground font-black shadow-[0_4px_0_0_#1482b5] hover:bg-secondary/90 active:translate-y-1 active:shadow-none transition-all text-lg">
                      <Link href="/learn">{t("common.continue")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black px-2">{t("common.achievements")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {ACHIEVEMENTS.map((achievement) => (
                <Card key={achievement.id} className={cn(
                  "group p-6 flex flex-col items-center text-center gap-4 rounded-2xl border-4 transition-all cursor-pointer",
                  achievement.unlocked ? 'bg-card hover:scale-105' : 'bg-muted/50 opacity-50 grayscale'
                )}>
                  <div className="text-4xl group-hover:animate-bounce">
                    {achievement.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{achievement.unlocked ? 'Unlocked' : 'Locked'}</p>
                    <p className="text-xs font-black leading-tight line-clamp-1">{achievement.title}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity Chart */}
          <Card className="rounded-[2.5rem] border-4 bg-card shadow-xl overflow-hidden">
             <CardHeader className="border-b-4">
               <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  {t("dashboard.weeklyActivity")}
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-12">
                <div className="h-48 w-full flex items-end justify-between px-4 gap-4">
                   {[35, 45, 20, 65, 80, 45, 30].map((height, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                       <div 
                         className="w-full bg-primary/20 border-4 border-primary/40 rounded-t-xl hover:bg-primary transition-all cursor-help relative" 
                         style={{ height: `${height}%` }}
                       >
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border-2">
                            {height * 10}XP
                          </div>
                       </div>
                       <span className="text-xs font-black text-muted-foreground uppercase">
                         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                       </span>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>

        </div>

        {/* Sidebar - Leaderboard & Stats */}
        <div className="space-y-12">
          {/* Leaderboard */}
          <Card className="rounded-[2.5rem] border-4 bg-card shadow-xl overflow-hidden">
             <CardHeader className="bg-primary/10 border-b-4">
               <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <Award className="w-8 h-8 text-primary" />
                  {t("common.leaderboard")}
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y-4">
                  {LEADERBOARD.map((user, i) => (
                    <div key={user.id} className={cn(
                      "flex items-center justify-between p-6 transition-colors",
                      user.isUser ? "bg-primary/20" : "hover:bg-muted"
                    )}>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "font-black text-xl w-8",
                          i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                        <Avatar className="w-12 h-12 border-2 border-primary rounded-xl">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={cn("font-black text-lg", user.isUser ? "text-primary" : "text-foreground")}>{user.name}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase">{user.xp.toLocaleString()} XP</p>
                        </div>
                      </div>
                      {i === 0 && <Trophy className="w-6 h-6 text-yellow-400 fill-current" />}
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-muted/30 text-center border-t-4">
                  <Button variant="ghost" className="font-black text-primary hover:text-primary/80 hover:bg-transparent text-lg">
                    View Full Rankings
                  </Button>
                </div>
             </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6">
             <Card className="rounded-3xl border-4 p-8 bg-card shadow-lg group hover:scale-105 transition-transform">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-3xl font-black">12.5H</p>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Learning Time</p>
                  </div>
                </div>
                <p className="text-sm font-black text-green-500 uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-current" /> ↑ 12% from last week
                </p>
             </Card>
             <Card className="rounded-3xl border-4 p-8 bg-card shadow-lg group hover:scale-105 transition-transform">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-3xl font-black">42</p>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Lessons Done</p>
                  </div>
                </div>
                <p className="text-sm font-black text-green-500 uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-current" /> ↑ 5 new today
                </p>
             </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
