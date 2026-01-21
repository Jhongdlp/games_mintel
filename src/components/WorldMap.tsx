"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Store, ShoppingBag, Lightbulb, ShieldAlert, Trophy, X, User } from "lucide-react";
import { useState } from "react";

// --- Types ---
type Position = {
  top: string;
  left: string;
};

type Level = {
  id: number;
  pos: Position;
  title: string;
  desc: string;
  icon: keyof typeof iconMap; // Ensure icon matching
};

// --- Data ---
const iconMap = {
  Store,
  ShoppingBag,
  Lightbulb,
  ShieldAlert,
  Trophy,
};

const levels: Level[] = [
  {
    id: 1,
    pos: { top: "79%", left: "24%" }, // Adjusted to bottom circle
    title: "Nivel 1: El Nuevo Pasante",
    desc: "Bienvenido a tu taller. La IA no es un robot que piensa, es tu nuevo 'Pasante Digital' veloz. ¡Aprende a delegar!",
    icon: "Store",
  },
  {
    id: 2,
    pos: { top: "37%", left: "32%" }, // Adjusted to path circle near market
    title: "Nivel 2: Mercado de Prompts",
    desc: "Aquí están los ingredientes. No necesitas código, necesitas 'Prompts' (Recetas). Fórmula: ROL + TAREA + CONTEXTO.",
    icon: "ShoppingBag",
  },
  {
    id: 3,
    pos: { top: "64%", left: "41%" }, // Adjusted to center-left path node
    title: "Nivel 3: Fábrica de Ideas",
    desc: "¿No eres diseñador? No importa. La IA te da la idea creativa y Canva la hace realidad. Vamos a crear tu Logo.",
    icon: "Lightbulb",
  },
  {
    id: 4,
    pos: { top: "64%", left: "69%" }, // Adjusted to right path node before golem
    title: "Jefe Final: El Bloqueo Creativo",
    desc: "¡Cuidado! El monstruo de 'No sé qué poner' ataca. Véncelo subiendo fotos reales de tus productos con tu celular.",
    icon: "ShieldAlert",
  },
  {
    id: 5,
    pos: { top: "37%", left: "75%" }, // Adjusted to circle leading to success building
    title: "Meta: Tu Negocio Digital",
    desc: "¡Misión Cumplida! Tu catálogo está listo. Descarga tu certificado y compártelo con el mundo.",
    icon: "Trophy",
  },
];

