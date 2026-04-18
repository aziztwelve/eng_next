import { GraduationCap, MessageSquare, Rocket, Star } from "lucide-react";

export const LEVELS = [
  {
    id: "a1-a2",
    name: "Beginner",
    code: "A1-A2",
    description: "Start your journey with basic phrases and vocabulary.",
    icon: Rocket,
    color: "bg-green-500 text-white border-green-600",
  },
  {
    id: "b1",
    name: "Elementary",
    code: "B1",
    description: "Build confidence in everyday conversations.",
    icon: MessageSquare,
    color: "bg-blue-500 text-white border-blue-600",
  },
  {
    id: "b2",
    name: "Intermediate",
    code: "B2",
    description: "Master complex grammar and professional topics.",
    icon: GraduationCap,
    color: "bg-purple-500 text-white border-purple-600",
  },
  {
    id: "c1-c2",
    name: "Advanced",
    code: "C1-C2",
    description: "Achieve native-level fluency and nuance.",
    icon: Star,
    color: "bg-orange-500 text-white border-orange-600",
  },
];

export const COURSES = [
  {
    id: "1",
    title: "English for Tech Professionals",
    instructor: "Sarah Jenkins",
    instructorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 4.8,
    reviews: 1240,
    students: 8500,
    price: 49.99,
    level: "B2",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    description: "Master the vocabulary and communication skills needed for the global tech industry.",
    lastUpdated: "March 2024",
    whatYouWillLearn: [
      "Technical jargon and how to use it correctly",
      "Writing professional emails and documentation",
      "Presenting technical concepts to non-technical stakeholders",
      "Leading agile ceremonies in English",
    ],
    modules: [
      {
        title: "Introduction to Tech English",
        lessons: [
          { title: "Course Overview", status: "completed" },
          { title: "Key Industry Terms", status: "current" },
          { title: "Common Acronyms", status: "locked" },
        ],
      },
      {
        title: "The Software Development Lifecycle",
        lessons: [
          { title: "Planning and Requirements", status: "locked" },
          { title: "Development and Testing", status: "locked" },
          { title: "Deployment and Maintenance", status: "locked" },
        ],
      },
      {
        title: "Communication in Agile",
        lessons: [
          { title: "Daily Standups", status: "locked" },
          { title: "Sprint Planning", status: "locked" },
          { title: "Retrospectives", status: "locked" },
        ],
      },
      {
        title: "Technical Writing",
        lessons: [
          { title: "Writing Documentation", status: "locked" },
          { title: "Pull Request Comments", status: "locked" },
          { title: "Bug Reports", status: "locked" },
        ],
      },
      {
        title: "Presentation Skills",
        lessons: [
          { title: "Demoing your work", status: "locked" },
          { title: "Handling Q&A", status: "locked" },
          { title: "Final Project", status: "locked" },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Mastering Everyday Idioms",
    instructor: "David Wilson",
    instructorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 4.9,
    reviews: 850,
    students: 5200,
    price: 0,
    level: "B1",
    image: "https://images.unsplash.com/photo-1543167606-936d9fd2175b?w=800&auto=format&fit=crop&q=60",
    description: "Learn to speak like a native by mastering common English idioms and expressions.",
    lastUpdated: "February 2024",
    whatYouWillLearn: [
      "Over 100 common English idioms",
      "When and where to use specific expressions",
      "The history and origin of popular idioms",
      "Natural-sounding pronunciation",
    ],
    modules: [
      {
        title: "Idioms about Time",
        lessons: [
          { title: "Once in a blue moon", status: "completed" },
          { title: "Better late than never", status: "completed" },
          { title: "Time flies", status: "current" },
        ],
      },
      {
        title: "Idioms about Emotions",
        lessons: [
          { title: "Over the moon", status: "locked" },
          { title: "Under the weather", status: "locked" },
          { title: "Piece of cake", status: "locked" },
        ],
      },
      {
        title: "Workplace Idioms",
        lessons: [
          { title: "Get the ball rolling", status: "locked" },
          { title: "Back to the drawing board", status: "locked" },
          { title: "Think outside the box", status: "locked" },
        ],
      },
      {
        title: "Idioms about Relationships",
        lessons: [
          { title: "See eye to eye", status: "locked" },
          { title: "Break the ice", status: "locked" },
          { title: "Birds of a feather", status: "locked" },
        ],
      },
      {
        title: "Final Review",
        lessons: [
          { title: "Idiom Quiz", status: "locked" },
          { title: "Putting it all together", status: "locked" },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "IELTS Preparation Masterclass",
    instructor: "Emma Thompson",
    instructorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    rating: 4.7,
    reviews: 3100,
    students: 12000,
    price: 79.99,
    level: "C1-C2",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
    description: "Comprehensive preparation for the IELTS Academic and General Training exams.",
    lastUpdated: "January 2024",
    whatYouWillLearn: [
      "Strategies for the Listening, Reading, Writing, and Speaking sections",
      "Time management techniques for the exam",
      "Common pitfalls and how to avoid them",
      "Full-length practice tests and analysis",
    ],
    modules: [
      {
        title: "IELTS Overview",
        lessons: [
          { title: "Exam Format", status: "current" },
          { title: "Scoring System", status: "locked" },
          { title: "Preparation Strategy", status: "locked" },
        ],
      },
      {
        title: "Listening Section",
        lessons: [
          { title: "Question Types", status: "locked" },
          { title: "Note-taking Techniques", status: "locked" },
          { title: "Practice Exercises", status: "locked" },
        ],
      },
      {
        title: "Reading Section",
        lessons: [
          { title: "Skimming and Scanning", status: "locked" },
          { title: "Academic vs General", status: "locked" },
          { title: "Practice Exercises", status: "locked" },
        ],
      },
      {
        title: "Writing Section",
        lessons: [
          { title: "Task 1: Data and Letters", status: "locked" },
          { title: "Task 2: Essay Writing", status: "locked" },
          { title: "Cohesion and Coherence", status: "locked" },
        ],
      },
      {
        title: "Speaking Section",
        lessons: [
          { title: "Part 1: Introduction", status: "locked" },
          { title: "Part 2: Long Turn", status: "locked" },
          { title: "Part 3: Discussion", status: "locked" },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Business English Essentials",
    instructor: "Michael Chen",
    instructorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 4.6,
    reviews: 560,
    students: 3400,
    price: 29.99,
    level: "B1",
    image: "https://images.unsplash.com/photo-1454165833767-027ffea9e778?w=800&auto=format&fit=crop&q=60",
    description: "Essential English skills for the modern business environment.",
    lastUpdated: "March 2024",
    whatYouWillLearn: [
      "Negotiation and persuasion techniques",
      "Effective business writing",
      "Cross-cultural communication",
      "Networking in English",
    ],
    modules: [
      {
        title: "Professional Introductions",
        lessons: [
          { title: "The Elevator Pitch", status: "completed" },
          { title: "First Impressions", status: "completed" },
          { title: "Socializing at Work", status: "completed" },
        ],
      },
      {
        title: "Meetings and Presentations",
        lessons: [
          { title: "Opening a Meeting", status: "current" },
          { title: "Expressing Opinions", status: "locked" },
          { title: "Summarizing Action Items", status: "locked" },
        ],
      },
      {
        title: "Business Correspondence",
        lessons: [
          { title: "Formal vs Informal Emails", status: "locked" },
          { title: "Writing Proposals", status: "locked" },
          { title: "Reports and Memos", status: "locked" },
        ],
      },
      {
        title: "Negotiation Skills",
        lessons: [
          { title: "Making Offers", status: "locked" },
          { title: "Handling Objections", status: "locked" },
          { title: "Closing the Deal", status: "locked" },
        ],
      },
      {
        title: "Global Business Etiquette",
        lessons: [
          { title: "Cultural Nuances", status: "locked" },
          { title: "Remote Collaboration", status: "locked" },
          { title: "Final Assessment", status: "locked" },
        ],
      },
    ],
  },
];

export const USER_STATS = {
  name: "Alex",
  xp: 1250,
  streak: 7,
  level: 12,
  dailyGoal: 50,
  dailyProgress: 35,
  joinedDate: "Jan 2024",
};

export const ACHIEVEMENTS = [
  { id: "1", title: "Early Bird", description: "Complete a lesson before 7 AM", icon: "🌅", unlocked: true },
  { id: "2", title: "Sharp Shooter", description: "Get 10 questions right in a row", icon: "🎯", unlocked: true },
  { id: "3", title: "Wildfire", description: "Maintain a 7-day streak", icon: "🔥", unlocked: true },
  { id: "4", title: "Scholar", description: "Complete 5 full courses", icon: "🎓", unlocked: false },
  { id: "5", title: "Social Butterfly", description: "Interact with 10 community posts", icon: "🦋", unlocked: true },
  { id: "6", title: "Word Smith", description: "Learn 500 new words", icon: "✍️", unlocked: false },
];

export const LEADERBOARD = [
  { id: "1", name: "Sarah W.", xp: 15420, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahW" },
  { id: "2", name: "John D.", xp: 12850, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnD" },
  { id: "3", name: "Mika L.", xp: 11200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MikaL" },
  { id: "4", name: "Alex (You)", xp: 1250, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", isUser: true },
  { id: "5", name: "Priya K.", xp: 950, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaK" },
];

export const MOCK_LESSON = {
  title: "Everyday Idioms",
  question: "What does the idiom 'Piece of cake' mean?",
  options: [
    "Something very difficult",
    "Something very easy",
    "A literal piece of cake",
    "A birthday celebration",
  ],
  correctIndex: 1,
  xp: 15,
  hearts: 5,
};
