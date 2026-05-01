import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Search, Filter, Star, MapPin, DollarSign, Calendar, Clock, Video, Phone, Mail, CheckCircle, Heart, Brain, Users, MessageCircle } from 'lucide-react';
import WellnessScene3D from '../components/WellnessScene3D';

const TherapistMatching = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'video',
    notes: ''
  });

  const specialties = [
    { id: 'all', label: 'All Specialties' },
    { id: 'anxiety', label: 'Anxiety Disorders' },
    { id: 'depression', label: 'Depression' },
    { id: 'trauma', label: 'Trauma & PTSD' },
    { id: 'relationships', label: 'Relationship Issues' },
    { id: 'addiction', label: 'Addiction Recovery' },
    { id: 'eating', label: 'Eating Disorders' },
    { id: 'bipolar', label: 'Bipolar Disorder' },
    { id: 'ocd', label: 'OCD' },
    { id: 'adhd', label: 'ADHD' },
    { id: 'lgbtq', label: 'LGBTQ+ Therapy' },
    { id: 'grief', label: 'Grief & Loss' }
  ];

  // Generate mock therapist data
  useEffect(() => {
    generateMockTherapists();
  }, []);

  const generateMockTherapists = () => {
    const mockTherapists = [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        credentials: 'PhD, LPC',
        specialties: ['anxiety', 'depression', 'relationships'],
        experience: 12,
        rating: 4.9,
        reviews: 127,
        price: 120,
        initials: 'SJ',
        location: 'New York, NY',
        languages: ['English', 'Spanish'],
        availability: ['Mon', 'Tue', 'Wed', 'Thu'],
        nextAvailable: 'Today, 2:00 PM',
        about: 'Dr. Johnson specializes in cognitive-behavioral therapy for anxiety and depression. She creates a warm, supportive environment for healing.',
        approaches: ['CBT', 'Mindfulness', 'EMDR'],
        accepts: ['insurance', 'self-pay'],
        responseTime: 'Within 24 hours'
      },
      {
        id: 2,
        name: 'Dr. Michael Chen',
        credentials: 'PsyD, LMFT',
        specialties: ['trauma', 'grief', 'relationships'],
        experience: 8,
        rating: 4.8,
        reviews: 94,
        price: 150,
        initials: 'MC',
        location: 'Los Angeles, CA',
        languages: ['English', 'Mandarin'],
        availability: ['Tue', 'Wed', 'Fri', 'Sat'],
        nextAvailable: 'Tomorrow, 10:00 AM',
        about: 'Dr. Chen helps individuals heal from trauma and navigate life transitions using evidence-based approaches.',
        approaches: ['EMDR', 'Somatic Therapy', 'Attachment Theory'],
        accepts: ['insurance', 'self-pay'],
        responseTime: 'Within 12 hours'
      },
      {
        id: 3,
        name: 'Dr. Emily Rodriguez',
        credentials: 'LCSW, CADC',
        specialties: ['addiction', 'depression', 'lgbtq'],
        experience: 15,
        rating: 4.9,
        reviews: 203,
        price: 100,
        initials: 'ER',
        location: 'Chicago, IL',
        languages: ['English', 'Spanish'],
        availability: ['Mon', 'Wed', 'Thu', 'Fri'],
        nextAvailable: 'Today, 4:00 PM',
        about: 'Dr. Rodriguez provides affirming therapy for LGBTQ+ individuals and specializes in addiction recovery.',
        approaches: ['Motivational Interviewing', 'DBT', 'Trauma-Informed Care'],
        accepts: ['insurance', 'sliding-scale'],
        responseTime: 'Within 6 hours'
      },
      {
        id: 4,
        name: 'Dr. James Wilson',
        credentials: 'PhD, Clinical Psychologist',
        specialties: ['ocd', 'adhd', 'anxiety'],
        experience: 10,
        rating: 4.7,
        reviews: 156,
        price: 140,
        initials: 'JW',
        location: 'Boston, MA',
        languages: ['English'],
        availability: ['Mon', 'Tue', 'Thu', 'Fri'],
        nextAvailable: 'Friday, 11:00 AM',
        about: 'Dr. Wilson specializes in evidence-based treatments for OCD and ADHD in adults and adolescents.',
        approaches: ['ERP', 'CBT', 'ACT'],
        accepts: ['insurance', 'self-pay'],
        responseTime: 'Within 24 hours'
      },
      {
        id: 5,
        name: 'Dr. Maria Garcia',
        credentials: 'LMFT, CCTP',
        specialties: ['eating', 'trauma', 'relationships'],
        experience: 7,
        rating: 4.8,
        reviews: 78,
        price: 110,
        initials: 'MG',
        location: 'Miami, FL',
        languages: ['English', 'Spanish', 'Portuguese'],
        availability: ['Wed', 'Thu', 'Sat', 'Sun'],
        nextAvailable: 'Saturday, 9:00 AM',
        about: 'Dr. Garcia provides compassionate care for eating disorders and trauma survivors.',
        approaches: ['Family-Based Therapy', 'CBT-E', 'Somatic Experiencing'],
        accepts: ['insurance', 'self-pay'],
        responseTime: 'Within 12 hours'
      },
      {
        id: 6,
        name: 'Dr. Robert Taylor',
        credentials: 'MD, Psychiatrist',
        specialties: ['bipolar', 'depression', 'adhd'],
        experience: 20,
        rating: 4.9,
        reviews: 189,
        price: 200,
        initials: 'RT',
        location: 'Seattle, WA',
        languages: ['English'],
        availability: ['Mon', 'Tue', 'Wed', 'Thu'],
        nextAvailable: 'Tomorrow, 2:30 PM',
        about: 'Dr. Taylor is a board-certified psychiatrist specializing in mood disorders and medication management.',
        approaches: ['Medication Management', 'Psychotherapy', 'Integrative Psychiatry'],
        accepts: ['insurance', 'self-pay'],
        responseTime: 'Within 48 hours'
      }
    ];
    setTherapists(mockTherapists);
    setLoading(false);
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.about.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            therapist.specialties.includes(selectedSpecialty);
    const matchesPrice = therapist.price >= priceRange[0] && therapist.price <= priceRange[1];
    
    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  const handleBooking = () => {
    // In a real app, this would send booking request to backend
    alert(`Booking request sent to ${selectedTherapist.name} for ${bookingData.date} at ${bookingData.time}`);
    setShowBookingModal(false);
    setBookingData({ date: '', time: '', type: 'video', notes: '' });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="wellness-hero-panel p-5 md:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr,360px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                <Users className="h-4 w-4" />
                Guided provider matching
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                Find Your Perfect Therapist
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg">
                Compare licensed professionals by specialty, availability, response speed, and cost in a warmer booking experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {['Verified profiles', 'Fast availability', 'Insurance aware'].map((item) => (
                  <span key={item} className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm dark:bg-white/5 dark:text-gray-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <WellnessScene3D variant="therapist" compact />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{therapists.length}</div>
            <div className="text-sm text-gray-600">Verified Therapists</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">$100</div>
            <div className="text-sm text-gray-600">Average Session</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="input-field"
            >
              {specialties.map(specialty => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.label}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Price:</span>
              <input
                type="range"
                min="0"
                max="300"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
              <span className="text-sm font-medium">${priceRange[1]}</span>
            </div>
            
            <button className="btn-primary flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Therapist Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              className="glass-card p-6 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Therapist Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-base font-bold text-white shadow-lg shadow-purple-500/20">
                    {therapist.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{therapist.name}</h3>
                    <p className="text-sm text-gray-600">{therapist.credentials}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(therapist.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        ({therapist.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">${therapist.price}</div>
                  <div className="text-xs text-gray-600">per session</div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {therapist.specialties.map(specialty => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                    >
                      {specialties.find(s => s.id === specialty)?.label || specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* About */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {therapist.about}
              </p>

              {/* Quick Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{therapist.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{therapist.nextAvailable}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{therapist.responseTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => {
                    setSelectedTherapist(therapist);
                    setShowBookingModal(true);
                  }}
                  className="flex-1 btn-primary text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Session
                </motion.button>
                <motion.button
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && selectedTherapist && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold mb-4">Book Session with {selectedTherapist.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Type</label>
                    <select
                      value={bookingData.type}
                      onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                      className="input-field"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Select a time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      placeholder="Any specific concerns or topics you'd like to discuss..."
                      className="input-field resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <motion.button
                    onClick={handleBooking}
                    disabled={!bookingData.date || !bookingData.time}
                    className="flex-1 btn-primary disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Confirm Booking
                  </motion.button>
                  <motion.button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No therapists found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search terms to find more options.
            </p>
          </div>
        )}

        {/* Insurance and Payment Info */}
        <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h3 className="text-lg font-semibold mb-4">Insurance & Payment Options</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Most Insurance Accepted</p>
                <p className="text-sm text-gray-600">Blue Cross, Aetna, Cigna, and more</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Sliding Scale Available</p>
                <p className="text-sm text-gray-600">Based on income and circumstances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium">Free Initial Consultation</p>
                <p className="text-sm text-gray-600">15-minute meet and greet session</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TherapistMatching;
