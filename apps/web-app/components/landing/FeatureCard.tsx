interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-green-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
