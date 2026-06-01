import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  BarChart3, 
  Shield, 
  Zap, 
  QrCode, 
  FileText,
  Users,
  Globe,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Native mobile apps for iOS and Android with offline capabilities and real-time sync.",
    badge: "Core Feature",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: QrCode,
    title: "Smart Scanning",
    description: "Advanced QR code and barcode scanning with AI-powered asset recognition.",
    badge: "Popular",
    color: "bg-success/10 text-success"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Comprehensive dashboards with customizable reports and data visualization.",
    badge: "Business Intelligence",
    color: "bg-warning/10 text-warning"
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    description: "Built-in compliance frameworks for ISO, OSHA, and industry-specific standards.",
    badge: "Enterprise",
    color: "bg-destructive/10 text-destructive"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-team workflows with role-based permissions and audit trails.",
    badge: "Teamwork",
    color: "bg-accent-foreground/10 text-accent-foreground"
  },
  {
    icon: Globe,
    title: "Cloud Infrastructure",
    description: "Secure cloud hosting with 99.9% uptime and global data synchronization.",
    badge: "Reliable",
    color: "bg-muted-foreground/10 text-muted-foreground"
  }
];

const stats = [
  { label: "Assets Tracked", value: "2.5M+", icon: CheckCircle },
  { label: "Inspections/Month", value: "150K+", icon: FileText },
  { label: "Enterprise Clients", value: "500+", icon: Users },
  { label: "Countries", value: "25+", icon: Globe }
];

export const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Powerful Features
          </Badge>
          <h2 className="text-4xl font-bold mb-6">
            Everything you need for modern{" "}
            <span className="gradient-text">asset management</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            From mobile inspections to comprehensive analytics, our platform provides all the tools your team needs to streamline operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-xl card-gradient shadow-soft hover:shadow-card transition-all duration-300"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};