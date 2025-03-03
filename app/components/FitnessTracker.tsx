'use client';

import { useState } from 'react';

// Define types for our data
type Participant = {
  id: number;
  name: string;
  scores: { [date: string]: number };
};

// Sample data - in a real app, this would come from a database
const initialParticipants: Participant[] = [
  {
    id: 1,
    name: 'John Doe',
    scores: {
      '2023-11-01': 75,
      '2023-11-02': 82,
      '2023-11-03': 90,
    },
  },
  {
    id: 2,
    name: 'Jane Smith',
    scores: {
      '2023-11-01': 85,
      '2023-11-02': 88,
      '2023-11-03': 92,
    },
  },
  {
    id: 3,
    name: 'Bob Johnson',
    scores: {
      '2023-11-01': 65,
      '2023-11-02': 70,
      '2023-11-03': 78,
    },
  },
];

// Get all unique dates from our data
const getUniqueDates = (participants: Participant[]): string[] => {
  const dates = new Set<string>();
  
  participants.forEach((participant) => {
    Object.keys(participant.scores).forEach((date) => {
      dates.add(date);
    });
  });
  
  return Array.from(dates).sort();
};

export default function FitnessTracker() {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [highlightTopScores, setHighlightTopScores] = useState(true);
  const dates = getUniqueDates(participants);
  
  // Function to add a new participant
  const addParticipant = () => {
    if (!newName.trim()) return;
    
    const newParticipant: Participant = {
      id: participants.length + 1,
      name: newName,
      scores: {},
    };
    
    // Initialize with empty scores for all existing dates
    dates.forEach((date) => {
      newParticipant.scores[date] = 0;
    });
    
    setParticipants([...participants, newParticipant]);
    setNewName('');
  };
  
  // Function to add a new date column
  const addDate = () => {
    if (!newDate.trim()) return;
    
    setParticipants(
      participants.map((p) => ({
        ...p,
        scores: {
          ...p.scores,
          [newDate]: 0,
        },
      }))
    );
    
    setNewDate('');
  };
  
  // Function to update a score
  const updateScore = (participantId: number, date: string, value: string) => {
    const score = parseInt(value) || 0;
    
    setParticipants(
      participants.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            scores: {
              ...p.scores,
              [date]: score,
            },
          };
        }
        return p;
      })
    );
  };
  
  // Function to delete a participant
  const deleteParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
  };
  
  // Get top score for a specific date
  const getTopScore = (date: string): number => {
    let topScore = 0;
    participants.forEach(p => {
      if (p.scores[date] > topScore) {
        topScore = p.scores[date];
      }
    });
    return topScore;
  };
  
  // Check if a score is the top score for that date
  const isTopScore = (participantId: number, date: string): boolean => {
    if (!highlightTopScores) return false;
    const score = participants.find(p => p.id === participantId)?.scores[date] || 0;
    return score > 0 && score === getTopScore(date);
  };
  
  // Calculate total score for a participant
  const getTotalScore = (participant: Participant): number => {
    return Object.values(participant.scores).reduce((sum, score) => sum + score, 0);
  };
  
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
            onClick={addParticipant}
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
            onClick={addDate}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Date
          </button>
        </div>
      </div>
      
      {/* Highlight toggle */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="highlight-toggle"
          checked={highlightTopScores}
          onChange={() => setHighlightTopScores(!highlightTopScores)}
          className="mr-2"
        />
        <label htmlFor="highlight-toggle">Highlight top scores</label>
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
                  <td key={`${participant.id}-${date}`} className="py-3 px-4 border-b text-center">
                    <input
                      type="number"
                      value={participant.scores[date] || 0}
                      onChange={(e) => updateScore(participant.id, date, e.target.value)}
                      className={`w-16 p-1 text-center border rounded ${
                        isTopScore(participant.id, date) ? 'bg-yellow-100 highlight' : ''
                      }`}
                    />
                  </td>
                ))}
                <td className="py-3 px-4 border-b text-center font-semibold">
                  {getTotalScore(participant)}
                </td>
                <td className="py-3 px-4 border-b text-center">
                  <button
                    onClick={() => deleteParticipant(participant.id)}
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
        <p className="text-center py-4">No participants yet. Add some to get started!</p>
      )}
    </div>
  );
} 