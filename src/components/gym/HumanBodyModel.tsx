import React from 'react';
import { MuscleGroup } from '../../types';

interface HumanBodyModelProps {
  selectedMuscles: MuscleGroup[];
  onToggleMuscle: (muscle: MuscleGroup) => void;
  perspective: 'front' | 'back' | 'both';
  onPerspectiveChange?: (perspective: 'front' | 'back') => void;
  className?: string;
}

export const HumanBodyModel: React.FC<HumanBodyModelProps> = ({
  selectedMuscles,
  onToggleMuscle,
  perspective = 'both',
  className = ''
}) => {
  const isSelected = (muscle: MuscleGroup) => selectedMuscles.includes(muscle);

  const getFill = (muscle: MuscleGroup) => {
    return isSelected(muscle) ? '#1E4731' : '#D1E3DA';
  };

  const getStroke = (muscle: MuscleGroup) => {
    return isSelected(muscle) ? '#0F2418' : '#ADC5B9';
  };

  const getOpacity = (muscle: MuscleGroup) => {
    return isSelected(muscle) ? '1' : '0.85';
  };

  // Anterior (Front) Body Model Component
  const renderFrontBody = () => (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-mono font-black uppercase tracking-wider text-forest-800 mb-1">
        Front
      </span>
      <svg
        className="w-48 sm:w-56 h-[340px] sm:h-[380px] drop-shadow-sm select-none transition-all cursor-pointer"
        viewBox="0 0 200 400"
      >
        {/* Head and Neck Base */}
        <ellipse cx="100" cy="38" rx="14" ry="18" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1.5" />
        {/* Neck */}
        <path d="M93 54 L93 68 L107 68 L107 54 Z" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1.2" />

        {/* ============================================================ */}
        {/* SHOULDERS / DELTOIDS (FRONT)                                  */}
        {/* ============================================================ */}
        {/* Left Shoulder */}
        <g onClick={() => onToggleMuscle('Shoulders')} className="hover:opacity-100 transition-opacity">
          <path
            d="M58 84 C48 92 44 106 46 120 C54 118 64 106 66 94 Z"
            fill={getFill('Shoulders')}
            stroke={getStroke('Shoulders')}
            strokeWidth="1.5"
            opacity={getOpacity('Shoulders')}
          />
          <title>Shoulders (Anterior & Lateral Deltoids)</title>
        </g>
        {/* Right Shoulder */}
        <g onClick={() => onToggleMuscle('Shoulders')} className="hover:opacity-100 transition-opacity">
          <path
            d="M142 84 C152 92 156 106 154 120 C146 118 136 106 134 94 Z"
            fill={getFill('Shoulders')}
            stroke={getStroke('Shoulders')}
            strokeWidth="1.5"
            opacity={getOpacity('Shoulders')}
          />
          <title>Shoulders (Anterior & Lateral Deltoids)</title>
        </g>

        {/* ============================================================ */}
        {/* CHEST (PECTORALIS MAJOR)                                      */}
        {/* ============================================================ */}
        {/* Left Pec */}
        <g onClick={() => onToggleMuscle('Chest')} className="hover:opacity-100 transition-opacity">
          <path
            d="M68 88 C82 90 98 94 98 122 C84 124 68 116 66 98 Z"
            fill={getFill('Chest')}
            stroke={getStroke('Chest')}
            strokeWidth="1.5"
            opacity={getOpacity('Chest')}
          />
          <title>Chest (Left Pectoral)</title>
        </g>
        {/* Right Pec */}
        <g onClick={() => onToggleMuscle('Chest')} className="hover:opacity-100 transition-opacity">
          <path
            d="M132 88 C118 90 102 94 102 122 C116 124 132 116 134 98 Z"
            fill={getFill('Chest')}
            stroke={getStroke('Chest')}
            strokeWidth="1.5"
            opacity={getOpacity('Chest')}
          />
          <title>Chest (Right Pectoral)</title>
        </g>

        {/* ============================================================ */}
        {/* BICEPS                                                       */}
        {/* ============================================================ */}
        {/* Left Bicep */}
        <g onClick={() => onToggleMuscle('Biceps')} className="hover:opacity-100 transition-opacity">
          <path
            d="M44 124 C40 138 42 154 48 158 C52 148 54 132 52 124 Z"
            fill={getFill('Biceps')}
            stroke={getStroke('Biceps')}
            strokeWidth="1.5"
            opacity={getOpacity('Biceps')}
          />
          <title>Left Bicep</title>
        </g>
        {/* Right Bicep */}
        <g onClick={() => onToggleMuscle('Biceps')} className="hover:opacity-100 transition-opacity">
          <path
            d="M156 124 C160 138 158 154 152 158 C148 148 146 132 148 124 Z"
            fill={getFill('Biceps')}
            stroke={getStroke('Biceps')}
            strokeWidth="1.5"
            opacity={getOpacity('Biceps')}
          />
          <title>Right Bicep</title>
        </g>

        {/* Forearms (Left & Right) */}
        <path
          d="M38 160 C32 180 30 200 34 212 C40 210 46 185 48 162 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />
        <path
          d="M162 160 C168 180 170 200 166 212 C160 210 154 185 152 162 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />
        {/* Hands */}
        <circle cx="34" cy="220" r="6" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />
        <circle cx="166" cy="220" r="6" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />

        {/* ============================================================ */}
        {/* ABDOMINALS / CORE                                            */}
        {/* ============================================================ */}
        <g onClick={() => onToggleMuscle('Core')} className="hover:opacity-100 transition-opacity">
          {/* Upper & Mid Abs */}
          <path
            d="M84 126 C94 126 106 126 116 126 C116 160 114 175 100 185 C86 175 84 160 84 126 Z"
            fill={getFill('Core')}
            stroke={getStroke('Core')}
            strokeWidth="1.5"
            opacity={getOpacity('Core')}
          />
          {/* Rectus Abdominis Lines */}
          <line x1="100" y1="126" x2="100" y2="182" stroke={isSelected('Core') ? '#14291D' : '#9EBAB0'} strokeWidth="1.2" />
          <line x1="88" y1="145" x2="112" y2="145" stroke={isSelected('Core') ? '#14291D' : '#9EBAB0'} strokeWidth="1" />
          <line x1="88" y1="162" x2="112" y2="162" stroke={isSelected('Core') ? '#14291D' : '#9EBAB0'} strokeWidth="1" />
          <title>Core & Abdominals</title>
        </g>

        {/* Obliques (Sides) */}
        <g onClick={() => onToggleMuscle('Core')} className="hover:opacity-100 transition-opacity">
          <path
            d="M68 126 C78 132 82 150 82 178 C74 170 66 150 66 130 Z"
            fill={getFill('Core')}
            stroke={getStroke('Core')}
            strokeWidth="1.2"
            opacity={getOpacity('Core')}
          />
          <path
            d="M132 126 C122 132 118 150 118 178 C126 170 134 150 134 130 Z"
            fill={getFill('Core')}
            stroke={getStroke('Core')}
            strokeWidth="1.2"
            opacity={getOpacity('Core')}
          />
        </g>

        {/* Pelvis / Hip Base */}
        <path d="M78 184 L122 184 L118 205 L82 205 Z" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1.2" />

        {/* ============================================================ */}
        {/* QUADRICEPS (THIGHS)                                          */}
        {/* ============================================================ */}
        {/* Left Quad */}
        <g onClick={() => onToggleMuscle('Quads')} className="hover:opacity-100 transition-opacity">
          <path
            d="M66 206 C62 230 64 270 76 276 C86 270 88 230 84 206 Z"
            fill={getFill('Quads')}
            stroke={getStroke('Quads')}
            strokeWidth="1.5"
            opacity={getOpacity('Quads')}
          />
          <title>Left Quadriceps</title>
        </g>
        {/* Right Quad */}
        <g onClick={() => onToggleMuscle('Quads')} className="hover:opacity-100 transition-opacity">
          <path
            d="M134 206 C138 230 136 270 124 276 C114 270 112 230 116 206 Z"
            fill={getFill('Quads')}
            stroke={getStroke('Quads')}
            strokeWidth="1.5"
            opacity={getOpacity('Quads')}
          />
          <title>Right Quadriceps</title>
        </g>

        {/* Knees */}
        <circle cx="76" cy="284" r="5" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />
        <circle cx="124" cy="284" r="5" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />

        {/* Shins / Calves Front */}
        <path
          d="M72 292 C68 315 70 345 74 368 C78 368 82 345 80 292 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />
        <path
          d="M128 292 C132 315 130 345 126 368 C122 368 118 345 120 292 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />

        {/* Feet */}
        <ellipse cx="74" cy="376" rx="8" ry="4" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />
        <ellipse cx="126" cy="376" rx="8" ry="4" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />
      </svg>
    </div>
  );

  // Posterior (Back) Body Model Component
  const renderBackBody = () => (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-mono font-black uppercase tracking-wider text-forest-800 mb-1">
        Back
      </span>
      <svg
        className="w-48 sm:w-56 h-[340px] sm:h-[380px] drop-shadow-sm select-none transition-all cursor-pointer"
        viewBox="0 0 200 400"
      >
        {/* Head Back */}
        <ellipse cx="100" cy="38" rx="14" ry="18" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1.5" />
        {/* Neck */}
        <path d="M93 54 L93 68 L107 68 L107 54 Z" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1.2" />

        {/* ============================================================ */}
        {/* UPPER BACK & TRAPS                                           */}
        {/* ============================================================ */}
        <g onClick={() => onToggleMuscle('Back')} className="hover:opacity-100 transition-opacity">
          <path
            d="M80 68 C92 76 108 76 120 68 C128 90 100 118 100 118 C100 118 72 90 80 68 Z"
            fill={getFill('Back')}
            stroke={getStroke('Back')}
            strokeWidth="1.5"
            opacity={getOpacity('Back')}
          />
          <title>Trapezius & Upper Back</title>
        </g>

        {/* ============================================================ */}
        {/* REAR DELTOIDS (POSTERIOR SHOULDERS)                          */}
        {/* ============================================================ */}
        <g onClick={() => onToggleMuscle('Shoulders')} className="hover:opacity-100 transition-opacity">
          <path
            d="M58 84 C48 92 44 106 46 120 C54 118 64 106 66 94 Z"
            fill={getFill('Shoulders')}
            stroke={getStroke('Shoulders')}
            strokeWidth="1.5"
            opacity={getOpacity('Shoulders')}
          />
          <path
            d="M142 84 C152 92 156 106 154 120 C146 118 136 106 134 94 Z"
            fill={getFill('Shoulders')}
            stroke={getStroke('Shoulders')}
            strokeWidth="1.5"
            opacity={getOpacity('Shoulders')}
          />
          <title>Rear Deltoids (Shoulders)</title>
        </g>

        {/* ============================================================ */}
        {/* LATISSIMUS DORSI (LATS / MID-BACK)                           */}
        {/* ============================================================ */}
        {/* Left Lat */}
        <g onClick={() => onToggleMuscle('Back')} className="hover:opacity-100 transition-opacity">
          <path
            d="M66 108 C80 114 96 118 96 160 C80 160 66 145 60 122 Z"
            fill={getFill('Back')}
            stroke={getStroke('Back')}
            strokeWidth="1.5"
            opacity={getOpacity('Back')}
          />
          <title>Left Latissimus Dorsi</title>
        </g>
        {/* Right Lat */}
        <g onClick={() => onToggleMuscle('Back')} className="hover:opacity-100 transition-opacity">
          <path
            d="M134 108 C120 114 104 118 104 160 C120 160 134 145 140 122 Z"
            fill={getFill('Back')}
            stroke={getStroke('Back')}
            strokeWidth="1.5"
            opacity={getOpacity('Back')}
          />
          <title>Right Latissimus Dorsi</title>
        </g>

        {/* ============================================================ */}
        {/* TRICEPS (POSTERIOR ARMS)                                     */}
        {/* ============================================================ */}
        <g onClick={() => onToggleMuscle('Triceps')} className="hover:opacity-100 transition-opacity">
          {/* Left Tricep */}
          <path
            d="M44 124 C40 138 42 154 48 158 C52 148 54 132 52 124 Z"
            fill={getFill('Triceps')}
            stroke={getStroke('Triceps')}
            strokeWidth="1.5"
            opacity={getOpacity('Triceps')}
          />
          {/* Right Tricep */}
          <path
            d="M156 124 C160 138 158 154 152 158 C148 148 146 132 148 124 Z"
            fill={getFill('Triceps')}
            stroke={getStroke('Triceps')}
            strokeWidth="1.5"
            opacity={getOpacity('Triceps')}
          />
          <title>Triceps Brachii</title>
        </g>

        {/* Forearms & Hands */}
        <path
          d="M38 160 C32 180 30 200 34 212 C40 210 46 185 48 162 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />
        <path
          d="M162 160 C168 180 170 200 166 212 C160 210 154 185 152 162 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />
        <circle cx="34" cy="220" r="6" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />
        <circle cx="166" cy="220" r="6" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />

        {/* Lower Back (Erectors) */}
        <g onClick={() => onToggleMuscle('Back')} className="hover:opacity-100 transition-opacity">
          <path
            d="M86 156 C94 156 106 156 114 156 C114 194 100 196 100 196 C100 196 86 194 86 156 Z"
            fill={getFill('Back')}
            stroke={getStroke('Back')}
            strokeWidth="1.5"
            opacity={getOpacity('Back')}
          />
          <title>Lower Back (Erector Spinae)</title>
        </g>

        {/* Glutes */}
        <g onClick={() => onToggleMuscle('Quads')} className="hover:opacity-100 transition-opacity">
          <path
            d="M66 195 C80 195 98 195 98 226 C82 226 64 216 66 195 Z"
            fill={getFill('Quads')}
            stroke={getStroke('Quads')}
            strokeWidth="1.5"
            opacity={getOpacity('Quads')}
          />
          <path
            d="M134 195 C120 195 102 195 102 226 C118 226 136 216 134 195 Z"
            fill={getFill('Quads')}
            stroke={getStroke('Quads')}
            strokeWidth="1.5"
            opacity={getOpacity('Quads')}
          />
          <title>Glutes (Gluteus Maximus)</title>
        </g>

        {/* ============================================================ */}
        {/* HAMSTRINGS (POSTERIOR THIGHS)                                */}
        {/* ============================================================ */}
        {/* Left Hamstring */}
        <g onClick={() => onToggleMuscle('Hamstrings')} className="hover:opacity-100 transition-opacity">
          <path
            d="M68 228 C64 245 66 270 76 276 C84 270 86 245 84 228 Z"
            fill={getFill('Hamstrings')}
            stroke={getStroke('Hamstrings')}
            strokeWidth="1.5"
            opacity={getOpacity('Hamstrings')}
          />
          <title>Left Hamstrings</title>
        </g>
        {/* Right Hamstring */}
        <g onClick={() => onToggleMuscle('Hamstrings')} className="hover:opacity-100 transition-opacity">
          <path
            d="M132 228 C136 245 134 270 124 276 C116 270 114 245 116 228 Z"
            fill={getFill('Hamstrings')}
            stroke={getStroke('Hamstrings')}
            strokeWidth="1.5"
            opacity={getOpacity('Hamstrings')}
          />
          <title>Right Hamstrings</title>
        </g>

        {/* Calves (Gastrocnemius / Soleus Back) */}
        <path
          d="M72 292 C64 315 66 345 74 368 C80 368 84 345 80 292 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />
        <path
          d="M128 292 C136 315 134 345 126 368 C120 368 116 345 120 292 Z"
          fill="#D1E3DA"
          stroke="#ADC5B9"
          strokeWidth="1.2"
        />

        {/* Feet */}
        <ellipse cx="74" cy="376" rx="8" ry="4" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />
        <ellipse cx="126" cy="376" rx="8" ry="4" fill="#D9E4DF" stroke="#B8CCC2" strokeWidth="1" />
      </svg>
    </div>
  );

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      {perspective === 'both' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-items-center w-full">
          {renderFrontBody()}
          {renderBackBody()}
        </div>
      ) : perspective === 'front' ? (
        renderFrontBody()
      ) : (
        renderBackBody()
      )}
    </div>
  );
};
