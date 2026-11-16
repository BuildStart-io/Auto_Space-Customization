import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, CalendarDays, Clock, Car, Wrench, Loader2, Phone, MessageSquare, Trash2, Download, CalendarCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow, isYesterday, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import LimitWarningBanner from "@/components/LimitWarningBanner";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  whatsapp_phone: string | null;
  district: string | null;
  customer_address: string | null;
  vehicle_details?: string | null;
  service_requested?: string | null;
  allocated_slot?: string | null;
  order_items: unknown;
  special_instructions: string | null;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface SlotDateInfo {
  category: "today" | "tomorrow" | "upcoming" | "past";
  label: string;
  badgeLabel: string;
  formattedDate: string;
  formattedTime: string;
  badgeClass: string;
  dotClass: string;
}

const getOrderDateInfo = (slot: string | null | undefined, createdAt: string): SlotDateInfo => {
  let targetDate: Date | null = null;
  if (slot) {
    const d = new Date(slot);
    if (!isNaN(d.getTime())) targetDate = d;
  }
  if (!targetDate) {
    const c = new Date(createdAt);
    if (!isNaN(c.getTime())) targetDate = c;
  }
  if (!targetDate) {
    return {
      category: "upcoming",
      label: "Scheduled",
      badgeLabel: "Scheduled",
      formattedDate: "Scheduled",
      formattedTime: "",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300",
      dotClass: "bg-purple-500",
    };
  }

  const todayStart = startOfDay(new Date());

  if (isToday(targetDate)) {
    return {
      category: "today",
      label: "Today",
      badgeLabel: "Today",
      formattedDate: "Today",
      formattedTime: format(targetDate, "h:mm a"),
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      dotClass: "bg-emerald-500",
    };
  }
  if (isTomorrow(targetDate)) {
    return {
      category: "tomorrow",
      label: "Tomorrow",
      badgeLabel: "Tomorrow",
      formattedDate: "Tomorrow",
      formattedTime: format(targetDate, "h:mm a"),
      badgeClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      dotClass: "bg-blue-500",
    };
  }
  if (isYesterday(targetDate)) {
    return {
      category: "past",
      label: "Yesterday",
      badgeLabel: "Yesterday",
      formattedDate: "Yesterday",
      formattedTime: format(targetDate, "h:mm a"),
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
      dotClass: "bg-amber-500",
    };
  }
  if (targetDate < todayStart) {
    return {
      category: "past",
      label: "Past Date",
      badgeLabel: "Past",
      formattedDate: format(targetDate, "MMM d, yyyy"),
      formattedTime: format(targetDate, "h:mm a"),
      badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
      dotClass: "bg-zinc-400",
    };
  }
  return {
    category: "upcoming",
    label: "Upcoming",
    badgeLabel: "Upcoming",
    formattedDate: format(targetDate, "MMM d, yyyy"),
    formattedTime: format(targetDate, "h:mm a"),
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    dotClass: "bg-purple-500",
  };
};

const statusColors: Record<string, string> = {
  allocated: "bg-emerald-100 text-emerald-800 border-emerald-300",
  checked_in: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  rescheduled: "bg-amber-100 text-amber-800 border-amber-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-purple-100 text-purple-800",
};

