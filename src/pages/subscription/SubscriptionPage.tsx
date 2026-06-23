import { Star, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const freeFeatures = [
  'Send and receive interests',
  'Browse all profiles',
  'View full profile details',
  'Chat with your matches',
  'Shortlist favourite profiles',
  'See who viewed your profile',
  'Upload photos and gallery',
]

export default function SubscriptionPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
        <Star size={14} className="fill-green-600" />
        Free during Beta
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Everything is free right now
      </h1>
      <p className="text-gray-500 mb-8">
        Ahirwal Matrimony is in early access. All features are completely free
        while we build the community. Paid plans will be introduced later —
        you'll be notified in advance.
      </p>

      {/* Free plan card */}
      <div className="card p-6 text-left mb-6 ring-2 ring-primary-400">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">Current plan</p>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">Free Beta</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">₹0</p>
            <p className="text-sm text-gray-500">forever (for now)</p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {freeFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <Check size={16} className="text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Link to="/matches" className="btn-primary inline-block w-full">
        Browse Matches
      </Link>

      <p className="text-xs text-gray-400 mt-4">
        No credit card required. No hidden charges.
      </p>
    </div>
  )
}
