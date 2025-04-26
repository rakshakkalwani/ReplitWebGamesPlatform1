import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useTutorial } from '../../context/TutorialContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface TutorialButtonProps {
  tutorialId: string;
  className?: string;
}

const TutorialButton = ({ tutorialId, className = '' }: TutorialButtonProps) => {
  const { startTutorial, tutorials, completedTutorials } = useTutorial();
  
  // Check if the tutorial exists
  const tutorial = tutorials[tutorialId];
  
  if (!tutorial) {
    return null; // No tutorial available
  }
  
  // Check if the tutorial has been completed
  const isCompleted = completedTutorials.includes(tutorialId);
  
  const handleClick = () => {
    startTutorial(tutorialId);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={`${className} ${isCompleted ? 'text-gray-400' : 'text-indigo-500 animate-pulse'}`}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCompleted ? 'Replay tutorial' : 'View tutorial'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TutorialButton;