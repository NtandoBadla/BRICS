import Link from 'next/link';
import { Trophy, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white">BIFA</span>
            </div>
            <p className="text-sm">BRICS Football Association - Managing football excellence across nations.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-blue-400">Home</Link></li>
              <li><Link href="/matches" className="hover:text-blue-400">Matches</Link></li>
              <li><Link href="/competitions" className="hover:text-blue-400">Competitions</Link></li>
              <li><Link href="/leagues" className="hover:text-blue-400">Leagues</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-blue-400">Login</Link></li>
              <li><Link href="/signup" className="hover:text-blue-400">Sign Up</Link></li>
              <li><Link href="/admin" className="hover:text-blue-400">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@bifa.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+267 XXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>All associations around the the world</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} BIFA Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
