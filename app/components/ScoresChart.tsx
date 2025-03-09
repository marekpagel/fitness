'use client';

import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {useMemo} from 'react';
import {Event} from '../types/events';
import {format} from 'date-fns';

type Score = {
  id: number;
  participantId: number;
  event: Event;
  score: number;
  date: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

type Props = {
  scores: Score[];
  participants: Array<{id: number; name: string}>;
  selectedEvent: Event;
  currentMonth: Date;
};

export default function ScoresChart({scores, participants, selectedEvent, currentMonth}: Props) {
  const chartData = useMemo(() => {
    // Get all unique dates for the current month
    const monthDates = scores
      .filter((s) => s.event === selectedEvent && s.date.startsWith(format(currentMonth, 'yyyy-MM')))
      .map((s) => s.date)
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort();

    // Create data points for each date
    return monthDates.map((date) => {
      const dataPoint: {date: string; [key: string]: string | number} = {
        date: format(new Date(date), 'MMM d'),
      };

      // Add score for each participant
      participants.forEach((participant) => {
        const score = scores.find(
          (s) => s.participantId === participant.id && s.date === date && s.event === selectedEvent
        );
        dataPoint[participant.name] = score?.score || 0;
      });

      return dataPoint;
    });
  }, [scores, participants, selectedEvent, currentMonth]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

  return (
    <div className="w-full h-[400px] mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {participants.map((participant, index) => (
            <Line
              key={participant.id}
              type="monotone"
              dataKey={participant.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{r: 4}}
              activeDot={{r: 6}}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
