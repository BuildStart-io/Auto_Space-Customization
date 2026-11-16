import { useEffect, useState } from "react";
import { planLabel } from "@/lib/planLabels";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Package, HelpCircle, ShoppingCart, Users, TrendingUp, Clock, CalendarDays, PauseCircle } from "lucide-react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import LimitWarningBanner from "@/components/LimitWarningBanner";

interface Stats {
  pendingOrders: number;
  recentOrders: any[];
}

export default function Dashboard() {
  const { limits, usage, planTier, billing, loading: limitsLoading } = usePlanLimits();
  const [stats, setStats] = useState<Stats>({ pendingOrders: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pendingRes, recentRes] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "allocated"]),
          supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
        ]);
        setStats({
          pendingOrders: pendingRes.count || 0,
          recentOrders: recentRes.data || [],
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const isReady = !loading && !limitsLoading && usage && limits;

  const usageCards = isReady ? [
    {
      title: "Products",
      used: usage.products,
      max: limits.max_products,
      icon: Package,
    },
    {
      title: "FAQs",
      used: usage.faqs,
      max: limits.max_faqs,
      icon: HelpCircle,
    },
    {
      title: "Orders (This Month)",
      used: usage.orders_this_month,
      max: limits.max_orders_per_month,
      icon: ShoppingCart,
    },
    {
      title: "Contacts (This Month)",
      used: usage.contacts_this_month,
      max: limits.contacts_per_month,
      icon: Users,
    },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Pause Warning */}
        {billing.is_paused && (
          <LimitWarningBanner type="products" />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Overview of your WhatsApp chatbot system
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isReady && billing.next_cycle_date && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Next cycle: {new Date(billing.next_cycle_date).toLocaleDateString()}
              </Badge>
            )}
            {isReady && billing.is_paused && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <PauseCircle className="h-3 w-3" />
                Paused
              </Badge>
            )}
            {isReady && (
              <Badge variant="outline" className="text-sm">
                {planLabel(planTier)} Plan
              </Badge>
            )}
          </div>
        </div>

        {/* Usage Cards with Limits */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {!isReady ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">...</div>
                </CardContent>
              </Card>
            ))
          ) : (
            usageCards.map((card) => {
              const pct = card.max > 0 ? Math.min((card.used / card.max) * 100, 100) : 0;
              const isNearLimit = pct >= 80;
              const isAtLimit = pct >= 100;
              return (
                <Card key={card.title} className={isAtLimit ? "border-destructive/50" : isNearLimit ? "border-yellow-500/50" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">{card.used}</span>
                      <span className="text-sm text-muted-foreground">/ {card.max}</span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-2 ${isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
                    />
                    {isAtLimit && (
                      <p className="text-xs text-destructive font-medium">Limit reached</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Upcoming Time Slots Alert */}
        {stats.pendingOrders > 0 && (
          <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              <div>
                <CardTitle className="text-lg">Upcoming Time Slots</CardTitle>
                <CardDescription>
                  You have {stats.pendingOrders} workshop appointment{stats.pendingOrders > 1 ? "s" : ""} booked and allocated
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Recent Appointments & Bookings
            </CardTitle>
            <CardDescription>Latest vehicle modification bookings from WhatsApp leads</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground">No appointments yet. Bookings will appear here once customers confirm their time slot via WhatsApp.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border gap-2"
                  >
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer_phone}
                        {order.vehicle_details ? ` · 🚗 ${order.vehicle_details}` : ""}
                        {order.service_requested ? ` · 🔧 ${order.service_requested}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:text-right gap-2">
                      <p className="font-medium text-sm sm:text-base">LKR {order.total_amount ? order.total_amount.toLocaleString() : "0"}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'allocated' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'rescheduled' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
