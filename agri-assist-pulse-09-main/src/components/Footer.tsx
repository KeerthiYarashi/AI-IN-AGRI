import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart, ExternalLink, Sprout } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  
  const footerText = {
    en: 'Built with ❤️ for farmers worldwide',
    hi: 'किसानों के लिए ❤️ से बनाया गया',
    kn: 'ರೈತರಿಗಾಗಿ ❤️ ದಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ',
    te: 'రైతుల కోసం ❤️ తో నిర్మించబడింది',
    ta: 'விவசாயிகளுக்காக ❤️ உடன் கட்டப்பட்டது'
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    features: [
      { name: 'Market Forecaster', href: '/market-forecaster' },
      { name: 'Pest Detection', href: '/pest-detection' },
      { name: 'Irrigation Predictor', href: '/irrigation-predictor' },
      { name: 'Carbon Estimator', href: '/carbon-estimator' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Mission', href: '#mission' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
      { name: 'Community Forum', href: '#community' },
      { name: 'Support Center', href: '#support' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Disclaimer', href: '#disclaimer' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: '#github', label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-gray-100' },
    { icon: Twitter, href: '#twitter', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn', color: 'hover:text-blue-600' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="relative mt-auto border-t border-border/40 bg-gradient-to-br from-card/80 via-background/60 to-card/80 backdrop-blur-md">
      {/* Decorative top border with gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-12 md:py-16"
        >
          {/* Brand Section - Takes 2 columns on large screens */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-primary to-green-600 rounded-2xl shadow-lg group-hover:shadow-primary/50 transition-shadow"
              >
                <Sprout className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                  AI Agri Assistant
                </h3>
                <p className="text-xs text-muted-foreground">Smart Farming Solutions</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Empowering farmers with AI-driven insights for sustainable and profitable agriculture. 
              Making precision farming accessible to everyone.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2.5 bg-muted/50 hover:bg-muted rounded-xl transition-all duration-300 ${social.color} border border-border/50 hover:border-border`}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-primary">10K+</div>
                <div className="text-xs text-muted-foreground">Farmers</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-green-600">95%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-blue-600">24/7</div>
                <div className="text-xs text-muted-foreground">Support</div>
              </div>
            </div>
          </motion.div>

          {/* Features Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-green-600 rounded-full" />
              Features
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.features.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-primary transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-green-600 rounded-full" />
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-primary transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-green-600 rounded-full" />
              Resources
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-primary transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <div className="w-1 h-4 bg-gradient-to-b from-primary to-green-600 rounded-full" />
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <Mail className="h-4 w-4 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                <a href="mailto:support@agriassist.ai" className="hover:text-primary transition-colors">
                  support@agriassist.ai
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <Phone className="h-4 w-4 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <MapPin className="h-4 w-4 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed">
                  Agricultural Tech Hub<br />
                  Innovation District, India
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-border/40" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="py-6 md:py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {currentYear} AI Agri Assistant.</span>
              <span className="hidden sm:inline">All rights reserved.</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Heart className="h-4 w-4 text-red-500 fill-red-500 inline" />
              </motion.span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {footerLinks.legal.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  {link.name}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Made with love badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-green-600/10 border border-primary/20 rounded-full text-xs text-muted-foreground">
              <Leaf className="h-3 w-3 text-primary" />
              <span>Built with passion for sustainable farming</span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🌱
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          🌾 {footerText[language]} • {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};
