import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../../context/TutorialContext';
import { Button } from '../ui/button';
import { X, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

const TutorialOverlay = () => {
  const { 
    activeTutorial,
    currentStep,
    isTutorialActive,
    nextStep,
    prevStep,
    stopTutorial
  } = useTutorial();
  
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  // Calculate current step content
  const currentStepContent = isTutorialActive && activeTutorial 
    ? activeTutorial.steps[currentStep] 
    : null;

  // Position the tutorial card based on the target element if specified
  useEffect(() => {
    if (!currentStepContent || !currentStepContent.element) {
      // Default center position
      setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    try {
      const targetElement = document.querySelector(currentStepContent.element);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const pos = currentStepContent.position || 'bottom';
        
        // Position the tutorial based on the element and specified position
        switch (pos) {
          case 'top':
            setPosition({ 
              top: `${rect.top - 10}px`,
              left: `${rect.left + rect.width / 2}px`,
              transform: 'translate(-50%, -100%)'
            });
            break;
          case 'bottom':
            setPosition({ 
              top: `${rect.bottom + 10}px`,
              left: `${rect.left + rect.width / 2}px`,
              transform: 'translate(-50%, 0)'
            });
            break;
          case 'left':
            setPosition({ 
              top: `${rect.top + rect.height / 2}px`,
              left: `${rect.left - 10}px`,
              transform: 'translate(-100%, -50%)'
            });
            break;
          case 'right':
            setPosition({ 
              top: `${rect.top + rect.height / 2}px`,
              left: `${rect.right + 10}px`,
              transform: 'translate(0, -50%)'
            });
            break;
          default:
            setPosition({ 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            });
        }
      }
    } catch (error) {
      console.error('Error positioning tutorial:', error);
      // Fallback to center position
      setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    }
  }, [currentStepContent]);

  if (!isTutorialActive || !currentStepContent) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />
      
      {/* Tutorial card */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStepContent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            transform: position.transform,
            maxWidth: '400px',
            width: '90%',
            zIndex: 51
          }}
          className="pointer-events-auto"
        >
          <Card className="border-2 border-indigo-500 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Info className="mr-2 h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-lg">{currentStepContent.title}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={stopTutorial} 
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Step {currentStep + 1} of {activeTutorial?.steps.length || 0}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="py-2">
              <p>{currentStepContent.content}</p>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={nextStep}
              >
                {currentStep === (activeTutorial?.steps.length || 0) - 1 ? (
                  'Finish'
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialOverlay;