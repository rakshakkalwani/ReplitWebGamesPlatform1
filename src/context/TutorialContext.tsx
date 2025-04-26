import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the tutorial step interface
export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  element?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Define the tutorial interface
export interface Tutorial {
  id: string;
  gameId: number;
  name: string;
  steps: TutorialStep[];
}

interface TutorialContextType {
  tutorials: Record<string, Tutorial>;
  activeTutorial: Tutorial | null;
  currentStep: number;
  isTutorialActive: boolean;
  startTutorial: (tutorialId: string) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  completedTutorials: string[];
  markTutorialComplete: (tutorialId: string) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const STORAGE_KEY = 'gamezone_completed_tutorials';

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [tutorials, setTutorials] = useState<Record<string, Tutorial>>({});
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(() => {
    // Load completed tutorials from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Save completed tutorials to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTutorials));
  }, [completedTutorials]);

  // Add a tutorial to the available tutorials
  const addTutorial = (tutorial: Tutorial) => {
    setTutorials(prev => ({ ...prev, [tutorial.id]: tutorial }));
  };

  // Start a tutorial by ID
  const startTutorial = (tutorialId: string) => {
    const tutorial = tutorials[tutorialId];
    if (tutorial) {
      setActiveTutorial(tutorial);
      setCurrentStep(0);
    } else {
      console.error(`Tutorial with ID ${tutorialId} not found`);
    }
  };

  // Stop the current tutorial
  const stopTutorial = () => {
    setActiveTutorial(null);
    setCurrentStep(0);
  };

  // Move to the next step
  const nextStep = () => {
    if (activeTutorial && currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the tutorial if we're on the last step
      if (activeTutorial) {
        markTutorialComplete(activeTutorial.id);
      }
      stopTutorial();
    }
  };

  // Move to the previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Go to a specific step
  const goToStep = (stepIndex: number) => {
    if (activeTutorial && stepIndex >= 0 && stepIndex < activeTutorial.steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Mark a tutorial as completed
  const markTutorialComplete = (tutorialId: string) => {
    if (!completedTutorials.includes(tutorialId)) {
      setCompletedTutorials([...completedTutorials, tutorialId]);
    }
  };

  // Load available tutorials
  useEffect(() => {
    // In a real app, we might fetch tutorials from an API or local data
    // For now, we'll add some sample tutorials directly
    const sampleTutorials: Tutorial[] = [
      {
        id: 'bounce-tutorial',
        gameId: 6, // ID of the Bounce game
        name: 'How to play Bounce',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to Bounce!',
            content: 'This quick tutorial will teach you how to play the game.'
          },
          {
            id: 'controls',
            title: 'Game Controls',
            content: 'Use the arrow keys or WASD to control the ball. Your goal is to collect all the gems without hitting obstacles.'
          },
          {
            id: 'score',
            title: 'Scoring',
            content: 'Collect gems to increase your score. The faster you complete a level, the higher your score multiplier!'
          },
          {
            id: 'obstacles',
            title: 'Watch Out!',
            content: 'Red spikes and moving enemies will cause you to lose a life. You have three lives per game.'
          },
          {
            id: 'powerups',
            title: 'Power-Ups',
            content: 'Look for special power-ups like shields and speed boosts to help you complete difficult levels.'
          },
          {
            id: 'ready',
            title: 'Ready to Play?',
            content: 'Click "Play Now" to start your adventure!'
          }
        ]
      },
      {
        id: 'basket-slide-tutorial',
        gameId: 2, // ID of the Basket Slide game
        name: 'How to play Basket Slide',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to Basket Slide!',
            content: 'Let\'s learn how to play this exciting basketball game.'
          },
          {
            id: 'controls',
            title: 'Game Controls',
            content: 'Click and drag to aim your shot. Release to shoot the ball into the basket.'
          },
          {
            id: 'scoring',
            title: 'Scoring Points',
            content: 'Each successful basket earns you points. Perfect shots earn bonus points!'
          },
          {
            id: 'time',
            title: 'Beat the Clock',
            content: 'You have a limited time to score as many points as possible. Watch the timer!'
          },
          {
            id: 'ready',
            title: 'Ready to Score?',
            content: 'Click "Play Now" to start shooting some hoops!'
          }
        ]
      }
    ];

    // Add sample tutorials to state
    sampleTutorials.forEach(addTutorial);
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        tutorials,
        activeTutorial,
        currentStep,
        isTutorialActive: activeTutorial !== null,
        startTutorial,
        stopTutorial,
        nextStep,
        prevStep,
        goToStep,
        completedTutorials,
        markTutorialComplete,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}