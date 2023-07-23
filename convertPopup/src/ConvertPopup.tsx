import { useEffect, useState, useRef, useMemo } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex, Input, Text, Spacer, Img,  Stack, Image, useColorModeValue , VStack, Center, Textarea} from "@chakra-ui/react";
import { baseUrl} from './shared'
import { Props, ChatGPT, PopupEngagement, PopupAdditional, Popup, Answer, Question, selectedAnswersType} from './Types'
import { Controller, useForm } from 'react-hook-form';
import FormComponent from './FormComponent';
import { motion, useAnimation } from 'framer-motion';
import {Questionaire} from './Questionaire'

const MotionButton = motion(ChakraButton);
const MotionBox = motion(ChakraBox)


type FieldValues = {
  questionId: {
    [key: string]: string;
  };
}

function ConvertPopup({ id, popupId }: Props) {
  const [popupEngagement, setPopupEngagement] = useState<PopupEngagement>()
  const [popupAdditionals, setPopupAdditionals] = useState<PopupAdditional[]>([])
  const [pastChatGPTOutput, setPastChatGPTOutput] = useState<string[]>([])
  const [popup, setPopup] = useState<Popup>()
  const [error, setError] = useState<unknown>();
  const [chatGPTs, setChatGPTs] = useState<ChatGPT[]>([]);
  const [inputChatGPT, setInputChatGPT] = useState('');
  const [pastChatGPTInput, setPastChatGPTInput] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question  | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<selectedAnswersType>([]);  
  const [popupCreationState, setPopupCreationState] = useState(false);
  const [shouldCreatePopupEngagement, setShouldCreatePopupEngagement] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadingAnimation = useAnimation();

  useEffect(() => {
    const startLoadingAnimation = async () => {
      await loadingAnimation.start({
        opacity: [1, 0.6, 0.2, 1], // Opacity values for the loading animation
        transition: { duration: 1, repeat: Infinity }, // Duration and repeat options
      });
    };

    startLoadingAnimation();
  }, [loadingAnimation]);


  const createNewPopupEngagement = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/createNewPopupEngagement/${popupId}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationStartedAtWebsiteLink: window.location.href }),
      });
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setPopupEngagement(data.customer)
      setError(undefined);
    } catch (error) {
      setError(error);
    }
  };

  const chatGPTInput = async (inputChatGPT: string) => {
      try {
        const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputChatGPT: inputChatGPT }),
        });
        if (!response.ok) {
          throw new Error('Something went wrong, try again later');
        }
        const data = await response.json();
        if (data.chatgpt.length > 0) {
          setChatGPTs(data.chatgpt);
          const output = data.chatgpt.map((e: any) => e.outputChatGPT)
          setPastChatGPTOutput((oldState) => [...oldState, ...output]);

        } 
        setError(undefined);
      } catch (error) {
        setError(error);
      }
  };

  const fetchPopup = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/${popupId}/${id}`);
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setPopup(data.popup);

      setError(undefined);
    } catch (error) {
      setError(error);
    }
  };

  const fetchChatGPTs = async () => {
    if (popupEngagement?.popupEngagementUniqueIdentifier){
      try {
        const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`);
        if (!response.ok) {
          throw new Error('Something went wrong, try again later');
        }
        const data = await response.json();
        setPopupAdditionals(data.popupAdditional)
  
        if (data.chatgpt.length) {
          setChatGPTs(data.chatgpt);

          setPastChatGPTOutput(data.chatgpt.map((e: any)=> e.outputChatGPT))
        } 

        setError(undefined);
      } catch (error) {
        setError(error);
      }
    }
  };

  const { control, watch, reset } = useForm<FieldValues>();

  // Fetch the questionnaire on component mount
  useEffect(() => {
    fetch(`${baseUrl}/start/1/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setQuestion(data))
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }, []);

  const submitAnswer = async () => {

    const questionInputFormWatch = watch('questionId');
    const combinedList = [
      ...selectedAnswers,
      ...(questionInputFormWatch
        ? Object.entries(questionInputFormWatch).map(([answerId, text_for_chatgpt]) => text_for_chatgpt !=='' ? ({
            answerId: parseInt(answerId),
            customTextInput: text_for_chatgpt ?? '',
          }) : null) 
        : []),
    ];

    postAnswer(combinedList)
  }


  const postAnswer = async (combinedList: any) => {  // Adjust this function to post an array of answer IDs

    await fetch(`${baseUrl}answer/${question?.id}/`, {  
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({answer: combinedList, popup_engagement: popupEngagement?.popupEngagementUniqueIdentifier}),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((data) => {
        AnswerQuestionForChatGPTInput(combinedList)
        setQuestion(data);
        setSelectedAnswers([]);  // Reset the selected answers when a new question is fetched
        reset()
        
    })
    .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
    });
};

const toggleAnswer = (answerId: number, answerChatGPT: string) => {
  setSelectedAnswers((selectedAnswers) => {
    const isSelected = selectedAnswers.some((e) => e.answerId === answerId);

    return isSelected
     ? selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== answerId)
     : [...selectedAnswers, { answerId: answerId, customTextInput: answerChatGPT }];
  });

  return { answerId: answerId, text_for_chatgpt: answerChatGPT }
};

const clickAnswer = (answerId: number, answerChatGPT: string) => {

  let selectedAnswer;
  setSelectedAnswers((selectedAnswers) => {
    const isSelected = selectedAnswers.some((e) => e.answerId === answerId);

    selectedAnswer  = isSelected
    ? selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== answerId)
    : [...selectedAnswers, { answerId: answerId, customTextInput: answerChatGPT }]

    return selectedAnswer
  });

  postAnswer(selectedAnswer)
  
  setPastChatGPTInput([...pastChatGPTInput,...[answerChatGPT]])
  chatGPTInput(answerChatGPT);

}

  useEffect(() => {
    if (popupEngagement?.popupEngagementUniqueIdentifier){
      fetchPopup();
      fetchChatGPTs();
    }
  }, [id,popupEngagement?.popupEngagementUniqueIdentifier]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value
    setInputChatGPT(message);
  };

  const AnswerQuestionForChatGPTInput = (combinedList: any) => {
    const and = popup?.popupWordForAnd
  
    const stringValue: string =  combinedList.map((e: any) => e?.customTextInput).filter((e: any)=> e !== '').join(` ${and} `) 
    setPastChatGPTInput([...pastChatGPTInput,...[stringValue]])
    chatGPTInput(stringValue);
    fetchChatGPTs();
  };

  
  useEffect(() => {
    fetchChatGPTs();
}, [id,pastChatGPTInput]);

  const handleChatGPTSubmit = () => {
    setPastChatGPTInput((state) => [...state, inputChatGPT])
    chatGPTInput(inputChatGPT);
    fetchChatGPTs();
    setInputChatGPT('')
  }

  const handleButtonSubmit = (ButtonInput: string) => {
    setPastChatGPTInput((state) => [...state, ButtonInput])
    chatGPTInput(ButtonInput);
    fetchChatGPTs();
    setInputChatGPT('')
  }

  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        setPopupCreationState(true);
        
      }
    };
    window.addEventListener('mouseout', handleMouseOut);
    return () => {
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(() => {
    const handleWindowLoad = () => {
      setShouldCreatePopupEngagement(true);
    };
    window.addEventListener('load', handleWindowLoad);
    return () => {
      window.removeEventListener('load', handleWindowLoad);
    };
  }, []);


  const flexContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollToBottom = () => {
    if (flexContainerRef.current) {
      const { scrollHeight, offsetHeight } = flexContainerRef.current;
      flexContainerRef.current.scrollTop = scrollHeight - offsetHeight;
    }
  };

  useEffect(()=>{
    if (shouldCreatePopupEngagement){
      createNewPopupEngagement()
    }
  },[shouldCreatePopupEngagement])

  useEffect(() => {
    handleScrollToBottom(); // Scroll to the bottom after chatGPTs update
  }, [pastChatGPTOutput]);

  const calculateHeight = useMemo(() => {
    if (popup?.popupChatHistoryPercentage && popup?.popupCTAPercentage && chatGPTs.length > 0) {
      return `${(parseInt(popup?.popupChatHistoryPercentage) + parseInt(popup?.popupCTAPercentage))}%`;
    }
    if (popup?.popupChatHistoryPercentage){
      return popup?.popupChatHistoryPercentage
    }
  }, [popup, chatGPTs]);

  return (
<>
{ (popupEngagement && popupCreationState) && (
  <>   
  <Flex
    direction="row"
    w={popup?.popupWidth ?? [800, 550]}
    h={popup?.popupHeight ?? [500, 350]}
    bg={popup?.popupBackgroundColor ?? "white"}
    p={4}
    position="fixed"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)"
    border={popup?.popupBorderWidth ?? undefined}
    borderColor={popup?.popupBorderColor ?? undefined}
    borderRadius={popup?.popupBorderRadius ?? '0'}
    boxShadow={popup?.popupBorderBoxShadow ?? "dark-lg"} 
  >
      <ChakraBox w="50%">
      <Questionaire 
        popup = {popup}
        question= {question}
        selectedAnswers = {selectedAnswers}
        control = {control}
        clickAnswer = {clickAnswer}
        toggleAnswer = {toggleAnswer}
        submitAnswer = {submitAnswer}
      />
      </ChakraBox>

    <Spacer />

    <ChakraBox w="50%">
      <ChakraButton
        onClick={() => setPopupEngagement(undefined)}
        bg={popup?.popupCloseButtonBoxColor ?? undefined}
        color={popup?.popupCloseButtonTextColor ?? undefined}
        colorScheme={popup?.popupCloseButtonVariantBoxColor ?? undefined}
        variant={popup?.popupCloseButtonVariant ?? undefined}
        position="absolute"
        top={0}
        right={0}
        m={1}
        p={1}
      >
        {popup?.popupCloseButtonText}
      </ChakraButton>

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
                <Text fontSize= {popup?.popupTitleFontSize ?? "3xl"} fontWeight= {popup?.popupTitleFontWeight ?? "bold"} textAlign="center">
                  {popup?.popupTitle}
                </Text>
              </ChakraBox>
            )}

            {popup?.popupContent && (
              <ChakraBox
                p={4}
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
        <ChakraBox ref={flexContainerRef} overflowY="scroll" h={calculateHeight}>
        <ChakraBox p={2} m={1}>
          <Flex direction="column">
            {(pastChatGPTInput.length>0 ? pastChatGPTInput : ['...']).map((input, index) => (
              <ChakraBox key={index}>
                <Flex justifyContent="flex-end">
                  <MotionBox
                    mt={1}
                    px={2}
                    py={1}
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
                      py={1}
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
                        content: '""',
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
                    { pastChatGPTInput.length >0 ?  
                      (pastChatGPTOutput[index]=== null?       
                      <MotionBox animate={loadingAnimation}>
                      <Text fontSize="lg" fontWeight="bold">
                        ...
                      </Text>
                      </MotionBox> 
                      : pastChatGPTOutput[index]) 
                      : popup?.popupExampleOutputChatGPT
                      }
                    </MotionBox>
                  </Flex>
              </ChakraBox>
            ))}
          </Flex>
        </ChakraBox>
      </ChakraBox>


      {chatGPTs.length === 0 && (
      <ChakraBox h={popup?.popupCTAPercentage  ?? undefined}>
            <ChakraBox mx={2}>
              {popupAdditionals?.map((suggestion, idx) => (
                <MotionButton
                  key={`${suggestion.popupAdditionalId }--${idx}`} 
                  size="xs"
                  mt={1}
                  ml={1}
                  onClick={() => handleButtonSubmit(suggestion.popupAdditionalText)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                >
                  {suggestion.popupAdditionalText}
                </MotionButton>
              ))}
            </ChakraBox>
      </ChakraBox>
      )}


        <ChakraBox h={popup?.popupChatSendPercentage ?? undefined}>
        <Flex>
          <ChakraBox width="80%">
            <Input
              type="text"
              value={inputChatGPT}
              onChange={handleInputChange}
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
            onClick={handleChatGPTSubmit} 
            colorScheme={popup?.popupSendButtonColorScheme ?? undefined} 
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
  </Flex>
  </>
)}

</>


  );
};


export default ConvertPopup;

