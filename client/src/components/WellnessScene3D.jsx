import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const sceneCopy = {
  hero: {
    rings: ['Mood', 'Sleep', 'Care'],
    center: 'AI',
    footer: 'Personal wellness signals'
  },
  sleep: {
    rings: ['Deep', 'REM', 'Light'],
    center: '8h',
    footer: 'Rest rhythm'
  },
  therapist: {
    rings: ['Match', 'Fit', 'Book'],
    center: '98%',
    footer: 'Care network'
  },
  games: {
    rings: ['Focus', 'Breathe', 'Reset'],
    center: 'Play',
    footer: 'Mindful loop'
  }
};

const toneMap = {
  hero: 'scene-3d-hero',
  sleep: 'scene-3d-sleep',
  therapist: 'scene-3d-therapist',
  games: 'scene-3d-games'
};

const WellnessScene3D = ({ variant = 'hero', compact = false, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();
  const copy = sceneCopy[variant] || sceneCopy.hero;

  return (
    <div className={`scene-3d ${toneMap[variant] || toneMap.hero} ${compact ? 'scene-3d-compact' : ''} ${className}`}>
      <div className="scene-3d-perspective">
        <motion.div
          className="scene-3d-stage"
          animate={prefersReducedMotion ? {} : { rotateX: [58, 64, 58], rotateZ: [-8, 8, -8] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="scene-3d-ring scene-3d-ring-one" />
          <div className="scene-3d-ring scene-3d-ring-two" />
          <div className="scene-3d-ring scene-3d-ring-three" />
          <motion.div
            className="scene-3d-core"
            animate={prefersReducedMotion ? {} : { y: [0, -10, 0], rotateY: [0, 24, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {copy.center}
          </motion.div>

          {copy.rings.map((label, index) => (
            <motion.div
              key={label}
              className={`scene-3d-chip scene-3d-chip-${index + 1}`}
              animate={prefersReducedMotion ? {} : { y: [0, index % 2 ? 9 : -9, 0] }}
              transition={{ duration: 4.6 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
            >
              {label}
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="scene-3d-floor" />
      <p className="scene-3d-caption">{copy.footer}</p>
    </div>
  );
};

export default WellnessScene3D;