const statusOptions = [
  { value: "allocated", label: "Slot Allocated" },
  { value: "checked_in", label: "Vehicle Checked In" },
  { value: "completed", label: "Modification Completed" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "cancelled", label: "Cancelled" },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"slot" | "order_date">("slot");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customDate, setCustomDate] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      let query = (supabase.from("orders" as any) as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching time slots",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await (supabase.from("orders" as any) as any)
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast({ title: "Time slot status updated" });
      fetchOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await (supabase.from("orders" as any) as any).delete().eq("id", orderId);
      if (error) throw error;
      toast({ title: "Appointment removed" });
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast({ title: "Error deleting appointment", description: error.message, variant: "destructive" });
    }
  };

  const slotCounts = orders.reduce(
    (acc, order) => {
      const info = getOrderDateInfo(order.allocated_slot, order.created_at);
      acc[info.category] = (acc[info.category] || 0) + 1;
      return acc;
    },
    { today: 0, tomorrow: 0, upcoming: 0, past: 0 } as Record<string, number>
  );

  const orderDateCounts = orders.reduce(
    (acc, order) => {
      const c = new Date(order.created_at);
      if (isToday(c)) acc.today++;
      else if (isYesterday(c)) acc.yesterday++;
      else if (Date.now() - c.getTime() <= 7 * 24 * 60 * 60 * 1000) acc.week++;
      else acc.older++;
      return acc;
    },
    { today: 0, yesterday: 0, week: 0, older: 0 }
  );

  const filteredOrders = orders.filter((order) => {
    // 1. If an exact custom date is picked via calendar input
    if (customDate) {
      const target = filterMode === "slot"
        ? (order.allocated_slot ? new Date(order.allocated_slot) : new Date(order.created_at))
        : new Date(order.created_at);
      return format(target, "yyyy-MM-dd") === customDate;
    }

    // 2. Tab filter
    if (dateFilter === "all") return true;

    if (filterMode === "slot") {
      const info = getOrderDateInfo(order.allocated_slot, order.created_at);
      return info.category === dateFilter;
    } else {
      const c = new Date(order.created_at);
      if (dateFilter === "today") return isToday(c);
      if (dateFilter === "yesterday") return isYesterday(c);
      if (dateFilter === "week") return Date.now() - c.getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === "older") return !isToday(c) && !isYesterday(c) && (Date.now() - c.getTime() > 7 * 24 * 60 * 60 * 1000);
      return true;
    }
  });

  const exportOrders = (type: "csv" | "excel") => {
    const listToExport = filteredOrders;
    const headers = [
      "Appointment ID",
      "Customer Name",
      "Phone",
      "Allocated Time Slot",
      "Booked On (Order Date)",
      "Vehicle Details",
      "Modification Service",
      "Quoted Price",
      "Status",
      "Created At",
    ];

    const rows = listToExport.map((o) => {
      const service = o.service_requested || (Array.isArray(o.order_items) ? (o.order_items as any[])[0]?.name : "Modification");
      const dateInfo = getOrderDateInfo(o.allocated_slot, o.created_at);
      const slotText = dateInfo.formattedDate ? `${dateInfo.formattedDate} at ${dateInfo.formattedTime}` : (o.allocated_slot || "Agreed in chat");
      const bookedOnText = format(new Date(o.created_at), "yyyy-MM-dd HH:mm");
      return [
        o.id.slice(0, 8),
        o.customer_name,
        o.customer_phone,
        slotText,
        bookedOnText,
        o.vehicle_details || "",
        service || "",
        o.total_amount ? o.total_amount.toFixed(2) : "0.00",
        o.status,
        format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: type === "excel"
        ? "application/vnd.ms-excel;charset=utf-8"
        : "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filterLabel = statusFilter === "all" ? "all" : statusFilter;
    a.download = `time-slots-${filterLabel}-${format(new Date(), "yyyy-MM-dd")}.${type === "excel" ? "xls" : "csv"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: `Time slots exported as ${type === "excel" ? "Excel" : "CSV"}` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <LimitWarningBanner type="orders" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Time Slots & Appointments</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage workshop vehicle modification appointments and customer time slots
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground hidden sm:inline">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportOrders("csv")} disabled={filteredOrders.length === 0}>
              <Download className="mr-1.5 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportOrders("excel")} disabled={filteredOrders.length === 0}>
              <Download className="mr-1.5 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Allocated Customer Slots</CardTitle>
                <CardDescription>
                  {filteredOrders.length} of {orders.length} appointment{orders.length !== 1 ? "s" : ""} shown
                </CardDescription>
              </div>

              {/* Mode Switcher & Date Picker */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filter Mode Toggle */}
                <div className="flex items-center bg-muted p-1 rounded-lg border text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode("slot");
                      setDateFilter("all");
                      setCustomDate("");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all",
                      filterMode === "slot" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                    By Slot Date
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode("order_date");
                      setDateFilter("all");
                      setCustomDate("");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all",
                      filterMode === "order_date" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                    By Order Date
                  </button>
                </div>

                {/* Specific Date Picker Input */}
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setDateFilter("custom");
                    }}
                    className="h-8 text-xs w-[140px]"
                    title={`Filter by exact ${filterMode === "slot" ? "appointment slot" : "order placed"} date`}
                  />
                  {customDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setCustomDate("");
                        setDateFilter("all");
                      }}
                      title="Clear exact date"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Date Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              {filterMode === "slot" ? (
                <>
                  <Button
                    variant={dateFilter === "all" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("all"); setCustomDate(""); }}
                    className="h-8 text-xs font-medium"
                  >
                    All Slots ({orders.length})
                  </Button>
                  <Button
                    variant={dateFilter === "today" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("today"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "today" && !customDate
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                        : "text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Today ({slotCounts.today})
                  </Button>
                  <Button
                    variant={dateFilter === "tomorrow" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("tomorrow"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "tomorrow" && !customDate
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        : "text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Tomorrow ({slotCounts.tomorrow})
                  </Button>
                  <Button
                    variant={dateFilter === "upcoming" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("upcoming"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "upcoming" && !customDate
                        ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                        : "text-purple-700 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Upcoming ({slotCounts.upcoming})
                  </Button>
                  <Button
                    variant={dateFilter === "past" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("past"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "past" && !customDate
                        ? "bg-zinc-700 hover:bg-zinc-800 text-white border-zinc-700"
                        : "text-zinc-600 border-zinc-300 hover:bg-zinc-100 dark:text-zinc-400 dark:border-zinc-700"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    Past / Yesterday ({slotCounts.past})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={dateFilter === "all" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("all"); setCustomDate(""); }}
                    className="h-8 text-xs font-medium"
                  >
                    All Orders ({orders.length})
                  </Button>
                  <Button
                    variant={dateFilter === "today" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("today"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "today" && !customDate
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                        : "text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Placed Today ({orderDateCounts.today})
                  </Button>
                  <Button
                    variant={dateFilter === "yesterday" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("yesterday"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "yesterday" && !customDate
                        ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                        : "text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Placed Yesterday ({orderDateCounts.yesterday})
                  </Button>
                  <Button
                    variant={dateFilter === "week" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("week"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "week" && !customDate
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        : "text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Past 7 Days ({orderDateCounts.week})
                  </Button>
                  <Button
                    variant={dateFilter === "older" && !customDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDateFilter("older"); setCustomDate(""); }}
                    className={cn(
                      "h-8 text-xs font-medium gap-1.5",
                      dateFilter === "older" && !customDate
                        ? "bg-zinc-700 hover:bg-zinc-800 text-white border-zinc-700"
                        : "text-zinc-600 border-zinc-300 hover:bg-zinc-100 dark:text-zinc-400 dark:border-zinc-700"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    Older ({orderDateCounts.older})
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {statusFilter === "all" 
                    ? "No appointments allocated yet. Appointments will appear here as customers book via WhatsApp." 
                    : `No ${statusFilter} appointments found.`}
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-3">
                  No appointments found for {customDate ? `date: ${customDate}` : `filter: "${dateFilter}"`} (Mode: {filterMode === "slot" ? "Slot Date" : "Order Date"})
                </p>
                <Button variant="outline" size="sm" onClick={() => { setDateFilter("all"); setCustomDate(""); }}>
                  View All ({orders.length})
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile: Card layout */}
                <div className="space-y-3 md:hidden">
                  {filteredOrders.map((order) => {
                    const serviceName = order.service_requested || (Array.isArray(order.order_items) ? (order.order_items as any[])[0]?.name : "Vehicle Modification");
                    const dateInfo = getOrderDateInfo(order.allocated_slot, order.created_at);
                    return (
                      <div key={order.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                          </div>
                          <Badge className={statusColors[order.status] || "bg-muted text-foreground"}>
                            {statusOptions.find((s) => s.value === order.status)?.label || order.status}
                          </Badge>
                        </div>
                        <div className="text-xs space-y-2 bg-muted/50 p-2.5 rounded">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border", dateInfo.badgeClass)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dateInfo.dotClass)} />
                              {dateInfo.formattedDate}
                            </span>
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              {dateInfo.formattedTime}
                            </span>
                          </div>
                          {order.vehicle_details && (
                            <p className="flex items-center gap-1 text-muted-foreground">
                              <Car className="h-3.5 w-3.5" />
                              {order.vehicle_details}
                            </p>
                          )}
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Wrench className="h-3.5 w-3.5" />
                            {serviceName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                            <CalendarDays className="h-3 w-3 text-primary" />
                            <span>Booked on {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-foreground">LKR {order.total_amount ? order.total_amount.toLocaleString() : "0"}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/dashboard/conversations?phone=${encodeURIComponent(order.whatsapp_phone || order.customer_phone)}`)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Booked On</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Service / Package</TableHead>
                        <TableHead>Quoted Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const serviceName = order.service_requested || (Array.isArray(order.order_items) ? (order.order_items as any[])[0]?.name : "Vehicle Modification");
                        const dateInfo = getOrderDateInfo(order.allocated_slot, order.created_at);
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-xs", dateInfo.badgeClass)}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dateInfo.dotClass)} />
                                  {dateInfo.formattedDate}
                                </span>
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1 pl-1">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                  {dateInfo.formattedTime}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                  {format(new Date(order.created_at), "MMM d, yyyy")}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 pl-5">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(order.created_at), "h:mm a")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.customer_name}</p>
                                <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-sm font-medium">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                {order.vehicle_details || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-sm">
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                                {serviceName}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold">
                              LKR {order.total_amount ? order.total_amount.toLocaleString() : "0"}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-[175px]">
                                  <Badge className={statusColors[order.status] || "bg-muted text-foreground"}>
                                    {statusOptions.find((s) => s.value === order.status)?.label || order.status}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Open WhatsApp Chat"
                                  onClick={() => navigate(`/dashboard/conversations?phone=${encodeURIComponent(order.whatsapp_phone || order.customer_phone)}`)}
                                >
                                  <MessageSquare className="h-4 w-4 text-primary" />
                                </Button>
                                <Button variant="ghost" size="icon" title="View Details" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Appointment</AlertDialogTitle>
                                      <AlertDialogDescription>This will remove this allocated time slot record. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteOrder(order.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Time Slot Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Appointment #{selectedOrder?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (() => {
              const selectedDateInfo = getOrderDateInfo(selectedOrder.allocated_slot, selectedOrder.created_at);
              return (
                <div className="space-y-6">
                  {/* Time Slot Banner */}
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/20 rounded-lg text-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Allocated Workshop Slot</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border", selectedDateInfo.badgeClass)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", selectedDateInfo.dotClass)} />
                            {selectedDateInfo.formattedDate}
                          </span>
                          <span className="text-base font-bold text-foreground">
                            {selectedDateInfo.formattedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={statusColors[selectedOrder.status] || "bg-muted text-foreground"}>
                      {statusOptions.find((s) => s.value === selectedOrder.status)?.label || selectedOrder.status}
                    </Badge>
                  </div>

                  {/* Customer & Vehicle Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 border p-3 rounded-md bg-card">
                      <h4 className="font-medium text-xs text-muted-foreground">Customer</h4>
                      <p className="font-semibold text-sm">{selectedOrder.customer_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                        <Phone className="h-3 w-3" /> {selectedOrder.customer_phone}
                      </p>
                    </div>
                    <div className="space-y-1 border p-3 rounded-md bg-card">
                      <h4 className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                        <Car className="h-3 w-3 text-primary" /> Vehicle
                      </h4>
                      <p className="font-semibold text-sm">{selectedOrder.vehicle_details || "Not specified"}</p>
                      <p className="text-xs text-muted-foreground">Workshop on-site arrival</p>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> Requested Modification Service
                    </h4>
                    <div className="border rounded-lg p-3 bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {selectedOrder.service_requested || (Array.isArray(selectedOrder.order_items) ? (selectedOrder.order_items as any[])[0]?.name : "Vehicle Modification")}
                        </p>
                        <p className="font-bold text-primary">
                          LKR {selectedOrder.total_amount ? selectedOrder.total_amount.toLocaleString() : "0"}
                        </p>
                      </div>
                      {selectedOrder.special_instructions && (
                        <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                          {selectedOrder.special_instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Update & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Update Slot Status</h4>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                      >
                        <SelectTrigger className="w-[190px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const chatPhone = selectedOrder.whatsapp_phone || selectedOrder.customer_phone;
                          setSelectedOrder(null);
                          navigate(`/dashboard/conversations?phone=${encodeURIComponent(chatPhone)}`);
                        }}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat on WhatsApp
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Booked {format(new Date(selectedOrder.created_at), "PP")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
