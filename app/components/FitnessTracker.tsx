'use client';

import {useEffect, useState} from 'react';
import {getParticipants, addScore, getScores} from '../actions/fitness';
import {
  startOfMonth,
  endOfMonth,
  format,
  eachWeekOfInterval,
  eachDayOfInterval,
  isSameMonth,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  endOfWeek,
} from 'date-fns';

// Define types for our data
type Participant = {
  id: number;
  name: string;
  email: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

type Score = {
  id: number;
  participantId: number;
  event: 'pushup_60s' | 'pullup_max';
  score: number;
  date: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

// Helper function to format date as MMM DD
function formatDate(date: Date): string {
  return format(date, 'd');
}

// Helper function to generate weekday dates for the month
function generateWeekdayDates(targetDate: Date = new Date()): {
  weeks: {[key: string]: string[]};
  allDates: string[];
  weekRanges: {[key: string]: string};
} {
  const weeks: {[key: string]: string[]} = {};
  const allDates: string[] = [];
  const weekRanges: {[key: string]: string} = {};

  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  // Get all Mondays in the month
  const weekStarts = eachWeekOfInterval({start: monthStart, end: monthEnd}, {weekStartsOn: 1});

  weekStarts.forEach((weekStart, weekIndex) => {
    const weekEnd = endOfWeek(weekStart, {weekStartsOn: 1});
    const weekDays = eachDayOfInterval({start: weekStart, end: weekEnd})
      .filter((date) => isMonday(date) || isTuesday(date) || isWednesday(date) || isThursday(date) || isFriday(date)) // Only Monday-Friday
      .filter((date) => isSameMonth(date, targetDate)) // Only dates in target month
      .map((date) => format(date, 'yyyy-MM-dd'));

    if (weekDays.length > 0) {
      const weekName = `week${weekIndex + 1}`;
      weeks[weekName] = weekDays;
      allDates.push(...weekDays);

      // Get the first and last actual dates in the week
      const firstDate = new Date(weekDays[0]);
      const lastDate = new Date(weekDays[weekDays.length - 1]);
      weekRanges[weekName] =
        weekDays.length === 1 ? formatDate(firstDate) : `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
    }
  });

  return {weeks, allDates, weekRanges};
}

export default function FitnessTracker() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<'pushup_60s' | 'pullup_max'>('pushup_60s');
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {weeks, allDates, weekRanges} = generateWeekdayDates(currentMonth);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [participantsData, scoresData] = await Promise.all([getParticipants(), getScores()]);
        setParticipants(participantsData);
        setScores(scoresData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get scores for a participant on a specific date and event
  const getScoreForParticipant = (participantId: number, date: string) => {
    return (
      scores.find((s) => s.participantId === participantId && s.date === date && s.event === selectedEvent)?.score ?? ''
    );
  };

  // Calculate total score for a participant for current event
  const getTotalScore = (participantId: number) => {
    return scores
      .filter((s) => s.participantId === participantId && s.event === selectedEvent)
      .reduce((sum, s) => sum + s.score, 0);
  };

  // Calculate average score for a participant for current event
  const getAverageScore = (participantId: number) => {
    const participantScores = scores.filter(
      (s) => s.participantId === participantId && s.event === selectedEvent && s.score > 0
    );
    if (participantScores.length === 0) return '-';
    const average = participantScores.reduce((sum, s) => sum + s.score, 0) / participantScores.length;
    return average.toFixed(1);
  };

  // Update score
  const handleUpdateScore = async (participantId: number, date: string, newScore: number) => {
    try {
      const [updatedScore] = await addScore(participantId, selectedEvent, newScore, date);
      setScores((prev) => {
        const filtered = prev.filter(
          (s) => !(s.participantId === participantId && s.date === date && s.event === selectedEvent)
        );
        return [...filtered, updatedScore];
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const weekdays = ['M', 'Tu', 'W', 'Th', 'F'];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 fitness-tracker">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Group Fitness Tracker</h2>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {/* Month selector */}
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">
              ←
            </button>
            <span className="text-lg font-medium min-w-[120px] text-center">
              {currentMonth.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">
              →
            </button>
          </div>

          {/* Event selector */}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value as 'pushup_60s' | 'pullup_max')}
            className="p-2 border rounded"
          >
            <option value="pushup_60s">Push-ups (60s)</option>
            <option value="pullup_max">Pull-ups (Max)</option>
          </select>
        </div>

        {/* Edit mode toggle */}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isEditMode
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {isEditMode ? '✏️ Edit Mode' : '👀 View Mode'}
        </button>
      </div>

      {/* Participants table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="py-2 px-3 border-b border-r text-left font-medium text-sm">
                Name
              </th>
              {Object.entries(weeks).map(([weekName]) => (
                <th
                  key={weekName}
                  colSpan={weeks[weekName].length}
                  className="py-2 px-2 border-b text-center border-r font-medium text-sm"
                >
                  <div className="text-sm text-gray-600">{weekRanges[weekName]}</div>
                </th>
              ))}
              <th rowSpan={2} className="py-2 px-3 border-b text-center font-medium text-sm min-w-[4ch]">
                Total
              </th>
              <th rowSpan={2} className="py-2 px-3 border-b text-center font-medium text-sm min-w-[4ch]">
                Avg
              </th>
            </tr>
            <tr className="bg-gray-50">
              {Object.values(weeks).map((weekDates) =>
                weekDates.map((_, index) => (
                  <th
                    key={`day-${index}`}
                    className={`py-1 px-1 border-b text-center text-xs font-medium text-gray-600 ${
                      index === weekDates.length - 1 ? 'border-r' : ''
                    }`}
                  >
                    {weekdays[index]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b border-r text-sm">{participant.name}</td>
                {allDates.map((date) => {
                  const score = getScoreForParticipant(participant.id, date);
                  // Find which week this date belongs to
                  const isLastInWeek = Object.values(weeks).some(
                    (weekDates) => weekDates[weekDates.length - 1] === date
                  );

                  return (
                    <td
                      key={`${participant.id}-${date}`}
                      className={`py-1 px-1 border-b text-center min-w-[2rem] w-8 ${isLastInWeek ? 'border-r' : ''}`}
                    >
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={score === '' ? '' : score}
                          onChange={(e) =>
                            handleUpdateScore(
                              participant.id,
                              date,
                              e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full py-0.5 px-0 text-center border rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className="text-sm inline-block w-full">{score || '-'}</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 px-3 border-b text-center font-semibold text-sm min-w-[6ch]">
                  {getTotalScore(participant.id)}
                </td>
                <td className="py-2 px-3 border-b text-center font-semibold text-sm min-w-[6ch]">
                  {getAverageScore(participant.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {participants.length === 0 && <p className="text-center py-4">No participants yet. Add some to get started!</p>}
    </div>
  );
}
