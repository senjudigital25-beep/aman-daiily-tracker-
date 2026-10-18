import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import StatCards from '@/components/StatCards';
import TaskSection from '@/components/TaskSection';
import ProgressGraph from '@/components/ProgressGraph';
import CalendarPanel from '@/components/CalendarPanel';
import { todayStrIST } from '@/lib/dateUtils';

export default function Home() {
  const data = useOutletContext();
  const [selectedDate, setSelectedDate] = useState(todayStrIST());

  // keep selected date in sync if "today" changes (e.g. midnight rollover) only if user is on today
  useEffect(() => {
    // no-op; selectedDate persists by user choice
  }, []);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <StatCards
        stats={data.stats}
        outreachForDate={data.outreachForDate}
        setOutreachCount={data.setOutreachCount}
        setOutreachTarget={data.setOutreachTarget}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2 flex flex-col gap-4 lg:gap-6">
          <TaskSection
            tasks={data.tasks}
            selectedDate={selectedDate}
            onAdd={data.addTask}
            onToggle={data.toggleTask}
            onDelete={data.deleteTask}
          />
          <ProgressGraph data={data.stats.last14} />
        </div>
        <div className="xl:col-span-1">
          <div className="xl:sticky xl:top-4">
            <CalendarPanel
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithTasks={data.stats.datesWithTasks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}