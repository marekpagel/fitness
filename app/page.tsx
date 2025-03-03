import FitnessTracker from "./components/FitnessTracker";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 items-center py-8 px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Bolt Fitness Tracker</h1>
        <p className="text-lg text-gray-600 mb-8">
          Track your group&apos;s fitness progress over time. Add participants,
          record daily scores, and visualize performance. Perfect for trainers,
          fitness classes, and fitness challenges.
        </p>
      </div>
      <FitnessTracker />
    </main>
  );
}