export default function WorldMap() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [characterLevelId, setCharacterLevelId] = useState<number>(1);
  const [isMoving, setIsMoving] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<Level | null>(null);

  // Adjacency Graph for Pathfinding (L1<->L3, L2<->L3, L3<->L4, L4<->L5)
  // Ensure these match the visual path connections!
  const adjacency: Record<number, number[]> = {
    1: [3],
    2: [3],
    3: [1, 2, 4],
    4: [3, 5],
    5: [4],
  };

  const getPath = (startId: number, endId: number): Level[] => {
    if (startId === endId) return [levels.find((l) => l.id === startId)!];

    const queue: { id: number; path: number[] }[] = [{ id: startId, path: [startId] }];
    const visited = new Set<number>([startId]);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (id === endId) {
        return path.map((pid) => levels.find((l) => l.id === pid)!);
      }

      const neighbors = adjacency[id] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ id: neighbor, path: [...path, neighbor] });
        }
      }
    }
    return [];
  };

  const handleLevelClick = (level: Level) => {
    if (isMoving) return; // Prevent collecting clicks while moving

    // If clicking the current level, open immediately
    if (characterLevelId === level.id) {
        setSelectedLevel(level);
        return;
    }

    setPendingLevel(level); // Store this to open ONLY after arrival
    setCharacterLevelId(level.id); // Triggers move
  };
  
  // Memoize path for animation if we are changing levels
  // Use a ref or simple derivation if we just rely on passing the array to `animate`
  // The issue: `animate` will try to run whenever the component renders.
  // We need to pass the *specific sequence* when `characterLevelId` changes.
  
  // Let's compute the path from "previous" to "current".
  // We can track `previousLevelId` or just let the `animate` prop logic handle it 
  // by calculating the path *in the render* based on a stored "lastPosition".
  // Simplified: When `characterLevelId` changes, we want to animate from [Prev] -> ... -> [New].
  // However, `animate` array usually starts from *current* visual state. 
  // Providing the full path [Prev, Intermediate, Target] works best.
  
  // To do this cleanly, we can use a "history" or "path" state, but simpler is:
  // We need the *previous* ID to calculate the path.
  // Let's store `lastLevelId` in a ref or state.

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl bg-slate-900 border-4 border-slate-800">
      {/* Background Image */}
      <div className="relative w-full h-auto">
        <img
          src="/imagen.jpg"
          alt="Pixel Art Map"
          className="w-full h-auto object-cover block select-none pointer-events-none"
        />

        {/* Path/Level Markers */}
        <div className="absolute inset-0 top-0 left-0 w-full h-full">
          {levels.map((level) => {
            const IconComponent = iconMap[level.icon];
            // Determine active colors based on level (Danger for boss, Gold for trophy)
            let colorClasses = "bg-blue-500 hover:bg-blue-400 border-blue-700 text-white";
            if (level.icon === "ShieldAlert") {
              colorClasses = "bg-red-600 hover:bg-red-500 border-red-800 text-white";
            } else if (level.icon === "Trophy") {
              colorClasses = "bg-yellow-400 hover:bg-yellow-300 border-yellow-600 text-yellow-900";
            }

            return (
              <motion.button
                key={level.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 
                  w-10 h-10 md:w-12 md:h-12 rounded-full border-2 shadow-lg 
                  flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group
                  ${colorClasses} ${characterLevelId === level.id ? 'ring-4 ring-white ring-opacity-50' : ''}`}
                style={{ top: level.pos.top, left: level.pos.left }}
                onClick={() => handleLevelClick(level)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ y: -5 }}
              >
                {/* Pulse Animation Behind */}
                <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" />
                
                <IconComponent className="w-5 h-5 md:w-6 md:h-6 z-10" strokeWidth={2.5} />

                {/* Tooltip (Hidden if modal is open to reduce clutter) */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs whitespace-nowrap px-2 py-1 rounded pointer-events-none z-20">
                  {level.title}
                </div>
              </motion.button>
            );
          })}

          {/* Character */}
          <Character 
            levels={levels} 
            targetId={characterLevelId} 
            adjacency={adjacency}
            onMoveStart={() => setIsMoving(true)}
            onMoveEnd={() => {
                setIsMoving(false);
                if (pendingLevel) {
                    setSelectedLevel(pendingLevel);
                    setPendingLevel(null);
                }
            }}
          />

        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedLevel && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLevel(null)}
          >
            <motion.div
              className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-lg p-6 max-w-sm w-full relative"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()} 
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedLevel(null)}
                className="absolute top-2 right-2 p-1 hover:bg-slate-100 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Icon Badge */}
              <div className="flex justify-center -mt-12 mb-4">
                 <div className="bg-indigo-600 p-4 rounded-full border-4 border-white shadow-md text-white">
                    {(() => {
                        const Icon = iconMap[selectedLevel.icon];
                        return <Icon className="w-8 h-8" />;
                    })()}
                 </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-3">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {selectedLevel.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {selectedLevel.desc}
                </p>
                {/* Button Removed as requested */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for clean animation logic
function Character({ 
    levels, 
    targetId, 
    adjacency,
    onMoveStart,
    onMoveEnd 
}: { 
    levels: Level[], 
    targetId: number, 
    adjacency: Record<number, number[]>,
    onMoveStart: () => void,
    onMoveEnd: () => void
}) {
    // Keep track of where we are currently (visually) to calculate path
    const [currentId, setCurrentId] = useState(targetId);

    // Calculate path ONLY when target changes
    const getPath = (start: number, end: number) => {
        if (start === end) return [levels.find(l => l.id === end)!.pos];
        const queue = [{ id: start, path: [start] }];
        const visited = new Set([start]);
        
        while (queue.length) {
            const { id, path } = queue.shift()!;
            if (id === end) {
                return path.map(pid => levels.find(l => l.id === pid)!.pos);
            }
            for (const n of (adjacency[id] || [])) {
                if (!visited.has(n)) {
                    visited.add(n);
                    queue.push({ id: n, path: [...path, n]});
                }
            }
        }
        return [levels.find(l => l.id === end)!.pos]; // Fallback
    };

    // Derived animation path
    // We want to animate from currentId -> targetId
    // If they are same, no move.
    
    // We need to trigger the animation. 
    // Framer motion 'animate' prop handling:
    // If we pass an array, it animates through it.
    
    const pathPositions = getPath(currentId, targetId);
    
    return (
        <motion.div
            className="absolute z-20 pointer-events-none flex flex-col items-center"
            initial={false}
            animate={{ 
                top: pathPositions.map(p => p.top),
                left: pathPositions.map(p => p.left)
            }}
            transition={{ 
                duration: Math.max(0.2, (pathPositions.length - 1) * 0.6), // 0.6s per step
                ease: "linear",
                times: pathPositions.length > 1 ? undefined : [1] // Evenly spaced
            }}
            onAnimationStart={onMoveStart}
            onAnimationComplete={() => {
                setCurrentId(targetId); // Update our internal reference
                onMoveEnd();
            }}
            style={{ transform: "translate(-50%, -100%)" }}
        >
            <div className="relative">
                <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-32 h-32 md:w-44 md:h-44 flex items-center justify-center filter drop-shadow-2xl"
                >
                    <img 
                        src="/PersoinajeAi.png" 
                        alt="Character" 
                        className="w-full h-full object-contain"
                    />
                </motion.div>
                <div className="w-16 h-3 bg-black/30 rounded-full blur-[4px] mx-auto -mt-2" />
            </div>
        </motion.div>
    );
}
