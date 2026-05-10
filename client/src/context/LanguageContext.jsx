import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'mindcare_language';

const translations = {
  en: {
    common: {
      appName: 'MindCare AI',
      loadingMindCare: 'Loading MindCare AI...',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      startFree: 'Start Free',
      getStarted: 'Get Started',
      joinMindCare: 'Join MindCare AI',
      returnToSignIn: 'Return to Sign In',
      features: 'Features',
      experience: 'Experience',
      stories: 'Stories',
      language: 'Language',
      notMedicalCare: 'Not a substitute for professional medical care.'
    },
    navbar: {
      tagline: 'Mental wellness, redesigned',
      toggleTheme: 'Toggle theme',
      logout: 'Logout'
    },
    sidebar: {
      dashboard: 'Dashboard',
      mood: 'Mood',
      journal: 'Journal',
      aiInsights: 'AI Insights',
      careIntelligence: 'Care Intelligence',
      smartTimetable: 'Smart Timetable',
      programs: 'Programs',
      community: 'Community',
      findTherapist: 'Find Therapist',
      habits: 'Habits',
      weatherMood: 'Weather Mood',
      periodTracker: 'Period Tracker',
      nutrition: 'Nutrition',
      workouts: 'Workouts',
      mindfulness: 'Mindfulness',
      exportData: 'Export Data',
      analytics: 'Analytics',
      aiSuggestions: 'AI Suggestions',
      genAIStudio: 'GenAI Studio',
      sleepAnalysis: 'Sleep Analysis',
      medications: 'Medications',
      breathing: 'Breathing',
      emergency: 'Emergency',
      weeklyReview: 'Weekly Review',
      affirmations: 'Affirmations',
      dreamJournal: 'Dream Journal',
      familySharing: 'Family Sharing',
      recoveryPlanner: 'Recovery Planner',
      triggerInsights: 'Trigger Insights',
      smartWatch: 'Smart Watch',
      offlineMode: 'Offline Mode',
      biometric: 'Biometric',
      darkMode: 'Dark Mode',
      profile: 'Profile',
      needHelp: 'Need immediate help?',
      emergencySupport: 'Emergency Support'
    },
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to continue your wellness journey',
      email: 'Email Address',
      password: 'Password',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      button: 'Sign In',
      signingIn: 'Signing in...',
      noAccount: "Don't have an account?",
      signUp: 'Sign up'
    },
    register: {
      title: 'Create Account',
      subtitle: 'Start your mental wellness journey today',
      fullName: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullNamePlaceholder: 'Enter your name',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Create a password',
      confirmPasswordPlaceholder: 'Confirm your password',
      button: 'Create Account',
      creating: 'Creating account...',
      hasAccount: 'Already have an account?',
      terms: 'By signing up, you agree to our Terms of Service and Privacy Policy.',
      disclaimer: 'This app is for self-tracking only and not a substitute for professional care.',
      passwordMismatch: 'Passwords do not match',
      passwordLength: 'Password must be at least 6 characters'
    },
    offlineMode: {
      title: 'Offline Mode',
      subtitle: 'Access your data even without internet',
      online: 'Online',
      offline: 'Offline',
      youAreOnline: "You're Online",
      youAreOffline: "You're Offline",
      allFeatures: 'All features are available',
      limitedFeatures: 'Limited features available. Data will sync when connected.',
      syncing: 'Syncing...',
      syncNow: 'Sync Now',
      pendingSync: 'items pending sync',
      needsSync: 'Your offline data needs to be synced',
      availableData: 'Available Offline Data',
      moodEntries: 'Mood Entries',
      journalEntries: 'Journal Entries',
      habits: 'Habits',
      medications: 'Medications',
      storageUsed: 'Storage Used',
      ofStorage: 'of 50 MB',
      clearCache: 'Clear Cache',
      lastSynced: 'Last Synced',
      itemsPending: 'items pending',
      downloadTitle: 'Download for Offline Use',
      autoDownload: 'Auto-download',
      downloadDescription: 'Download your data to access it without internet connection',
      downloadData: 'Download Data',
      featuresTitle: 'Available Offline Features',
      downloading: 'Downloading...',
      downloadComplete: 'Download Complete!',
      dataAvailableOffline: 'Your data is now available offline',
      moodHistory: 'Mood History (Last 30 days)',
      journalEntriesData: 'Journal Entries',
      habitTrackerData: 'Habit Tracker Data',
      medicationSchedule: 'Medication Schedule',
      logMoods: 'Log moods and emotions',
      writeJournal: 'Write journal entries',
      trackHabits: 'Track habits',
      viewMedication: 'View medication reminders',
      accessCoping: 'Access coping tools',
      genAILimited: 'GenAI Studio (limited)',
      communityReadOnly: 'Community posts (read-only)'
    },
    landing: {
      nav: {
        features: 'Features',
        experience: 'Experience',
        stories: 'Stories'
      },
      badge: 'New landing experience with calmer motion and stronger UX',
      heroTitleStart: 'Mental wellness support that feels',
      heroTitleAccent: 'calm, clear, and intelligent.',
      heroDescription:
        'MindCare AI brings mood tracking, guided programs, GenAI coaching, analytics, and crisis support into one focused space. The homepage now leads people through the product instead of making them guess where to start.',
      heroChips: {
        aiTitle: 'GenAI + RAG',
        aiDetail: 'support grounded in your data',
        programsTitle: 'Programs',
        programsDetail: 'multi-day wellness plans',
        safetyTitle: 'Safety paths',
        safetyDetail: 'emergency support stays close'
      },
      board: {
        label: 'Daily Calm Board',
        title: 'A softer, smarter first screen',
        live: 'Live concept',
        recovery: 'Recovery readiness',
        sleepRhythm: 'steady sleep rhythm',
        stressEasing: 'stress easing',
        sleepSprint: 'Sleep sprint',
        sleepSprintStatus: 'Night 3 of 5 active',
        journalThemes: 'Journal themes',
        journalThemesValue: 'overwork, self-talk, recovery',
        flowTitle: "Today's guided flow",
        flowBadge: 'friction reduced',
        flowSteps: [
          'Log one mood check-in',
          'Read the top AI insight',
          'Continue your active program',
          'Save one calming action'
        ],
        ragLabel: 'RAG Coach',
        ragTitle: '3 matching wellness sources found',
        ragDescription: 'Sleep rhythm, burnout pacing, and grounding exercises were pulled in based on recent mood and journal history.',
        genAIBubbleTitle: 'GenAI Studio',
        genAIBubbleDetail: 'care plans + visuals + support',
        programsBubbleTitle: 'Programs Hub',
        programsBubbleDetail: 'calm, sleep, gratitude, confidence'
      },
      marquee: [
        'RAG-backed guidance',
        'Mood and journal intelligence',
        'Burnout and recovery tracking',
        'Programs for calm and sleep',
        'Secure mental wellness journaling',
        'Emergency support built in',
        'GenAI care plans',
        'GAN-ready wellness visuals'
      ],
      whyLabel: 'Why this feels better',
      whyTitle: 'The homepage now explains the product before asking people to commit.',
      whyDescription:
        'The updated UX leads with clarity: what MindCare AI does, how the tools connect, and what someone can accomplish in the first few minutes. The motion system reinforces that flow with softer reveals, drifting depth, and purposeful emphasis.',
      capabilities: [
        {
          title: 'GenAI Studio',
          description: 'Support chat, RAG coaching, care-plan generation, and visual concept tools in one workspace.'
        },
        {
          title: 'Structured Programs',
          description: 'Guided plans for calm, sleep repair, confidence, burnout recovery, and gratitude.'
        },
        {
          title: 'Private by Design',
          description: 'Track moods and journal reflections inside a protected account-based flow.'
        },
        {
          title: 'AI and ML Signals',
          description: 'Surface risk, recovery readiness, and trend shifts from everyday wellness tracking.'
        },
        {
          title: 'Support When It Matters',
          description: 'Emergency pathways, calming tools, and practical next steps are always close by.'
        }
      ],
      exploreFlow: 'Explore this flow',
      journey: {
        label: 'Product journey',
        title: 'A clearer path from check-in to support',
        description:
          'The redesigned flow gives the home page a job: orient people quickly, explain the value, and direct them toward the next action that helps.',
        bullets: [
          'Start with fast trust and product clarity',
          'Surface the strongest tools above the fold',
          'Use motion to guide attention instead of distracting from content'
        ],
        stepLabel: 'Step'
      },
      journeySteps: [
        {
          title: 'Capture the real day',
          description: 'Log mood, sleep, stress, notes, and context in a few taps without losing momentum.'
        },
        {
          title: 'Turn patterns into clarity',
          description: 'The dashboard translates raw entries into trends, risk signals, and weekly movement.'
        },
        {
          title: 'Respond with support',
          description: 'Use GenAI coaching, guided programs, and calming actions that fit the moment you are in.'
        }
      ],
      storiesLabel: 'What changed in the feel',
      storiesTitle: 'Higher trust, smoother pacing, better storytelling',
      stories: [
        {
          name: 'Aarav',
          role: 'University student',
          quote: 'The new layout makes it obvious what to do first. I can check in, see my trend, and start a calm program without hunting through menus.',
          focus: 'Less friction, faster grounding'
        },
        {
          name: 'Nina',
          role: 'Working professional',
          quote: 'The product feels more like a supportive wellness studio now. The landing page finally shows how all the tools connect together.',
          focus: 'Clearer product story'
        },
        {
          name: 'David',
          role: 'Remote team lead',
          quote: 'The motion feels calming instead of noisy. It gives the app a premium feel while still keeping the message very practical.',
          focus: 'Calm, confident motion'
        }
      ],
      cta: {
        label: 'Ready to launch the new experience',
        title: 'A homepage that feels like part of the product, not a placeholder before it.',
        description:
          'The new UI sets expectations clearly, introduces the strongest features sooner, and uses motion to make the experience feel modern and calm.'
      }
    }
  },
  hi: {
    common: {
      appName: 'MindCare AI',
      loadingMindCare: 'MindCare AI लोड हो रहा है...',
      signIn: 'साइन इन',
      createAccount: 'खाता बनाएं',
      startFree: 'मुफ्त शुरू करें',
      getStarted: 'शुरू करें',
      joinMindCare: 'MindCare AI से जुड़ें',
      returnToSignIn: 'साइन इन पर वापस जाएं',
      features: 'फीचर्स',
      experience: 'अनुभव',
      stories: 'कहानियां',
      language: 'भाषा',
      notMedicalCare: 'यह पेशेवर चिकित्सा देखभाल का विकल्प नहीं है।'
    },
    navbar: {
      tagline: 'मानसिक वेलनेस, नए रूप में',
      toggleTheme: 'थीम बदलें',
      logout: 'लॉगआउट'
    },
    sidebar: {
      dashboard: 'डैशबोर्ड',
      mood: 'मूड',
      journal: 'जर्नल',
      aiInsights: 'AI इनसाइट्स',
      careIntelligence: 'केयर इंटेलिजेंस',
      programs: 'प्रोग्राम्स',
      community: 'कम्युनिटी',
      findTherapist: 'थेरेपिस्ट खोजें',
      habits: 'आदतें',
      weatherMood: 'मौसम और मूड',
      periodTracker: 'पीरियड ट्रैकर',
      nutrition: 'पोषण',
      workouts: 'वर्कआउट्स',
      mindfulness: 'माइंडफुलनेस',
      exportData: 'डेटा एक्सपोर्ट',
      analytics: 'एनालिटिक्स',
      aiSuggestions: 'AI सुझाव',
      genAIStudio: 'GenAI स्टूडियो',
      sleepAnalysis: 'नींद विश्लेषण',
      medications: 'दवाइयां',
      breathing: 'श्वास',
      emergency: 'आपातकाल',
      weeklyReview: 'साप्ताहिक समीक्षा',
      progressPhotos: 'प्रोग्रेस फोटो',
      affirmations: 'अफर्मेशन्स',
      dreamJournal: 'ड्रीम जर्नल',
      familySharing: 'फैमिली शेयरिंग',
      recoveryPlanner: 'रिकवरी प्लानर',
      triggerInsights: 'ट्रिगर इनसाइट्स',
      smartWatch: 'स्मार्ट वॉच',
      offlineMode: 'ऑफलाइन मोड',
      biometric: 'बायोमेट्रिक',
      darkMode: 'डार्क मोड',
      profile: 'प्रोफाइल',
      needHelp: 'तुरंत मदद चाहिए?',
      emergencySupport: 'आपातकालीन सहायता'
    },
    login: {
      title: 'वापसी पर स्वागत है',
      subtitle: 'अपनी वेलनेस यात्रा जारी रखने के लिए साइन इन करें',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      button: 'साइन इन',
      signingIn: 'साइन इन हो रहा है...',
      noAccount: 'क्या आपका खाता नहीं है?',
      signUp: 'साइन अप करें'
    },
    register: {
      title: 'खाता बनाएं',
      subtitle: 'आज ही अपनी मानसिक वेलनेस यात्रा शुरू करें',
      fullName: 'पूरा नाम',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      fullNamePlaceholder: 'अपना नाम दर्ज करें',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      passwordPlaceholder: 'एक पासवर्ड बनाएं',
      confirmPasswordPlaceholder: 'अपने पासवर्ड की पुष्टि करें',
      button: 'खाता बनाएं',
      creating: 'खाता बनाया जा रहा है...',
      hasAccount: 'क्या आपके पास पहले से खाता है?',
      terms: 'साइन अप करके आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं।',
      disclaimer: 'यह ऐप केवल स्वयं ट्रैकिंग के लिए है और पेशेवर देखभाल का विकल्प नहीं है।',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते',
      passwordLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'
    },
    landing: {
      nav: {
        features: 'फीचर्स',
        experience: 'अनुभव',
        stories: 'कहानियां'
      },
      badge: 'शांत एनिमेशन और बेहतर UX के साथ नया लैंडिंग अनुभव',
      heroTitleStart: 'मानसिक वेलनेस सहायता जो महसूस होती है',
      heroTitleAccent: 'शांत, स्पष्ट और बुद्धिमान।',
      heroDescription:
        'MindCare AI मूड ट्रैकिंग, गाइडेड प्रोग्राम्स, GenAI कोचिंग, एनालिटिक्स और क्राइसिस सपोर्ट को एक केंद्रित स्थान में लाता है। अब होमपेज उपयोगकर्ता को सीधे सही शुरुआत तक ले जाता है।',
      heroChips: {
        aiTitle: 'GenAI + RAG',
        aiDetail: 'आपके डेटा पर आधारित सहायता',
        programsTitle: 'प्रोग्राम्स',
        programsDetail: 'मल्टी-डे वेलनेस प्लान्स',
        safetyTitle: 'सेफ्टी पाथ्स',
        safetyDetail: 'आपातकालीन सहायता हमेशा पास'
      },
      board: {
        label: 'डेली कैल्म बोर्ड',
        title: 'एक और भी शांत और स्मार्ट पहली स्क्रीन',
        live: 'लाइव कॉन्सेप्ट',
        recovery: 'रिकवरी रेडीनेस',
        sleepRhythm: 'स्थिर नींद लय',
        stressEasing: 'तनाव कम हो रहा है',
        sleepSprint: 'स्लीप स्प्रिंट',
        sleepSprintStatus: '5 में से रात 3 सक्रिय',
        journalThemes: 'जर्नल थीम्स',
        journalThemesValue: 'ओवरवर्क, सेल्फ-टॉक, रिकवरी',
        flowTitle: 'आज की गाइडेड फ्लो',
        flowBadge: 'कम घर्षण',
        flowSteps: [
          'एक मूड चेक-इन लॉग करें',
          'सबसे ऊपर की AI इनसाइट पढ़ें',
          'अपना सक्रिय प्रोग्राम जारी रखें',
          'एक शांत करने वाला एक्शन सेव करें'
        ],
        ragLabel: 'RAG कोच',
        ragTitle: '3 संबंधित वेलनेस स्रोत मिले',
        ragDescription: 'हाल के मूड और जर्नल इतिहास के आधार पर स्लीप रिदम, बर्नआउट पेसिंग और ग्राउंडिंग एक्सरसाइज चुनी गईं।',
        genAIBubbleTitle: 'GenAI स्टूडियो',
        genAIBubbleDetail: 'केयर प्लान्स + विजुअल्स + सपोर्ट',
        programsBubbleTitle: 'प्रोग्राम्स हब',
        programsBubbleDetail: 'कैल्म, स्लीप, ग्रैटिट्यूड, कॉन्फिडेंस'
      },
      marquee: [
        'RAG-आधारित मार्गदर्शन',
        'मूड और जर्नल इंटेलिजेंस',
        'बर्नआउट और रिकवरी ट्रैकिंग',
        'कैल्म और स्लीप प्रोग्राम्स',
        'सुरक्षित मानसिक वेलनेस जर्नलिंग',
        'इनबिल्ट आपातकालीन सहायता',
        'GenAI केयर प्लान्स',
        'GAN-रेडी वेलनेस विजुअल्स'
      ],
      whyLabel: 'यह अब बेहतर क्यों लगता है',
      whyTitle: 'होमपेज अब पहले उत्पाद समझाता है, फिर प्रतिबद्धता मांगता है।',
      whyDescription:
        'अपडेटेड UX स्पष्टता के साथ शुरू होता है: MindCare AI क्या करता है, सभी टूल कैसे जुड़ते हैं, और पहले कुछ मिनटों में उपयोगकर्ता क्या कर सकता है।',
      capabilities: [
        {
          title: 'GenAI स्टूडियो',
          description: 'सपोर्ट चैट, RAG कोचिंग, केयर-प्लान जनरेशन और विजुअल कॉन्सेप्ट टूल्स एक ही वर्कस्पेस में।'
        },
        {
          title: 'स्ट्रक्चर्ड प्रोग्राम्स',
          description: 'कैल्म, स्लीप रिपेयर, कॉन्फिडेंस, बर्नआउट रिकवरी और ग्रैटिट्यूड के लिए गाइडेड प्लान्स।'
        },
        {
          title: 'प्राइवेट बाय डिजाइन',
          description: 'सुरक्षित अकाउंट-आधारित फ्लो में मूड्स और जर्नल रिफ्लेक्शन्स ट्रैक करें।'
        },
        {
          title: 'AI और ML सिग्नल्स',
          description: 'दैनिक वेलनेस ट्रैकिंग से रिस्क, रिकवरी रेडीनेस और ट्रेंड शिफ्ट्स देखें।'
        },
        {
          title: 'ज़रूरत पर सहायता',
          description: 'आपातकालीन रास्ते, शांत करने वाले टूल्स और व्यावहारिक अगले कदम हमेशा पास हैं।'
        }
      ],
      exploreFlow: 'इस फ्लो को देखें',
      journey: {
        label: 'प्रोडक्ट यात्रा',
        title: 'चेक-इन से सपोर्ट तक एक स्पष्ट रास्ता',
        description: 'रीडिज़ाइन किया गया फ्लो होमपेज को एक काम देता है: जल्दी मार्गदर्शन देना, मूल्य समझाना और अगले उपयोगी कदम तक पहुंचाना।',
        bullets: [
          'तेज़ भरोसे और स्पष्टता से शुरुआत',
          'सबसे मजबूत टूल्स को ऊपर दिखाना',
          'ऐसी मोशन जो ध्यान भटकाए नहीं बल्कि दिशा दे'
        ],
        stepLabel: 'स्टेप'
      },
      journeySteps: [
        {
          title: 'दिन को वास्तविक रूप में कैप्चर करें',
          description: 'कुछ टैप में मूड, नींद, तनाव, नोट्स और संदर्भ लॉग करें।'
        },
        {
          title: 'पैटर्न्स को स्पष्टता में बदलें',
          description: 'डैशबोर्ड कच्ची एंट्रीज़ को ट्रेंड, रिस्क सिग्नल्स और साप्ताहिक बदलाव में बदलता है।'
        },
        {
          title: 'सपोर्ट के साथ प्रतिक्रिया दें',
          description: 'GenAI कोचिंग, गाइडेड प्रोग्राम्स और शांत करने वाले एक्शन्स का उपयोग करें।'
        }
      ],
      storiesLabel: 'अनुभव में क्या बदला',
      storiesTitle: 'अधिक भरोसा, बेहतर गति, मजबूत कहानी',
      stories: [
        {
          name: 'आरव',
          role: 'विश्वविद्यालय छात्र',
          quote: 'नया लेआउट तुरंत बताता है कि पहले क्या करना है। मैं जल्दी चेक-इन कर सकता हूं, ट्रेंड देख सकता हूं और बिना खोजे कैल्म प्रोग्राम शुरू कर सकता हूं।',
          focus: 'कम घर्षण, तेज़ ग्राउंडिंग'
        },
        {
          name: 'नीना',
          role: 'वर्किंग प्रोफेशनल',
          quote: 'अब यह उत्पाद एक सपोर्टिव वेलनेस स्टूडियो जैसा लगता है। लैंडिंग पेज अब सच में दिखाता है कि सारे टूल्स कैसे साथ काम करते हैं।',
          focus: 'अधिक स्पष्ट उत्पाद कहानी'
        },
        {
          name: 'डेविड',
          role: 'रिमोट टीम लीड',
          quote: 'मोशन शांत महसूस होती है, शोरगुल वाली नहीं। यह ऐप को प्रीमियम महसूस कराती है और संदेश को व्यावहारिक बनाए रखती है।',
          focus: 'शांत और आत्मविश्वासी मोशन'
        }
      ],
      cta: {
        label: 'नए अनुभव को शुरू करने के लिए तैयार',
        title: 'ऐसा होमपेज जो उत्पाद का ही हिस्सा लगता है, सिर्फ शुरुआत का पेज नहीं।',
        description: 'नई UI उम्मीदों को स्पष्ट करती है, मजबूत फीचर्स को जल्दी सामने लाती है और मोशन के साथ अनुभव को आधुनिक और शांत बनाती है।'
      }
    }
  },
  te: {
    common: {
      appName: 'MindCare AI',
      loadingMindCare: 'MindCare AI లోడ్ అవుతోంది...',
      signIn: 'సైన్ ఇన్',
      createAccount: 'ఖాతా సృష్టించండి',
      startFree: 'ఉచితంగా ప్రారంభించండి',
      getStarted: 'ప్రారంభించండి',
      joinMindCare: 'MindCare AI లో చేరండి',
      returnToSignIn: 'సైన్ ఇన్‌కి తిరిగి వెళ్లండి',
      features: 'ఫీచర్లు',
      experience: 'అనుభవం',
      stories: 'కథలు',
      language: 'భాష',
      notMedicalCare: 'ఇది ప్రొఫెషనల్ మెడికల్ కేర్‌కు ప్రత్యామ్నాయం కాదు.'
    },
    navbar: {
      tagline: 'మానసిక వెల్‌నెస్, కొత్త రూపంలో',
      toggleTheme: 'థీమ్ మార్చండి',
      logout: 'లాగ్ అవుట్'
    },
    sidebar: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      mood: 'మూడ్',
      journal: 'జర్నల్',
      aiInsights: 'AI ఇన్‌సైట్స్',
      careIntelligence: 'కేర్ ఇంటెలిజెన్స్',
      programs: 'ప్రోగ్రామ్స్',
      community: 'కమ్యూనిటీ',
      findTherapist: 'థెరపిస్ట్ కనుగొనండి',
      habits: 'హాబిట్స్',
      weatherMood: 'వాతావరణం & మూడ్',
      periodTracker: 'పీరియడ్ ట్రాకర్',
      nutrition: 'పోషణ',
      workouts: 'వర్కౌట్స్',
      mindfulness: 'మైండ్‌ఫుల్‌నెస్',
      exportData: 'డేటా ఎక్స్‌పోర్ట్',
      analytics: 'అనలిటిక్స్',
      aiSuggestions: 'AI సూచనలు',
      genAIStudio: 'GenAI స్టూడియో',
      sleepAnalysis: 'నిద్ర విశ్లేషణ',
      medications: 'ఔషధాలు',
      breathing: 'శ్వాసాభ్యాసం',
      emergency: 'అత్యవసరం',
      weeklyReview: 'వారపు సమీక్ష',
      progressPhotos: 'ప్రోగ్రెస్ ఫోటోలు',
      affirmations: 'అఫర్మేషన్స్',
      dreamJournal: 'డ్రీమ్ జర్నల్',
      familySharing: 'ఫ్యామిలీ షేరింగ్',
      recoveryPlanner: 'రికవరీ ప్లానర్',
      triggerInsights: 'ట్రిగర్ ఇన్‌సైట్స్',
      smartWatch: 'స్మార్ట్ వాచ్',
      offlineMode: 'ఆఫ్‌లైన్ మోడ్',
      biometric: 'బయోమెట్రిక్',
      darkMode: 'డార్క్ మోడ్',
      profile: 'ప్రొఫైల్',
      needHelp: 'తక్షణ సహాయం కావాలా?',
      emergencySupport: 'అత్యవసర సహాయం'
    },
    login: {
      title: 'మళ్లీ స్వాగతం',
      subtitle: 'మీ వెల్‌నెస్ ప్రయాణాన్ని కొనసాగించడానికి సైన్ ఇన్ చేయండి',
      email: 'ఈమెయిల్ అడ్రస్',
      password: 'పాస్‌వర్డ్',
      emailPlaceholder: 'మీ ఈమెయిల్ నమోదు చేయండి',
      passwordPlaceholder: 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
      button: 'సైన్ ఇన్',
      signingIn: 'సైన్ ఇన్ అవుతోంది...',
      noAccount: 'మీకు ఖాతా లేదా?',
      signUp: 'సైన్ అప్ చేయండి'
    },
    register: {
      title: 'ఖాతా సృష్టించండి',
      subtitle: 'ఈరోజే మీ మానసిక వెల్‌నెస్ ప్రయాణాన్ని ప్రారంభించండి',
      fullName: 'పూర్తి పేరు',
      email: 'ఈమెయిల్ అడ్రస్',
      password: 'పాస్‌వర్డ్',
      confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
      fullNamePlaceholder: 'మీ పేరు నమోదు చేయండి',
      emailPlaceholder: 'మీ ఈమెయిల్ నమోదు చేయండి',
      passwordPlaceholder: 'ఒక పాస్‌వర్డ్ సృష్టించండి',
      confirmPasswordPlaceholder: 'మీ పాస్‌వర్డ్ నిర్ధారించండి',
      button: 'ఖాతా సృష్టించండి',
      creating: 'ఖాతా సృష్టిస్తోంది...',
      hasAccount: 'ముందే ఖాతా ఉందా?',
      terms: 'సైన్ అప్ చేయడం ద్వారా మీరు మా సేవా నిబంధనలు మరియు గోప్యతా విధానాన్ని అంగీకరిస్తున్నారు.',
      disclaimer: 'ఈ యాప్ స్వీయ-ట్రాకింగ్ కోసం మాత్రమే; ఇది ప్రొఫెషనల్ కేర్‌కు ప్రత్యామ్నాయం కాదు.',
      passwordMismatch: 'పాస్‌వర్డ్లు సరిపోలలేదు',
      passwordLength: 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి'
    },
    offlineMode: {
      title: 'ఆఫ్‌లైన్ మోడ్',
      subtitle: 'ఇంటర్నెట్ లేకపోయినా మీ డేటాను ఉపయోగించండి',
      online: 'ఆన్‌లైన్',
      offline: 'ఆఫ్‌లైన్',
      youAreOnline: 'మీరు ఆన్‌లైన్‌లో ఉన్నారు',
      youAreOffline: 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు',
      allFeatures: 'అన్ని ఫీచర్లు అందుబాటులో ఉన్నాయి',
      limitedFeatures: 'పరిమిత ఫీచర్లు అందుబాటులో ఉన్నాయి. కనెక్షన్ వచ్చినప్పుడు డేటా సింక్ అవుతుంది.',
      syncing: 'సింక్ అవుతోంది...',
      syncNow: 'ఇప్పుడే సింక్ చేయండి',
      pendingSync: 'అంశాలు సింక్ కోసం వేచి ఉన్నాయి',
      needsSync: 'మీ ఆఫ్‌లైన్ డేటాను సింక్ చేయాలి',
      availableData: 'అందుబాటులో ఉన్న ఆఫ్‌లైన్ డేటా',
      moodEntries: 'మూడ్ ఎంట్రీలు',
      journalEntries: 'జర్నల్ ఎంట్రీలు',
      habits: 'అలవాట్లు',
      medications: 'ఔషధాలు',
      storageUsed: 'ఉపయోగించిన స్టోరేజ్',
      ofStorage: '50 MB లో',
      clearCache: 'క్యాష్ క్లియర్ చేయండి',
      lastSynced: 'చివరిసారి సింక్ అయినది',
      itemsPending: 'అంశాలు వేచి ఉన్నాయి',
      downloadTitle: 'ఆఫ్‌లైన్ కోసం డౌన్‌లోడ్ చేయండి',
      autoDownload: 'ఆటో-డౌన్‌లోడ్',
      downloadDescription: 'ఇంటర్నెట్ లేకుండా ఉపయోగించడానికి మీ డేటాను డౌన్‌లోడ్ చేయండి',
      downloadData: 'డేటా డౌన్‌లోడ్ చేయండి',
      featuresTitle: 'ఆఫ్‌లైన్‌లో అందుబాటులో ఉన్న ఫీచర్లు',
      downloading: 'డౌన్‌లోడ్ అవుతోంది...',
      downloadComplete: 'డౌన్‌లోడ్ పూర్తయింది!',
      dataAvailableOffline: 'మీ డేటా ఇప్పుడు ఆఫ్‌లైన్‌లో అందుబాటులో ఉంది',
      moodHistory: 'మూడ్ చరిత్ర (చివరి 30 రోజులు)',
      journalEntriesData: 'జర్నల్ ఎంట్రీలు',
      habitTrackerData: 'హాబిట్ ట్రాకర్ డేటా',
      medicationSchedule: 'ఔషధాల షెడ్యూల్',
      logMoods: 'మూడ్స్ మరియు భావాలను నమోదు చేయండి',
      writeJournal: 'జర్నల్ ఎంట్రీలు రాయండి',
      trackHabits: 'అలవాట్లను ట్రాక్ చేయండి',
      viewMedication: 'ఔషధ రిమైండర్లను చూడండి',
      accessCoping: 'కోపింగ్ టూల్స్ ఉపయోగించండి',
      genAILimited: 'GenAI స్టూడియో (పరిమితం)',
      communityReadOnly: 'కమ్యూనిటీ పోస్టులు (చదవడానికి మాత్రమే)'
    },
    landing: {
      nav: {
        features: 'ఫీచర్లు',
        experience: 'అనుభవం',
        stories: 'కథలు'
      },
      badge: 'శాంతమైన అనిమేషన్స్ మరియు మెరుగైన UX తో కొత్త ల్యాండింగ్ అనుభవం',
      heroTitleStart: 'మానసిక వెల్‌నెస్ సహాయం ఇప్పుడు మరింత',
      heroTitleAccent: 'శాంతంగా, స్పష్టంగా, తెలివిగా ఉంటుంది.',
      heroDescription:
        'MindCare AI మూడ్ ట్రాకింగ్, గైడెడ్ ప్రోగ్రామ్స్, GenAI కోచింగ్, అనలిటిక్స్ మరియు క్రైసిస్ సపోర్ట్‌ను ఒకే ఫోకస్‌డ్ స్థలంలో కలుపుతుంది. హోమ్‌పేజ్ ఇప్పుడు వినియోగదారుడిని సరైన మొదటి అడుగుకు నేరుగా తీసుకెళ్తుంది.',
      heroChips: {
        aiTitle: 'GenAI + RAG',
        aiDetail: 'మీ డేటాపై ఆధారిత సహాయం',
        programsTitle: 'ప్రోగ్రామ్స్',
        programsDetail: 'బహుళ రోజుల వెల్‌నెస్ ప్లాన్స్',
        safetyTitle: 'భద్రతా మార్గాలు',
        safetyDetail: 'అత్యవసర సహాయం ఎప్పుడూ దగ్గరలోనే'
      },
      board: {
        label: 'డైలీ కాల్మ్ బోర్డ్',
        title: 'మరింత శాంతమైన మరియు స్మార్ట్ మొదటి స్క్రీన్',
        live: 'లైవ్ కాన్సెప్ట్',
        recovery: 'రికవరీ రెడీనెస్',
        sleepRhythm: 'స్థిరమైన నిద్ర రిథమ్',
        stressEasing: 'స్ట్రెస్ తగ్గుతోంది',
        sleepSprint: 'స్లీప్ స్ప్రింట్',
        sleepSprintStatus: '5 లో 3వ రాత్రి యాక్టివ్',
        journalThemes: 'జర్నల్ థీమ్స్',
        journalThemesValue: 'ఓవర్‌వర్క్, సెల్ఫ్-టాక్, రికవరీ',
        flowTitle: 'ఈరోజు గైడెడ్ ఫ్లో',
        flowBadge: 'ఘర్షణ తగ్గింది',
        flowSteps: [
          'ఒక మూడ్ చెక్-ఇన్ నమోదు చేయండి',
          'టాప్ AI ఇన్‌సైట్ చదవండి',
          'మీ యాక్టివ్ ప్రోగ్రామ్ కొనసాగించండి',
          'ఒక ప్రశాంత చర్య సేవ్ చేయండి'
        ],
        ragLabel: 'RAG కోచ్',
        ragTitle: '3 సరిపోయే వెల్‌నెస్ సోర్సులు దొరికాయి',
        ragDescription: 'ఇటీవలి మూడ్ మరియు జర్నల్ చరిత్ర ఆధారంగా స్లీప్ రిథమ్, బర్నౌట్ పేసింగ్, గ్రౌండింగ్ వ్యాయామాలు ఎంపికయ్యాయి.',
        genAIBubbleTitle: 'GenAI స్టూడియో',
        genAIBubbleDetail: 'కేర్ ప్లాన్స్ + విజువల్స్ + సపోర్ట్',
        programsBubbleTitle: 'ప్రోగ్రామ్స్ హబ్',
        programsBubbleDetail: 'కామ్, స్లీప్, గ్రాటిట్యూడ్, కాన్ఫిడెన్స్'
      },
      marquee: [
        'RAG ఆధారిత మార్గదర్శకం',
        'మూడ్ మరియు జర్నల్ ఇంటెలిజెన్స్',
        'బర్నౌట్ మరియు రికవరీ ట్రాకింగ్',
        'కాల్మ్ మరియు స్లీప్ ప్రోగ్రామ్స్',
        'సురక్షిత మానసిక వెల్‌నెస్ జర్నలింగ్',
        'లోపలే అత్యవసర సహాయం',
        'GenAI కేర్ ప్లాన్స్',
        'GAN-రెడీ వెల్‌నెస్ విజువల్స్'
      ],
      whyLabel: 'ఇది ఇప్పుడు ఎందుకు మెరుగ్గా అనిపిస్తోంది',
      whyTitle: 'హోమ్‌పేజ్ ఇప్పుడు మొదట ఉత్పత్తిని వివరిస్తుంది, తర్వాత వినియోగదారుడిని నిర్ణయానికి తీసుకెళ్తుంది.',
      whyDescription:
        'అప్డేటెడ్ UX స్పష్టతతో ప్రారంభమవుతుంది: MindCare AI ఏమి చేస్తుంది, టూల్స్ ఎలా కలుస్తాయి, మొదటి కొన్ని నిమిషాల్లో వినియోగదారు ఏమి సాధించగలడు.',
      capabilities: [
        {
          title: 'GenAI స్టూడియో',
          description: 'సపోర్ట్ చాట్, RAG కోచింగ్, కేర్ ప్లాన్ జనరేషన్ మరియు విజువల్ కాన్సెప్ట్ టూల్స్ ఒకే వర్క్‌స్పేస్‌లో.'
        },
        {
          title: 'స్ట్రక్చర్డ్ ప్రోగ్రామ్స్',
          description: 'కాల్మ్, స్లీప్ రిపేర్, కాన్ఫిడెన్స్, బర్నౌట్ రికవరీ మరియు గ్రాటిట్యూడ్ కోసం గైడెడ్ ప్లాన్స్.'
        },
        {
          title: 'ప్రైవేట్ బై డిజైన్',
          description: 'సురక్షిత అకౌంట్ ఆధారిత ఫ్లోలో మూడ్స్ మరియు జర్నల్ ప్రతిబింబాలను ట్రాక్ చేయండి.'
        },
        {
          title: 'AI మరియు ML సిగ్నల్స్',
          description: 'రోజువారీ వెల్‌నెస్ ట్రాకింగ్ నుంచి రిస్క్, రికవరీ రెడీనెస్ మరియు ట్రెండ్ మార్పులను చూడండి.'
        },
        {
          title: 'అవసరమైనప్పుడు సహాయం',
          description: 'అత్యవసర మార్గాలు, ప్రశాంత టూల్స్ మరియు వ్యావహారిక తదుపరి అడుగులు ఎప్పుడూ దగ్గరలో ఉంటాయి.'
        }
      ],
      exploreFlow: 'ఈ ఫ్లోను చూడండి',
      journey: {
        label: 'ప్రొడక్ట్ ప్రయాణం',
        title: 'చెక్-ఇన్ నుంచి సపోర్ట్ వరకు మరింత స్పష్టమైన మార్గం',
        description: 'రెడిజైన్ చేసిన ఫ్లో హోమ్‌పేజ్‌కు ఒక పని ఇస్తుంది: త్వరగా దారి చూపడం, విలువను వివరించడం, ఉపయోగకరమైన తదుపరి అడుగుకు నడిపించడం.',
        bullets: [
          'వేగంగా నమ్మకం మరియు స్పష్టత ఇవ్వడం',
          'బలమైన టూల్స్‌ను పైభాగంలో చూపించడం',
          'దృష్టిని మరల్చకుండా దిశ చూపే మోషన్ ఉపయోగించడం'
        ],
        stepLabel: 'స్టెప్'
      },
      journeySteps: [
        {
          title: 'రోజును నిజంగా పట్టుకోండి',
          description: 'కొన్ని టాప్స్‌తో మూడ్, నిద్ర, స్ట్రెస్, నోట్స్ మరియు సందర్భాన్ని నమోదు చేయండి.'
        },
        {
          title: 'ప్యాటర్న్స్‌ను స్పష్టతగా మార్చండి',
          description: 'డ్యాష్‌బోర్డ్ రా ఎంట్రీలను ట్రెండ్స్, రిస్క్ సిగ్నల్స్ మరియు వారానికోసారి మార్పులుగా మారుస్తుంది.'
        },
        {
          title: 'సపోర్ట్‌తో స్పందించండి',
          description: 'GenAI కోచింగ్, గైడెడ్ ప్రోగ్రామ్స్ మరియు ప్రశాంత చర్యలను ఉపయోగించండి.'
        }
      ],
      storiesLabel: 'అనుభవంలో ఏమి మారింది',
      storiesTitle: 'మరింత నమ్మకం, సున్నితమైన ప్రవాహం, మెరుగైన కథనం',
      stories: [
        {
          name: 'ఆరవ్',
          role: 'యూనివర్సిటీ విద్యార్థి',
          quote: 'కొత్త లేఅవుట్ ఏది ముందుగా చేయాలో వెంటనే చూపిస్తుంది. నేను చెక్-ఇన్ చేసి, ట్రెండ్ చూసి, కాల్మ్ ప్రోగ్రామ్‌ను సులభంగా ప్రారంభించగలను.',
          focus: 'తక్కువ ఘర్షణ, త్వరిత స్థిరత్వం'
        },
        {
          name: 'నీనా',
          role: 'వర్కింగ్ ప్రొఫెషనల్',
          quote: 'ఇది ఇప్పుడు నిజంగా ఒక సపోర్టివ్ వెల్‌నెస్ స్టూడియోలా అనిపిస్తుంది. ల్యాండింగ్ పేజ్ ఇప్పుడు అన్ని టూల్స్ ఎలా కలుస్తాయో చూపిస్తుంది.',
          focus: 'మరింత స్పష్టమైన ఉత్పత్తి కథనం'
        },
        {
          name: 'డేవిడ్',
          role: 'రిమోట్ టీమ్ లీడ్',
          quote: 'మోషన్ శాంతంగా అనిపిస్తుంది, గోలగా కాదు. ఇది యాప్‌కు ప్రీమియమ్ ఫీల్ ఇస్తుంది మరియు సందేశాన్ని ప్రాక్టికల్‌గా ఉంచుతుంది.',
          focus: 'శాంతమైన మరియు నమ్మకమైన మోషన్'
        }
      ],
      cta: {
        label: 'కొత్త అనుభవాన్ని ప్రారంభించడానికి సిద్ధమా',
        title: 'ఇది ఉత్పత్తిలో భాగంలా అనిపించే హోమ్‌పేజ్, కేవలం ప్రారంభ స్క్రీన్ కాదు.',
        description: 'కొత్త UI అంచనాలను స్పష్టంగా చేస్తుంది, ముఖ్యమైన ఫీచర్లను త్వరగా చూపిస్తుంది, మరియు అనుభవాన్ని ఆధునికంగా మరియు శాంతంగా మార్చుతుంది.'
      }
    }
  }
};

const getNestedValue = (object, path) =>
  path.split('.').reduce((current, segment) => (current === undefined || current === null ? undefined : current[segment]), object);

const detectInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
  }

  const browserLanguage = window.navigator.language?.slice(0, 2)?.toLowerCase();
  return translations[browserLanguage] ? browserLanguage : 'en';
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(detectInitialLanguage);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    const t = (path) => {
      const localizedValue = getNestedValue(translations[language], path);
      if (localizedValue !== undefined) {
        return localizedValue;
      }

      const englishValue = getNestedValue(translations.en, path);
      return englishValue !== undefined ? englishValue : path;
    };

    return {
      language,
      setLanguage,
      t,
      languages: [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'te', label: 'తెలుగు' }
      ]
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
