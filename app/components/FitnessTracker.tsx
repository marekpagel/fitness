"use client";

import { useEffect, useState } from "react";
import {
  addParticipant,
  getParticipants,
  addScore,
  getScores,
} from "../actions/fitness";

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
  event: "pushup_60s" | "pullup_max";
  score: number;
  date: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

// Helper function to generate weekday dates for 4 weeks
function generateWeekdayDates(): {
  weeks: { [key: string]: string[] };
  allDates: string[];
} {
  const today = new Date();
  const weeks: { [key: string]: string[] } = {};
  const allDates: string[] = [];

  // Start from Monday of current week
  const monday = new Date(today);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  for (let week = 0; week < 4; week++) {
    const weekDates: string[] = [];
    for (let day = 0; day < 5; day++) {
      // Monday to Friday
      const date = new Date(monday);
      date.setDate(date.getDate() + week * 7 + day);
      const dateStr = date.toISOString().split("T")[0];
      weekDates.push(dateStr);
      allDates.push(dateStr);
    }
    weeks[`Week ${week + 1}`] = weekDates;
  }

  return { weeks, allDates };
}

export default function FitnessTracker() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<
    "pushup_60s" | "pullup_max"
  >("pushup_60s");
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(true);

  const { weeks, allDates } = generateWeekdayDates();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [participantsData, scoresData] = await Promise.all([
          getParticipants(),
          getScores(),
        ]);
        setParticipants(participantsData);
        setScores(scoresData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get scores for a participant on a specific date and event
  const getScoreForParticipant = (participantId: number, date: string) => {
    return (
      scores.find(
        (s) =>
          s.participantId === participantId &&
          s.date === date &&
          s.event === selectedEvent
      )?.score || 0
    );
  };

  // Calculate total score for a participant for current event
  const getTotalScore = (participantId: number) => {
    return scores
      .filter(
        (s) => s.participantId === participantId && s.event === selectedEvent
      )
      .reduce((sum, s) => sum + s.score, 0);
  };

  // Add new participant
  const handleAddParticipant = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    try {
      const [newParticipant] = await addParticipant(newName, newEmail);
      setParticipants([...participants, newParticipant]);
      setNewName("");
      setNewEmail("");
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  // Update score
  const handleUpdateScore = async (
    participantId: number,
    date: string,
    newScore: number
  ) => {
    try {
      const [updatedScore] = await addScore(
        participantId,
        selectedEvent,
        newScore,
        date
      );
      setScores((prev) => {
        const filtered = prev.filter(
          (s) =>
            !(
              s.participantId === participantId &&
              s.date === date &&
              s.event === selectedEvent
            )
        );
        return [...filtered, updatedScore];
      });
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const weekdays = ["M", "T", "W", "T", "F"];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 fitness-tracker">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Group Fitness Tracker</h2>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isEditMode
              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {isEditMode ? "✏️ Edit Mode" : "👀 View Mode"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        {/* Add new participant */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Participant name"
            className={`p-2 border rounded transition-opacity ${
              !isEditMode && "opacity-50"
            }`}
            disabled={!isEditMode}
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border rounded hidden"
          />
          <button
            onClick={handleAddParticipant}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-opacity ${
              !isEditMode && "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isEditMode}
          >
            Add Participant
          </button>
        </div>

        {/* Event selector */}
        <div className="flex gap-2">
          <select
            value={selectedEvent}
            onChange={(e) =>
              setSelectedEvent(e.target.value as "pushup_60s" | "pullup_max")
            }
            className="p-2 border rounded"
          >
            <option value="pushup_60s">Push-ups (60s)</option>
            <option value="pullup_max">Pull-ups (Max)</option>
          </select>
        </div>
      </div>

      {/* Participants table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th
                rowSpan={2}
                className="py-2 px-3 border-b border-r text-left font-medium text-sm"
              >
                Name
              </th>
              {Object.entries(weeks).map(([weekName]) => (
                <th
                  key={weekName}
                  colSpan={5}
                  className="py-2 px-2 border-b text-center border-r font-medium text-sm"
                >
                  {weekName}
                </th>
              ))}
              <th
                rowSpan={2}
                className="py-2 px-3 border-b text-center font-medium text-sm"
              >
                Total
              </th>
            </tr>
            <tr className="bg-gray-50">
              {Object.values(weeks).map((weekDates) =>
                weekDates.map((_, index) => (
                  <th
                    key={`day-${index}`}
                    className="py-1 px-1 border-b text-center text-xs font-medium text-gray-600"
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
                <td className="py-2 px-3 border-b border-r text-sm">
                  {participant.name}
                </td>
                {allDates.map((date) => {
                  const score = getScoreForParticipant(participant.id, date);
                  return (
                    <td
                      key={`${participant.id}-${date}`}
                      className="py-1 px-1 border-b text-center"
                    >
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={score}
                          onChange={(e) =>
                            handleUpdateScore(
                              participant.id,
                              date,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-8 py-0.5 px-0 text-center border rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className="text-sm">{score || "-"}</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 px-3 border-b text-center font-semibold text-sm">
                  {getTotalScore(participant.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {participants.length === 0 && (
        <p className="text-center py-4">
          No participants yet. Add some to get started!
        </p>
      )}
    </div>
  );
}
