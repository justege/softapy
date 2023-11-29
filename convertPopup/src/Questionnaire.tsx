import React, { useState,useEffect, useRef, useMemo } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex, Input,Image, Text, HStack, Wrap, WrapItem, Img, Heading} from "@chakra-ui/react";
import { ChatGPT, PopupEngagement, PopupAdditional, Popup, Question, selectedAnswersType} from './Types'
import { motion, useAnimation } from 'framer-motion';
import { Controller } from 'react-hook-form';
import { baseUrl} from './shared'
import DOMPurify from 'dompurify';
import ThreeDotsWave from './ThreeDotsWave'
import shockWaveAnimation from './ConvertPopup'

const MotionButton = motion(ChakraButton);
const MotionBox = motion(ChakraBox)
const MotionImage = motion(Image);



type QuestionnaireProps = {
    allQuestions: Question[];
    popupEngagement: PopupEngagement;
    popup?: Popup;
    question: Question | null;
    selectedAnswers: selectedAnswersType;
    pastChatGPTInput: string[];
    chatGPTs: ChatGPT[];
    pastChatGPTOutput: string[];
    popupAdditionals: PopupAdditional[];
    inputChatGPT: string; 
    control: any;
    clickAnswer: (answerId: number, answerChatGPT: string) => void;
    toggleAnswer: (answerId: number, answerChatGPT: string) => void; 
    submitAnswer: () => void;
    handleChatGPTSubmit: (questionId: number) => void;
    handleButtonSubmit: (ButtonInput: string) => void; 
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Questionnaire = (props: QuestionnaireProps) => {
 
    const { allQuestions, popupEngagement, popup, pastChatGPTInput, chatGPTs, pastChatGPTOutput, popupAdditionals, inputChatGPT, handleChatGPTSubmit, handleButtonSubmit, handleInputChange, question, selectedAnswers, control, clickAnswer, toggleAnswer, submitAnswer} = props

  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    async function preloadImages() {
      const imagePreloadPromises: { [id: string]: Promise<void> } = {};
      const preloadedImagesObject: { [id: string]: HTMLImageElement } = {};

      for (const question of allQuestions) {
        for (const answer of question.answers) {
          const image = new window.Image();
          const promise = new Promise<void>((resolve, reject) => {
            image.onload = () => {
              preloadedImagesObject[answer.id] = image;
              resolve();
            };
            image.onerror = reject;
          });

          image.src = `${baseUrl}${answer.image}`
          imagePreloadPromises[answer.id] = promise;
        }
      }

      try {
        await Promise.all(Object.values(imagePreloadPromises));
        setImagesPreloaded(true);
      } catch (error) {
        console.error('Image preload error:', error);
      }
    }

    preloadImages();
  }, [allQuestions]);


    const flexContainerRef = useRef<HTMLDivElement>(null);

    function formatTextWithLinks(text: string) {
      const urlRegex = /(?:https?:\/\/[^\s]+(?:\.[^\s]+)*(?:\/[^\s]*)?)(?<![.,?!])/g;
      return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
      }

    useEffect(() => {
        handleScrollToBottom(); 
      }, [pastChatGPTOutput]);

    const handleScrollToBottom = () => {
      if (flexContainerRef.current) {
        const { scrollHeight, offsetHeight } = flexContainerRef.current;
        flexContainerRef.current.scrollTop = scrollHeight - offsetHeight;
      }
    };

    const calculateHeight = useMemo(() => {
      if (popup?.popupChatHistoryPercentage && popup?.popupCTAPercentage && chatGPTs.length > 0) {
        return `${(parseInt(popup?.popupChatHistoryPercentage) + parseInt(popup?.popupCTAPercentage))}%`;
      }
      if (popup?.popupChatHistoryPercentage){
        return popup?.popupChatHistoryPercentage
      }
    }, [popup, chatGPTs]);

      const loadingAnimation = useAnimation();

    
      useEffect(() => {
        if(chatGPTs.some((e)=> e.outputChatGPT = '') && question?.text) {
          const startLoadingAnimation = async () => {
            await loadingAnimation.start({
              opacity: [1, 0.6, 0.2, 1], // Opacity values for the loading animation
              transition: { duration: 1, repeat: 5 }, // Duration and repeat options
            });
          };
          startLoadingAnimation();
        } else {
          loadingAnimation.stop()
        }

      if(!question?.text){
          loadingAnimation.stop()
        }
      }, [chatGPTs, loadingAnimation, question?.text]);

    
      const InputComponent = () => {
        return (
        <MotionBox padding={0}>
        
    {question?.answers.some((e)=> e.answerHasInputField) && 
    <>
    {question?.answers.map(answer => (
           <React.Fragment key={answer.id}>
            {answer.answerHasInputField &&
            <>
            <Text maxH={'40%'} textAlign={'left'}>{answer.text}</Text>
            <MotionBox 
              mt={1}
              borderWidth={2} 
              padding={!!answer.answerPadding ? answer.answerPadding : (popup?.answerPadding ?? undefined)} 
              borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
              boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
              borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
              bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
              textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
              margin = {!!answer.answerMargin ? answer.answerMargin : (popup?.answerMargin ?? undefined)}
              whileFocus={{ boxShadow: "0 0 0 2px #black" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              >
              <Controller
              key={answer.id}
              control={control}
              name={`questionId.${answer.id}`}
              render={({ field }) => (
                <Input
                  px={3}
                  variant='flushed' 
                  value={field.value}
                  onChange={field.onChange}
                  placeholder= {answer.answerInputTextField}
                  size='md'
                />
              )}
            />
             </MotionBox>
           </>
          }
      </React.Fragment>
      ))}
      <ChakraButton 
      w={'full'} 
      mt={5}
      onClick={submitAnswer}
      textColor={popup?.popupQuestionarySubmitButtonTextColor ?? undefined}
      backgroundColor={popup?.popupQuestionarySubmitButtonColor ?? undefined}
      borderColor={popup?.popupQuestionarySubmitBorderColor ?? undefined} 
      borderWidth={popup?.popupQuestionarySubmitHasBorder ? 'thin' : undefined}
      >
      {popup?.popupQuestionarySubmitButtonText ?? 'Submit'}
      </ChakraButton>
    </>
    }
    </MotionBox>
    )}

 return(
 <ChakraBox>         
    <ChakraBox ref={flexContainerRef} overflowY="auto" mt={5} textAlign={'center'}> 
    <Heading fontSize={'2xl'} textAlign={'center'}>{question?.text ?? popup?.popupChatFinishMessage }</Heading> 
    <ChakraBox mt={2} >
    <Wrap spacing={4} direction={'row'} justify={'center'}>
      {question?.answers.map((answer) => (

    <React.Fragment key={answer.id}>
      {!answer.answerHasInputField &&
     (
      <WrapItem>
      <MotionBox 
      className='MainComponent'
      key = {answer.id}
      borderWidth={2} 
      padding={0} 
      borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
      boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
      bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
      textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
      overflow="hidden"
      borderColor={!selectedAnswers.some((e) => e.answerId === answer.id) ? !!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? 'teal') : "gray"}
      whileHover={{ scale: 1.003 }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      >
      <ChakraButton
      key={answer.id}
      as="a"
      borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
      boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
      borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
      bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
      textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
      onClick={() => clickAnswer(answer.id, answer.text_for_chatgpt)}
      href={answer.answerHasCallToAction ? answer.answerCallToActionURL : undefined} 
      target="_blank" // Open the URL in a new tab
      rel="noopener noreferrer" // Recommended for security reasons
      height={'160px'}
      width={'180px'}
      p={0} // Remove padding to make image cover the whole button area
      >
      <Flex
        borderColor={!selectedAnswers.some((e) => e.answerId === answer.id) ? !!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? 'white') : undefined}
        direction="column" // stack child components vertically
        align="center" // center-align child components
        justify="flex-end" // align child components to the start
        height="100%"
        width='100%'

      >
        {(answer.imageUrl !== undefined || answer.imageUrl !== undefined) ?
        <>
        <MotionImage 
          src={answer.image ? `${baseUrl}${answer.image}` : answer.imageUrl ? answer.imageUrl : `${baseUrl}${'/uploads/questionMark.png'}`} 
          boxSize="100%" 
          objectFit="cover"
          flexShrink={0} // Prevent the image from shrinking
          flexGrow={1} // Allow the image to grow
          height={'100px'}
        /> 
        </>
        : 
        <MotionBox
        boxSize="100%" 
        height='100px'
        >
          <Text fontFamily={'fantasy'} fontSize={'30px'} >{answer.text}</Text>
        </MotionBox>
        }
        <Flex 
          backgroundColor={selectedAnswers.some((e) => e.answerId === answer.id) ? "white" : !!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)}
          p={1}
          alignItems="center"
          justifyContent="center"
          height={'35px'}
          w={'100%'}
        >
        <Text 
          fontSize='16px' 
          color={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
          textAlign="center" // Center align text
          >
          {answer.text}
        </Text>
        </Flex>
      </Flex>

      </ChakraButton>
      </MotionBox>
      </WrapItem>
      )
      }
   </React.Fragment>
        
            ))
        }
        </Wrap>
</ChakraBox>
<InputComponent />

</ChakraBox>
<Flex justify={"center"} align={'center'} mt={5}>
    <Text fontSize={"10px"}>
        powered by        
    </Text>
    <ChakraBox fontSize={"10px"} ml={1} fontWeight={"extrabold"} as={"a"} href='https://popupfunnel.com/'>
        popupfunnel.com
    </ChakraBox>
</Flex>
</ChakraBox>
)
}