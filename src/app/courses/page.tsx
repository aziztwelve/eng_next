"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Filter, SlidersHorizontal, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCourses } from "@/hooks/use-courses";
import { useLanguage } from "@/lib/i18n";

export default function CoursesPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popular");

  // Fetch courses from API
  const { data: courses, isLoading, error } = useCourses({
    search: searchQuery,
    level: selectedLevels,
    page: 1,
    limit: 20,
    sort: sortBy === "newest" ? "created_at" : undefined,
    order: sortBy === "newest" ? "desc" : undefined,
  });

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black">{t("common.courses")}</h1>
          <p className="text-muted-foreground font-medium">{t("home.heroSubtitle")}</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder={t("common.search")} 
            className="pl-12 h-14 bg-card border-4 rounded-2xl focus-visible:ring-primary font-bold text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 space-y-8 shrink-0">
          <Card className="rounded-[2rem] border-4 p-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-black uppercase tracking-wider">{t("common.filters")}</h3>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-[0.1em] text-muted-foreground">{t("common.level")}</h4>
                  <div className="space-y-3">
                    {["A1-A2", "B1", "B2", "C1-C2"].map((level) => (
                      <div key={level} className="flex items-center space-x-3 group cursor-pointer">
                        <Checkbox 
                          id={`level-${level}`} 
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleLevel(level)}
                          className="w-6 h-6 rounded-lg border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor={`level-${level}`} className="text-lg font-bold cursor-pointer group-hover:text-primary transition-colors">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center h-12 font-black text-primary hover:text-primary/80 hover:bg-transparent"
                    onClick={() => { setSearchQuery(""); setSelectedLevels([]); }}
                  >
                    {t("common.all")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </aside>

        {/* Course Grid */}
        <main className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <p className="font-black text-muted-foreground uppercase tracking-widest text-sm">
              {t("common.courses")}: <span className="text-primary">{courses?.length || 0}</span>
            </p>
            <div className="flex items-center gap-4">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] h-12 bg-card border-4 rounded-xl font-bold">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-4">
                  <SelectItem value="popular" className="font-bold">Most Popular</SelectItem>
                  <SelectItem value="newest" className="font-bold">Newest</SelectItem>
                  <SelectItem value="price-low" className="font-bold">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="font-bold">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="col-span-full py-32 text-center border-4 border-dashed rounded-[3rem]">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-3xl font-black mb-2">{t("common.error")}</h3>
              <p className="text-muted-foreground font-bold mb-8">Failed to load courses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`} className="block group">
                    <Card className="h-full rounded-[2rem] border-4 overflow-hidden hover:shadow-xl transition-all">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={course.image || course.thumbnail_url || 'https://via.placeholder.com/400x225?text=Course'} 
                          alt={course.title} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <Badge className="absolute top-4 left-4 bg-white text-black font-black rounded-xl px-3 py-1">
                          {course.level}
                        </Badge>
                      </div>
                      <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-xl font-black leading-tight group-hover:text-primary transition-colors mb-4">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-3">
                          <img 
                            src={course.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} 
                            className="w-6 h-6 rounded-full border-2 border-primary" 
                            alt={course.instructor || 'Instructor'} 
                          />
                          <span className="font-bold text-muted-foreground">{course.instructor || 'Unknown'}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-6 space-y-6">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center text-yellow-400 font-black">
                            <Star className="w-4 h-4 fill-current mr-1" />
                            {course.rating || 0}
                          </div>
                          <span className="text-xs text-muted-foreground font-black uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4" /> {course.students?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t-4 pt-6">
                          <div className="text-2xl font-black text-primary">
                            {course.price === 0 ? "FREE" : `$${course.price}`}
                          </div>
                          <Button size="sm" variant="ghost" className="font-black text-primary hover:text-primary/80 hover:bg-transparent">
                            {t("common.enroll")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-32 text-center border-4 border-dashed rounded-[3rem]">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-3xl font-black mb-2">No courses found</h3>
                  <p className="text-muted-foreground font-bold mb-8">Try adjusting your filters</p>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl border-4 font-black px-8 h-14" 
                    onClick={() => { setSearchQuery(""); setSelectedLevels([]); }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
