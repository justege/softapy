import React, { useEffect, useState, useRef, useMemo, MutableRefObject } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex, Input,Image, Text, HStack, extendTheme, Wrap, WrapItem} from "@chakra-ui/react";
import { ChatGPT, PopupEngagement, PopupAdditional, Popup, Question, selectedAnswersType} from './Types'
import { motion, useAnimation } from 'framer-motion';
import { Controller } from 'react-hook-form';
import { baseUrl} from './shared'
import DOMPurify from 'dompurify';
import ThreeDotsWave from './ThreeDotsWave'



const MotionButton = motion(ChakraButton);
const MotionBox = motion(ChakraBox)
const MotionImage = motion(Image);


type QuestionaireInChatProps = {
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

export const QuestionaireInChat = (props: QuestionaireInChatProps) => {

    const { popupEngagement, popup, pastChatGPTInput, chatGPTs, pastChatGPTOutput, popupAdditionals, inputChatGPT, handleChatGPTSubmit, handleButtonSubmit, handleInputChange, question, selectedAnswers, control, clickAnswer, toggleAnswer, submitAnswer} = props

    const flexContainerRef = useRef<HTMLDivElement>(null);

    function formatTextWithLinks(text: string) {
      const urlRegex = /(?:https?:\/\/[^\s]+(?:\.[^\s]+)*(?:\/[^\s]*)?)(?<![.,?!])/g;
      return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
      }

    useEffect(() => {
        handleScrollToBottom(); // Scroll to the bottom after chatGPTs update
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

      const [loading, setLoading] = useState(false);
      const loadingAnimation = useAnimation();
    
      useEffect(() => {
        if (chatGPTs.some((e)=> e.outputChatGPT = '')) {
          setLoading(true); // Set loading to true when there is no chat output
          const startLoadingAnimation = async () => {
            await loadingAnimation.start({
              opacity: [1, 0.6, 0.2, 1], // Opacity values for the loading animation
              transition: { duration: 1, repeat: Infinity }, // Duration and repeat options
            });
          };

    
          startLoadingAnimation();
        } else {
          loadingAnimation.stop()
          setLoading(false); // Set loading to false when chatGPTs have some output
        }
      }, [chatGPTs, loadingAnimation]);


    return (
     <ChakraBox>    
      {popupEngagement?.popupEngagementUniqueIdentifier && (
        <Flex
          direction="column"
          h={popup?.popupTitleAndContentPercentage ?? undefined }
          ml={popup?.popupTextMarginLeft ?? undefined}
          mr={popup?.popupTextMarginRight ?? undefined}
        >
          <ChakraBox>
            {popup?.popupTitle && (
              <ChakraBox
                p={2}
                mt={2}
                minHeight={popup?.popupTitleHeight ?? undefined}
                width={popup?.popupTitleWidth ?? undefined}
                textColor={popup?.popupTitleTextColor ?? undefined}
              >
                <Text 
                fontSize= {popup?.popupTitleFontSize ?? "3xl"} 
                fontWeight= {popup?.popupTitleFontWeight ?? "bold"} 
                textAlign="center"   
                bgGradient={popup?.popupTitleBgGradient ?? 'linear(to-l, #7928CA, #FF0080)'}
                bgClip='text'
                >
                  {popup?.popupTitle}
                </Text>
              </ChakraBox>
            )}

            {popup?.popupContent && (
              <ChakraBox
                p={2}
                mt={2}
                minHeight={popup?.popupContentHeight ?? undefined}
                width={popup?.popupContentWidth ?? undefined}
                textColor={popup?.popupContentTextColor ?? undefined}
              >
                <Text fontSize= {popup?.popupContentFontSize ?? "sm"} fontWeight= {popup?.popupContentFontWeight ?? "bold"} >
                  {popup?.popupContent}
                  </Text>
              </ChakraBox>
            )}
          </ChakraBox>
        </Flex>
      )}
        <ChakraBox ref={flexContainerRef} overflowY="auto" h={calculateHeight} mt={10}>
        <ChakraBox p={2} m={1}>
          <Flex direction="column">
            {(pastChatGPTInput.length>0 ? pastChatGPTInput : ['...']).map((input, index) => (
              <ChakraBox key={index}>
                <Flex justifyContent="flex-end">
                  <MotionBox
                    mt={1}
                    px={2}
                    py={2}
                    fontSize={popup?.popupChatHistoryFontSize ?? "sm"}
                    borderRadius="8px 8px 0 8px"
                    borderWidth="1px"
                    borderColor={popup?.popupChatHistoryInputFocusBorderColor ?? undefined}
                    boxShadow="md"
                    textColor={popup?.popupChatHistoryInputTextColor ?? undefined}
                    backgroundColor={popup?.popupChatHistoryInputBoxColor ?? undefined}
                    position="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "8px",
                      height: "8px",
                      borderTopRightRadius: 0,
                      backgroundColor: popup?.popupChatHistoryInputBoxColor ?? undefined,
                    }}
                    textAlign={"left"}
                  >
                    { pastChatGPTInput.length > 0 ? input : popup?.popupExampleInputChatGPT}
                  </MotionBox>
                </Flex>
                  <Flex justifyContent="flex-start">
                    <MotionBox
                      mt={1}
                      px={2}
                      py={2}
                      fontSize={popup?.popupChatHistoryFontSize ?? "sm"}
                      borderRadius="8px 8px 8px 0"
                      borderWidth="1px"
                      borderColor={popup?.popupChatHistoryOutputFocusBorderColor ?? undefined}
                      boxShadow="md"
                      textColor={popup?.popupChatHistoryOutputTextColor ?? undefined}
                      backgroundColor={popup?.popupChatHistoryOutputBoxColor ?? undefined}
                      position="relative"
                      overflow="hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      _after={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "8px",
                        height: "8px",
                        borderTopLeftRadius: 0,
                        backgroundColor: popup?.popupChatHistoryOutputBoxColor ?? undefined,
                      }}
                      textAlign={"left"}
                    >
                    {pastChatGPTInput.length > 0 ?  
                      (!pastChatGPTOutput[index] ?       
                      <ThreeDotsWave />
                      : <Text dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(formatTextWithLinks(pastChatGPTOutput[index]))}} />) 
                      : popup?.popupExampleOutputChatGPT
                      }
                    </MotionBox>
                  </Flex>
              </ChakraBox>
            ))}
    <HStack spacing={2} overflow='auto' height='90%' mt={2}>
    <Wrap spacing={4}>
      {question?.answers.map((answer) => (
      <WrapItem >
    <React.Fragment key={answer.id}>
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
      borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
      boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
      borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
      bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
      textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
      onClick={() => !question.multiSelection ? clickAnswer(answer.id, answer.text) : answer.answerHasCallToAction ? false :  toggleAnswer(answer.id, answer.text)}
      href={answer.answerHasCallToAction ? answer.answerCallToActionURL : undefined} 
      target="_blank" // Open the URL in a new tab
      rel="noopener noreferrer" // Recommended for security reasons
      height={'100%'}
      width={'150px'}
      p={0} // Remove padding to make image cover the whole button area
      >
      <Flex
        borderColor={!selectedAnswers.some((e) => e.answerId === answer.id) ? !!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? 'white') : undefined}
        direction="column" // stack child components vertically
        align="center" // center-align child components
        justify="flex-start" // align child components to the start
        height="100%"
        width={'100%'}
      >
        <MotionImage 
          src={`${baseUrl}${answer.image}`} 
          boxSize="100%" 
          objectFit="cover"
          flexShrink={0} // Prevent the image from shrinking
          flexGrow={1} // Allow the image to grow
          height={'100px'}
          />
        <Flex 
          backgroundColor={selectedAnswers.some((e) => e.answerId === answer.id) ? "white" : !!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)}
          p={1}
          alignItems="center"
          justifyContent="center"
          height={'40px'}
          w={'100%'}
        >
          <Text 
            fontSize='sm' 
            color={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
            textAlign="center" // Center align text
          >
            {answer.text}
          </Text>
        </Flex>
      </Flex>
      </ChakraButton>
      </MotionBox>)
      }
   </React.Fragment>
   </WrapItem>
    ))
  }
  </Wrap>
     {question?.answers.map(answer => (
         <React.Fragment key={answer.id}>
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
    </React.Fragment>
    ))}
    </HStack>  
    </Flex>
