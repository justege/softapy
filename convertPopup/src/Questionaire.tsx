import { useEffect, useState, useRef, useMemo } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex, Input, Text, Spacer, Img,  Stack, Image, useColorModeValue , VStack, Center, Textarea} from "@chakra-ui/react";
import { baseUrl} from './shared'
import { Props, ChatGPT, PopupEngagement, PopupAdditional, Popup, Answer, Question, selectedAnswersType} from './Types'
import { Controller, useForm } from 'react-hook-form';
import FormComponent from './FormComponent';
import { motion, useAnimation } from 'framer-motion';

const MotionImage = motion(Image);
const MotionButton = motion(ChakraButton);
const MotionBox = motion(ChakraBox)

type QuestionaireProps  = {
    popup?: Popup;
    question: Question | null;
    selectedAnswers: selectedAnswersType;
    control: any;
    clickAnswer: (answerId: number, answerChatGPT: string) => void;
    toggleAnswer: (answerId: number, answerChatGPT: string) => void; 
    submitAnswer: () => void;
}


export const Questionaire = (props: QuestionaireProps) => {

    const { popup, question, selectedAnswers, control, clickAnswer, toggleAnswer, submitAnswer } = props
    const bgColor = useColorModeValue('white', 'white');
    const calculateAnswerHeight = useMemo(() => {
        if (!popup?.popupImageHeight || !question?.answers.length) {
          return null;
        }
        
        return (popup.popupImageHeight ) / (question.answers.length + 1.2) - 10;
    }, [popup, question?.answers]);

    return (
        <>
        <ChakraBox
          p={5}
          bg={bgColor}
          display="flex"
          borderRight ={popup?.popupImageBorderWidth ?? undefined}
          borderColor={popup?.popupImageBorderColor ?? undefined}
          width={popup?.popupImageWidth ?? undefined}
          height={popup?.popupImageHeight ?? undefined} 
          borderRightWidth={2}
          flexDirection="column"
          justifyContent="space-between"
        >
          <Text 
          fontSize="lg" 
          mb={1} 
          color={'black'} 
          fontWeight= {"bold"} 
          >
            {question?.text} 
          </Text>

      <VStack spacing={2} align="stretch" overflow='auto' height='90%'>
      {question?.answers.map((answer) => (
      <>
      {!answer.answerHasInputField &&
      (
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
      variant="solid"
      borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
      boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
      borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
      bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
      textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
      onClick={() => !question.multiSelection ? clickAnswer(answer.id, answer.text_for_chatgpt) : answer.answerHasCallToAction ? false :  toggleAnswer(answer.id, answer.text_for_chatgpt)}
      href={answer.answerHasCallToAction ? answer.answerCallToActionURL : undefined} 
      target="_blank" // Open the URL in a new tab
      rel="noopener noreferrer" // Recommended for security reasons
      width="100%"
      height={ calculateAnswerHeight ?? undefined}
      p={0} // Remove padding to make image cover the whole button area
      >
      <Flex
        borderColor={!selectedAnswers.some((e) => e.answerId === answer.id) ? !!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? 'teal') : "gray"}
        direction="column" // stack child components vertically
        align="center" // center-align child components
        justify="flex-start" // align child components to the start
        width="100%"
        height="100%"
        overflow="hidden"
      >
        <MotionImage 
          src={`${baseUrl}${answer.image}`} 
          boxSize="100%" 
          objectFit="cover"
          flexShrink={0} // Prevent the image from shrinking
          flexGrow={1} // Allow the image to grow
          minHeight='80%'
          maxHeight="80%" // Limit image height to 80% of the flex container
          />
        <Text
          backgroundColor={selectedAnswers.some((e) => e.answerId === answer.id) ? "teal" : "gray"}
          p={1}
          justifyItems={'center'}
          width={'100%'}
          fontSize={'sm'} 
          color={'white'}
          minHeight='20%'
          maxHeight="20%" // Limit text height to 20% of the flex container
          overflow="auto" // Add scroll if the text is too much to fit in the allocated space
          >
          {answer.text}
        </Text>
      </Flex>
      </ChakraButton>
      </MotionBox>)
      }
      </>
      ))}
     {question?.answers.map(answer => (
          <>
          {answer.answerHasInputField &&
            <MotionBox 
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
            <Text maxH={'40%'}>{answer.text}</Text>
            <Controller
            key={answer.id}
            control={control}
            name={`questionId.${answer.id}`}
            render={({ field }) => (
              <Input
                variant='flushed' 
                maxH={'60%'}
                value={field.value}
                onChange={field.onChange}
                placeholder= {answer.answerInputTextField}
                size='sm'
              />
            )}
          />
           </MotionBox>
        }
        </>
      ))}
    </VStack>    

    <MotionButton 
    position="absolute" 
    backgroundColor={popup?.popupQuestionarySubmitButtonColor ?? undefined}
    textColor={popup?.popupQuestionarySubmitButtonTextColor ?? undefined} 
    borderColor={popup?.popupQuestionarySubmitBorderColor ?? undefined}
    borderWidth={popup?.popupQuestionarySubmitHasBorder ? 'thin' : 'unset'}
    mt={5} 
    bottom="14px" 
    w='290px'
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.94 }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    onClick={() => {
      submitAnswer()
      }} >{popup?.popupQuestionarySubmitButtonText}</MotionButton>
        </ChakraBox>

        {false && 
                <Img
                src={`${baseUrl}${popup?.popupImage}`}
              />
        }
    {popup?.popupHasLogo && 
    <Text h={'3%'} align={'center'} fontSize={'xs'}>
    {'Powered with ♥ by convertpopup.com'}
    </Text>} 
    </>
    )
}