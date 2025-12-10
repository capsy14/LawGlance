"use client";

import { useState, useEffect } from "react";
import { Newspaper, ExternalLink, X, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: number;
  title: string;
  category: "judgment" | "amendment" | "announcement";
  date: string;
  link?: string;
}

export function LegalNewsTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real news on component mount
  useEffect(() => {
    const fetchLegalNews = async () => {
      try {
        setIsLoading(true);
        // Using NewsAPI - fetches latest legal news from India
        const queries = [
          "legal",
          "law",
          "court",
          "Supreme%20Court",
          "High%20Court"
        ];
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];

        const apiKey =
          process.env.NEXT_PUBLIC_NEWS_API_KEY ||
          "0c44c26e744f400fa79ac6bc71340d73";

        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${randomQuery}%20India&language=en&sortBy=publishedAt&pageSize=8&apiKey=${apiKey}`,
          { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();

        // Transform API data to our format
        const transformedNews: NewsItem[] = data.articles.map(
          (article: any, index: number) => ({
            id: index + 1,
            title: article.title,
            category: determineCategory(article.title, article.description),
            date: article.publishedAt.split("T")[0],
            link: article.url
          })
        );

        setNewsData(transformedNews);
        setError(null);
      } catch (err) {
        console.error("Error fetching legal news:", err);
        setError("Unable to load live news");
        // Fallback to static news
        setNewsData(getFallbackNews());
      } finally {
        setIsLoading(false);
      }
    };

    fetchLegalNews();
  }, []);

  // Determine category based on title/description keywords
  const determineCategory = (
    title: string,
    description: string
  ): NewsItem["category"] => {
    const text = `${title} ${description}`.toLowerCase();

    if (
      text.includes("court") ||
      text.includes("judgment") ||
      text.includes("ruling") ||
      text.includes("verdict")
    ) {
      return "judgment";
    } else if (
      text.includes("amendment") ||
      text.includes("act") ||
      text.includes("bill") ||
      text.includes("law")
    ) {
      return "amendment";
    } else {
      return "announcement";
    }
  };

  // Fallback static news if API fails
  const getFallbackNews = (): NewsItem[] => [
    {
      id: 1,
      title:
        "Supreme Court upholds right to privacy as fundamental right under Article 21",
      category: "judgment",
      date: "2024-12-10"
    },
    {
      id: 2,
      title:
        "New amendment to IT Act 2000 - Digital Personal Data Protection Act effective from Jan 2025",
      category: "amendment",
      date: "2024-12-09"
    },
    {
      id: 3,
      title:
        "Delhi High Court rules on maintenance rights for divorced women under Section 125 CrPC",
      category: "judgment",
      date: "2024-12-08"
    },
    {
      id: 4,
      title:
        "Ministry announces new guidelines for filing FIR online across all states",
      category: "announcement",
      date: "2024-12-07"
    },
    {
      id: 5,
      title:
        "SC: Daughters have equal coparcenary rights in ancestral property - landmark judgment",
      category: "judgment",
      date: "2024-12-06"
    },
    {
      id: 6,
      title:
        "Consumer Protection Act 2019 - New e-commerce rules come into effect",
      category: "amendment",
      date: "2024-12-05"
    },
    {
      id: 7,
      title: "Bombay HC: Right to internet access is a fundamental right",
      category: "judgment",
      date: "2024-12-04"
    },
    {
      id: 8,
      title:
        "Government launches 'Tele-Law' service for free legal advice in rural areas",
      category: "announcement",
      date: "2024-12-03"
    }
  ];

  const getCategoryColor = (category: NewsItem["category"]) => {
    switch (category) {
      case "judgment":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "amendment":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "announcement":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    }
  };

  const getCategoryLabel = (category: NewsItem["category"]) => {
    switch (category) {
      case "judgment":
        return "Judgment";
      case "amendment":
        return "Amendment";
      case "announcement":
        return "News";
    }
  };

  // Show small reopen button when hidden
  if (!isVisible) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          Show Legal Updates
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 border-b border-border overflow-hidden">
      <div className="flex items-center gap-3 py-2.5 px-4">
        {/* Icon */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-primary/10 p-1.5 rounded-md">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Newspaper className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {isLoading
              ? "Loading News..."
              : error
              ? "Legal Updates (Offline)"
              : "Latest Legal Updates"}
          </span>
        </div>

        {/* Scrolling News Container */}
        {!isLoading && newsData.length > 0 && (
          <div
            className="flex-1 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={cn(
                "flex gap-6 animate-scroll-news",
                isPaused && "pause-animation"
              )}
              style={{
                animation: isPaused ? "none" : undefined
              }}
            >
              {/* Duplicate news items for seamless loop */}
              {[...newsData, ...newsData].map((news, index) => (
                <a
                  key={`${news.id}-${index}`}
                  href={news.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-shrink-0 group cursor-pointer"
                >
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wide",
                      getCategoryColor(news.category)
                    )}
                  >
                    {getCategoryLabel(news.category)}
                  </span>
                  <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors whitespace-nowrap">
                    {news.title}
                  </span>
                  {news.link && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(news.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <Button
          onClick={() => setIsVisible(false)}
          size="sm"
          variant="ghost"
          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes scroll-news {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-news {
          animation: scroll-news 60s linear infinite;
        }

        .pause-animation {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
