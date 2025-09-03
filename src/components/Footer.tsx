import { MessageCircle, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6" />
              <div>
                <h3 className="text-lg font-serif font-semibold">EaseMyTrip</h3>
                <p className="text-sm text-white/80 font-sans">AI Travel Assistant</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed font-sans max-w-sm">
              Transforming travel planning through intelligent AI assistance. Your perfect journey starts with a simple conversation.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-gold transition-colors" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-gold transition-colors" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-gold transition-colors" />
              <Linkedin className="h-5 w-5 cursor-pointer hover:text-gold transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-serif">Services</h4>
            <ul className="space-y-2 text-white/80 font-sans">
              <li><a href="#" className="hover:text-white transition-colors">AI Trip Planning</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flight Booking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hotel Reservations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Activity Planning</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-serif">Support</h4>
            <ul className="space-y-2 text-white/80 font-sans">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Travel Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-serif">Company</h4>
            <ul className="space-y-2 text-white/80 font-sans">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/80 text-sm font-sans">
            © 2024 EaseMyTrip AI Travel Assistant. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors font-sans">
              Privacy Policy
            </a>
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors font-sans">
              Terms of Service
            </a>
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors font-sans">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;