</ChakraBox>
</ChakraBox>

<Flex alignItems="center" justifyContent="center" my={2.5}>
      <ChakraBox height="1px" width="97%" backgroundColor="gray.300" />
</Flex>
      {chatGPTs.length === 0 && (
      <ChakraBox h={popup?.popupCTAPercentage  ?? undefined} mx={1} display="flex"   overflowX="auto"  overflowY={'hidden'}
       maxWidth={'450px'}>
              {popupAdditionals?.map((suggestion, idx) => (
                <MotionButton
                key={`${suggestion.popupAdditionalId }--${idx}`} 
                size={"xs"}
                my={2}
                ml={1}
                minW="auto" 
                px={2}
                onClick={() => handleButtonSubmit(suggestion.popupAdditionalChatText)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                color={popup?.popupSuggestionButtonTextColor ?? 'teal'}
                backgroundColor={popup?.popupSuggestionButtonBoxColor ?? 'teal'}
                borderColor={popup?.popupSuggestionButtonFocusBorderColor ?? undefined}
                _hover={{bgColor: undefined}}
                >
                 <Text>
                {suggestion.popupAdditionalText}
                </Text>
                </MotionButton>
              ))}
      </ChakraBox>
      )}


        <ChakraBox h={popup?.popupChatSendPercentage ?? undefined} >
        <Flex>
          <ChakraBox width="100%">
            <Input
              type="text"
              value={inputChatGPT}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleChatGPTSubmit(question?.id ?? 1);
                }
              }}
              placeholder={popup?.popupChatButtonText ?? "Enter text here"}
              borderRadius="md"
              bgColor={popup?.popupChatButtonBoxColor ?? undefined}
              textColor={popup?.popupChatButtonTextColor ?? undefined}
              _placeholder={{ color: popup?.popupChatButtonTextColor ?? undefined }}
              p={2}
              m={2}
            />
          </ChakraBox>
          <ChakraBox>
            <MotionButton 
            onClick={()=>handleChatGPTSubmit(question?.id ?? 1)} 
            colorScheme={popup?.popupSendButtonScheme ?? undefined} 
            bgColor={popup?.popupSendButtonColor ?? undefined} 
            borderColor={popup?.popupSendButtonBorderColor ?? undefined}
            borderWidth={'thin'}
            m={2} 
            ml={3} 
            textColor={popup?.popupSendButtonTextColor ?? undefined} 
            variant = {popup?.popupSendButtonVariant ?? undefined} 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.94 }}
            >
            {popup?.popupSendButtonText ?? 'Send'}
            </MotionButton>
          </ChakraBox>
        </Flex>
        </ChakraBox>
    </ChakraBox>
    )
}