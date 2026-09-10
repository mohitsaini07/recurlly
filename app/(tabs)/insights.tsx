import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/context/SubscriptionContext';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { formatCurrency } from '@/lib/utils';

type ViewMode = 'week' | 'month';

const Insights = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { subscriptions, currency } = useSubscriptions();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Compute upcoming renewal dates for all active subscriptions
  const activeSubscriptionsWithRenewals = useMemo(() => {
    const now = dayjs();
    return subscriptions
      .filter((s) => s.status === 'active')
      .map((s) => {
        let renewal = dayjs(s.renewalDate || s.startDate || now);
        const isYearly = s.frequency === 'Yearly' || s.billing === 'Yearly';
        while (renewal.isBefore(now, 'day')) {
          renewal = renewal.add(1, isYearly ? 'year' : 'month');
        }
        const daysLeft = renewal.diff(now, 'day');
        return {
          ...s,
          computedRenewal: renewal,
          daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  // Dynamic monthly normalized expenses calculation
  const totalExpenses = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        if (s.frequency === 'Yearly' || s.billing === 'Yearly') {
          return sum + s.price / 12;
        }
        return sum + s.price;
      }, 0);
  }, [subscriptions]);

  // Real month-over-month trend calculation
  const trendInfo = useMemo(() => {
    const startOfCurrentMonth = dayjs().startOf('month');
    const prevMonthSpend = subscriptions
      .filter(
        (s) =>
          s.status === 'active' &&
          s.startDate &&
          dayjs(s.startDate).isBefore(startOfCurrentMonth)
      )
      .reduce((sum, s) => {
        if (s.frequency === 'Yearly' || s.billing === 'Yearly') {
          return sum + s.price / 12;
        }
        return sum + s.price;
      }, 0);

    if (prevMonthSpend > 0) {
      const diff = ((totalExpenses - prevMonthSpend) / prevMonthSpend) * 100;
      const sign = diff >= 0 ? '+' : '';
      return `${sign}${diff.toFixed(0)}% vs last mo.`;
    }
    const activeCount = subscriptions.filter((s) => s.status === 'active').length;
    return `${activeCount} active`;
  }, [subscriptions, totalExpenses]);

  // Week View: 7 days based on current weekOffset
  const weekStart = useMemo(() => {
    return dayjs().add(weekOffset * 7, 'day').startOf('day');
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = weekStart.add(i, 'day');
      const dateKey = date.format('YYYY-MM-DD');
      const isToday = date.isSame(dayjs(), 'day');

      const matchingSubs = activeSubscriptionsWithRenewals.filter((s) =>
        s.computedRenewal.isSame(date, 'day')
      );
      const totalDayValue = matchingSubs.reduce((sum, s) => sum + s.price, 0);

      return {
        key: dateKey,
        day: date.format('ddd'),
        dateNum: date.format('D'),
        fullDate: date.format('MMM D, YYYY'),
        isToday,
        value: totalDayValue,
        subscriptions: matchingSubs,
      };
    });
  }, [weekStart, activeSubscriptionsWithRenewals]);

  // Month View: 4 intervals (weeks) of upcoming 28 days
  const monthWeeks = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const start = dayjs().add(i * 7, 'day').startOf('day');
      const end = dayjs().add((i + 1) * 7 - 1, 'day').endOf('day');
      const weekKey = `w-${i}`;

      const matchingSubs = activeSubscriptionsWithRenewals.filter((s) => {
        const ren = s.computedRenewal;
        return (ren.isAfter(start) || ren.isSame(start, 'day')) &&
               (ren.isBefore(end) || ren.isSame(end, 'day'));
      });
      const totalWeekValue = matchingSubs.reduce((sum, s) => sum + s.price, 0);

      return {
        key: weekKey,
        day: `W${i + 1}`,
        dateNum: `${start.format('D')}-${end.format('D')}`,
        fullDate: `${start.format('MMM D')} – ${end.format('MMM D')}`,
        isToday: i === 0,
        value: totalWeekValue,
        subscriptions: matchingSubs,
      };
    });
  }, [activeSubscriptionsWithRenewals]);

  // Active chart items according to viewMode
  const chartData = viewMode === 'week' ? weekDays : monthWeeks;

  // Selected chart item
  const selectedItem = useMemo(() => {
    return chartData.find((d) => d.key === selectedKey) || null;
  }, [chartData, selectedKey]);

  // Dynamic Y-Axis scale calculation
  const { ceiling, yAxisTicks } = useMemo(() => {
    const rawMax = Math.max(...chartData.map((d) => d.value), 0);
    let scaleCeil = 50;
    if (rawMax > 0) {
      if (rawMax <= 20) scaleCeil = 25;
      else if (rawMax <= 50) scaleCeil = 50;
      else if (rawMax <= 100) scaleCeil = 100;
      else if (rawMax <= 250) scaleCeil = 250;
      else scaleCeil = Math.ceil(rawMax / 50) * 50;
    }
    const ticks = [
      scaleCeil,
      Math.round(scaleCeil * 0.75),
      Math.round(scaleCeil * 0.5),
      Math.round(scaleCeil * 0.25),
      0,
    ];
    return { ceiling: scaleCeil, yAxisTicks: ticks };
  }, [chartData]);

  const handleBarPress = (itemKey: string) => {
    const nextKey = selectedKey === itemKey ? null : itemKey;
    setSelectedKey(nextKey);
    posthog.capture('insights_chart_bar_selected', { key: nextKey, viewMode });
  };

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedKey(null);
    posthog.capture('insights_view_mode_changed', { mode });
  };

  // Subscriptions to display in the bottom list
  const displayedSubscriptions = useMemo(() => {
    if (selectedItem) {
      return selectedItem.subscriptions;
    }
    if (showAllHistory) {
      return subscriptions;
    }
    return activeSubscriptionsWithRenewals;
  }, [selectedItem, showAllHistory, subscriptions, activeSubscriptionsWithRenewals]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <Animated.ScrollView
        entering={FadeIn.duration(400)}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <TouchableOpacity
            className="w-12 h-12 rounded-full border border-black/10 items-center justify-center bg-transparent"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#081126" />
          </TouchableOpacity>
          <Text className="text-2xl font-sans-bold text-primary">Monthly Insights</Text>
          <TouchableOpacity
            className="w-12 h-12 rounded-full border border-black/10 items-center justify-center bg-transparent"
            onPress={() => {
              setSelectedKey(null);
              setWeekOffset(0);
              posthog.capture('insights_reset_tapped');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={22} color="#081126" />
          </TouchableOpacity>
        </View>

        {/* Upcoming Section Header & Mode Toggle */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-sans-bold text-primary">Upcoming</Text>

          {/* Week / Month Toggle Pills */}
          <View className="flex-row items-center bg-black/5 rounded-full p-1 border border-black/5">
            <TouchableOpacity
              onPress={() => handleModeChange('week')}
              className={clsx(
                'px-3.5 py-1 rounded-full',
                viewMode === 'week' ? 'bg-primary' : 'bg-transparent'
              )}
              activeOpacity={0.8}
            >
              <Text
                className={clsx(
                  'text-xs font-sans-bold',
                  viewMode === 'week' ? 'text-white' : 'text-primary/70'
                )}
              >
                7 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleModeChange('month')}
              className={clsx(
                'px-3.5 py-1 rounded-full',
                viewMode === 'month' ? 'bg-primary' : 'bg-transparent'
              )}
              activeOpacity={0.8}
            >
              <Text
                className={clsx(
                  'text-xs font-sans-bold',
                  viewMode === 'month' ? 'text-white' : 'text-primary/70'
                )}
              >
                4 Weeks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Week Navigator (shown only when in Week view) */}
        {viewMode === 'week' ? (
          <View className="flex-row items-center justify-between mb-3 px-1">
            <TouchableOpacity
              onPress={() => setWeekOffset((prev) => prev - 1)}
              className="w-8 h-8 rounded-full border border-black/10 items-center justify-center bg-white/40"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={16} color="#081126" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-sans-semibold text-primary/70">
                {weekStart.format('MMM D')} – {weekStart.add(6, 'day').format('MMM D, YYYY')}
              </Text>
              {weekOffset !== 0 && (
                <TouchableOpacity
                  onPress={() => setWeekOffset(0)}
                  className="bg-accent/20 px-2 py-0.5 rounded-full"
                >
                  <Text className="text-[10px] font-sans-bold text-accent">Today</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setWeekOffset((prev) => prev + 1)}
              className="w-8 h-8 rounded-full border border-black/10 items-center justify-center bg-white/40"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color="#081126" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mb-3 px-1">
            <Text className="text-xs font-sans-semibold text-primary/60">
              Upcoming 4-week renewal breakdown
            </Text>
          </View>
        )}

        {/* Dynamic Bar Chart Card */}
        <View className="bg-[#f8eed1] rounded-3xl p-5 mb-6">
          <View className="h-56 flex-row">
            {/* Dynamic Y Axis Labels */}
            <View className="justify-between items-end mr-3 py-6">
              {yAxisTicks.map((val) => (
                <Text key={val} className="text-xs font-sans-semibold text-primary/50">
                  {val}
                </Text>
              ))}
            </View>

            {/* Chart Canvas */}
            <View className="flex-1 relative">
              {/* Grid Lines */}
              <View className="absolute inset-0 justify-between py-8">
                {yAxisTicks.map((_, i) => (
                  <View key={i} className="border-b border-dashed border-black/10 w-full h-0" />
                ))}
              </View>

              {/* Dynamic Interactive Bars */}
              <View className="flex-1 flex-row justify-between items-end pt-8 pb-8 px-1">
                {chartData.map((d) => {
                  const isSelected = selectedKey === d.key;
                  const safeCeiling = ceiling > 0 ? ceiling : 50;
                  const safeVal = Number(d.value) || 0;
                  const barHeightPercent =
                    safeVal > 0
                      ? Math.max(Math.min((safeVal / safeCeiling) * 100, 100), 12)
                      : 6;

                  return (
                    <Pressable
                      key={d.key}
                      onPress={() => handleBarPress(d.key)}
                      className="items-center relative h-full justify-end flex-1"
                    >
                      {/* Floating Tooltip for Selected Bar */}
                      {isSelected && (
                        <Animated.View
                          entering={FadeIn.duration(200)}
                          className="absolute bg-accent px-2.5 py-1 rounded-lg items-center justify-center shadow-md z-30"
                          style={{
                            bottom: `${barHeightPercent}%`,
                            marginBottom: 8,
                          }}
                        >
                          <Text className="text-white text-xs font-sans-bold">
                            {formatCurrency(safeVal, currency)}
                          </Text>
                        </Animated.View>
                      )}

                      {/* Bar Pillar */}
                      <View
                        style={{ height: `${barHeightPercent}%` }}
                        className={clsx(
                          'rounded-full z-10',
                          viewMode === 'month' ? 'w-5' : 'w-3.5',
                          isSelected
                            ? 'bg-accent'
                            : safeVal > 0
                            ? 'bg-primary'
                            : 'bg-black/15'
                        )}
                      />

                      {/* Day Label & Date */}
                      <View className="absolute -bottom-7 left-0 right-0 items-center">
                        <Text
                          className={clsx(
                            'text-[11px] font-sans-semibold',
                            isSelected
                              ? 'text-accent font-sans-bold'
                              : d.isToday
                              ? 'text-primary font-sans-bold'
                              : 'text-primary/50'
                          )}
                        >
                          {d.day}
                        </Text>
                        <Text
                          className={clsx(
                            'text-[9px] font-sans-medium',
                            isSelected ? 'text-accent font-sans-bold' : 'text-primary/40'
                          )}
                        >
                          {d.dateNum}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Linked Dynamic Expenses Summary Card */}
        <Animated.View
          layout={LinearTransition.springify().damping(14)}
          className="border border-black/10 rounded-3xl p-5 mb-8 bg-transparent"
        >
          {selectedItem ? (
            <>
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl font-sans-bold text-primary">
                    Expenses ({selectedItem.day} {selectedItem.dateNum})
                  </Text>
                  <View className="bg-accent/20 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-sans-bold text-accent">Selected</Text>
                  </View>
                </View>
                <Text className="text-xl font-sans-bold text-primary">
                  -{formatCurrency(selectedItem.value, currency)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-sm font-sans-medium text-primary/70">
                  {selectedItem.subscriptions.length} renewal
                  {selectedItem.subscriptions.length === 1 ? '' : 's'} scheduled
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedKey(null)}
                  className="flex-row items-center gap-1 bg-black/5 px-2.5 py-1 rounded-full"
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-sans-bold text-primary">Clear</Text>
                  <Ionicons name="close-circle" size={14} color="#081126" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xl font-sans-bold text-primary">Total Expenses</Text>
                <Text className="text-xl font-sans-bold text-primary">
                  -{formatCurrency(totalExpenses, currency)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-base font-sans-medium text-primary/60">
                  {dayjs().format('MMMM YYYY')}
                </Text>
                <Text className="text-base font-sans-bold text-accent">{trendInfo}</Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* Linked Subscriptions / History Section */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-sans-bold text-primary">
              {selectedItem
                ? `Due on ${selectedItem.day}`
                : showAllHistory
                ? 'All Subscriptions'
                : 'Upcoming Renewals'}
            </Text>
            {selectedItem && (
              <View className="w-2 h-2 rounded-full bg-accent" />
            )}
          </View>

          <TouchableOpacity
            className="px-4 py-1.5 rounded-full border border-black/10"
            onPress={() => {
              if (selectedItem) {
                setSelectedKey(null);
              } else {
                setShowAllHistory((prev) => !prev);
              }
              posthog.capture('insights_view_action_tapped', {
                mode: selectedItem ? 'clear_selection' : showAllHistory ? 'upcoming' : 'all_history',
              });
            }}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-sans-semibold text-primary">
              {selectedItem ? 'Show all' : showAllHistory ? 'Upcoming only' : 'View all'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscriptions List */}
        <View className="pb-28">
          {displayedSubscriptions.length > 0 ? (
            displayedSubscriptions.map((item: any, index: number) => {
              const subtitle =
                item.daysLeft !== undefined
                  ? `Renews in ${item.daysLeft} ${
                      item.daysLeft === 1 ? 'day' : 'days'
                    } • ${dayjs(item.computedRenewal).format('MMM D')}`
                  : undefined;

              return (
                <SubscriptionCard
                  key={item.id || index}
                  {...item}
                  subtitle={subtitle}
                  index={index}
                />
              );
            })
          ) : (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="p-8 rounded-3xl border border-black/10 items-center justify-center bg-white/30 my-2"
            >
              <Ionicons name="calendar-outline" size={40} color="rgba(8, 17, 38, 0.3)" />
              <Text className="text-base font-sans-bold text-primary mt-3">
                No renewals scheduled
              </Text>
              <Text className="text-xs font-sans-medium text-primary/60 mt-1 text-center">
                {selectedItem
                  ? `No subscriptions renew on ${selectedItem.fullDate}.`
                  : 'No active subscriptions scheduled for renewal.'}
              </Text>

              {selectedItem && (
                <TouchableOpacity
                  onPress={() => setSelectedKey(null)}
                  className="mt-4 px-4 py-2 rounded-full bg-primary"
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-sans-bold text-white">
                    Show All Upcoming
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default Insights;