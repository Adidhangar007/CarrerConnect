import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";

const stats = [
  { label: "Open Positions", value: "12,500+", icon: <Briefcase size={20} /> },
  { label: "Top Companies", value: "850+", icon: <Building2 size={20} /> },
  {
    label: "Hired This Month",
    value: "2,300+",
    icon: <TrendingUp size={20} />,
  },
  { label: "Active Job Seekers", value: "45,000+", icon: <Users size={20} /> },
];

const featuredCategories = [
  "Software Engineering",
  "Product Design",
  "Data Science",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Customer Success",
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-card border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary bg-primary/5"
              >
                🚀 The Future of Hiring
              </Badge>
              <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight mb-5">
                Connect With Your{" "}
                <span className="text-primary">Dream Career</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                CareerConnect bridges talented professionals with top employers.
                Find the right opportunity or the right candidate — all in one
                place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="gap-2"
                      data-ocid="hero.dashboard_button"
                    >
                      Go to Dashboard <ArrowRight size={16} />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        size="lg"
                        className="gap-2"
                        data-ocid="hero.get_started_button"
                      >
                        Get Started <ArrowRight size={16} />
                      </Button>
                    </Link>
                    <Link to="/jobs">
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-2"
                        data-ocid="hero.browse_jobs_button"
                      >
                        <Search size={16} /> Browse Jobs
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:block"
            >
              <img
                src="/assets/generated/hero-career-connect.dim_1200x600.png"
                alt="CareerConnect platform illustration"
                className="w-full rounded-2xl shadow-elevated object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-background py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-5 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  {stat.icon}
                </div>
                <span className="font-display text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground mt-0.5">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30 py-14 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Explore by Category
            </h2>
            <p className="text-muted-foreground">
              Discover opportunities across all industries
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {featuredCategories.map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to="/jobs">
                  <Badge
                    variant="secondary"
                    className="text-sm px-4 py-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-smooth border border-transparent hover:border-primary/20"
                    data-ocid={`landing.category.${i + 1}`}
                  >
                    {cat}
                  </Badge>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Looking for Work?",
                description:
                  "Create a profile, browse thousands of open positions, and apply with one click.",
                cta: "Find Jobs",
                to: "/login",
                ocid: "landing.seeker_cta_button",
                bg: "bg-primary/5 border-primary/20",
                btnVariant: "default" as const,
              },
              {
                title: "Hiring Talent?",
                description:
                  "Post jobs, review applications, and connect with qualified candidates quickly.",
                cta: "Post a Job",
                to: "/login",
                ocid: "landing.employer_cta_button",
                bg: "bg-accent/5 border-accent/20",
                btnVariant: "outline" as const,
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`rounded-2xl border p-8 ${card.bg}`}
              >
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="text-muted-foreground mb-6">{card.description}</p>
                <Link to={card.to}>
                  <Button
                    variant={card.btnVariant}
                    className="gap-2"
                    data-ocid={card.ocid}
                  >
                    {card.cta} <ArrowRight size={16} />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
