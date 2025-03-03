"use client";

import { useEffect, useState } from "react";
import {
  addParticipant,
  deleteParticipant,
  getParticipants,
  addScore,
  getScores,
} from "../actions/fitness";

// Define types for our data
type Participant = {
  id: number;
  name: string;
  createdAt?: Date | null;
};

type Score = {
  id: number;
  participantId: number;
  score: number;
  date: string;
  createdAt?: Date | null;
};

export default function FitnessTracker() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(true);

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

  // Get all unique dates from scores
  const dates = Array.from(new Set(scores.map((s) => s.date))).sort();

  // Get scores for a participant on a specific date
  const getScoreForParticipant = (participantId: number, date: string) => {
    return (
      scores.find((s) => s.participantId === participantId && s.date === date)
        ?.score || 0
    );
  };

  // Calculate total score for a participant
  const getTotalScore = (participantId: number) => {
    return scores
      .filter((s) => s.participantId === participantId)
      .reduce((sum, s) => sum + s.score, 0);
  };

  // Add new participant
  const handleAddParticipant = async () => {
    if (!newName.trim()) return;
    try {
      const [newParticipant] = await addParticipant(newName);
      setParticipants([...participants, newParticipant]);
      setNewName("");
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  // Delete participant
  const handleDeleteParticipant = async (id: number) => {
    try {
      await deleteParticipant(id);
      setParticipants(participants.filter((p) => p.id !== id));
      setScores(scores.filter((s) => s.participantId !== id));
    } catch (error) {
      console.error("Error deleting participant:", error);
    }
  };

  // Update score
  const handleUpdateScore = async (
    participantId: number,
    date: string,
    newScore: number
  ) => {
    try {
      const [updatedScore] = await addScore(participantId, newScore, date);
      setScores((prev) => {
        const filtered = prev.filter(
          (s) => !(s.participantId === participantId && s.date === date)
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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 fitness-tracker">
      <h2 className="text-2xl font-semibold mb-6">Group Fitness Tracker</h2>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        {/* Add new participant */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Participant name"
            className="p-2 border rounded"
          />
          <button
            onClick={handleAddParticipant}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Participant
          </button>
        </div>

        {/* Add new date */}
        <div className="flex gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={() => setNewDate("")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Date
          </button>
        </div>
      </div>

      {/* Participants table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border-b text-left">Name</th>
              {dates.map((date) => (
                <th key={date} className="py-3 px-4 border-b text-center">
                  {new Date(date).toLocaleDateString()}
                </th>
              ))}
              <th className="py-3 px-4 border-b text-center">Total</th>
              <th className="py-3 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id}>
                <td className="py-3 px-4 border-b">{participant.name}</td>
                {dates.map((date) => (
                  <td
                    key={`${participant.id}-${date}`}
                    className="py-3 px-4 border-b text-center"
                  >
                    <input
                      type="number"
                      value={getScoreForParticipant(participant.id, date)}
                      onChange={(e) =>
                        handleUpdateScore(
                          participant.id,
                          date,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 p-1 text-center border rounded"
                    />
                  </td>
                ))}
                <td className="py-3 px-4 border-b text-center font-semibold">
                  {getTotalScore(participant.id)}
                </td>
                <td className="py-3 px-4 border-b text-center">
                  <button
                    onClick={() => handleDeleteParticipant(participant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
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
