interface DummyCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onClick?: () => void;
}

export default function DummyCard({
  title,
  description,
  buttonLabel,
  onClick,
}: DummyCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-auto w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm py-2 rounded-lg transition"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
