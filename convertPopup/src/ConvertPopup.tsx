import { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Button,  Flex, Input, Text, Spacer, Img,  Stack, Image, useColorModeValue , VStack, Center, Textarea} from "@chakra-ui/react";
import { baseUrl} from './shared'
import { Props, ChatGPT, PopupEngagement, PopupAdditional, Popup, Answer, Question} from './Types'
import { Controller, useForm } from 'react-hook-form';
import FormComponent from './FormComponent';



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
  const [selectedAnswers, setSelectedAnswers] = useState<{answerId: number, customTextInput: string}[]>([]);  
  const [questionInputState, setQuestionInputState] = useState<{answerId: number, answerInput: string}[]>([])
  const [popupCreationState, setPopupCreationState] = useState(false);
  const [shouldCreatePopupEngagement, setShouldCreatePopupEngagement] = useState(false);

  const handleTextAreaChange = (answerId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value
    setQuestionInputState((state) => {
      // find the index of the existing object
      const existingIndex = state.findIndex((item) => item.answerId === answerId);
      if (existingIndex >= 0) {
        // if the object exists, create a new array with the updated object
        const newState = [...state];
        newState[existingIndex].answerInput = message;
        return newState;
      } else {
        // if the object doesn't exist, add a new object to the array
        return [...state, { answerId: answerId, answerInput: message }];
      }
    })
  }

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

  const { control, handleSubmit, watch, reset } = useForm<FieldValues>();

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


  const postAnswer = async () => {  // Adjust this function to post an array of answer IDs


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
        AnswerQuestionForChatGPTInput()
        setQuestion(data);
        setSelectedAnswers([]);  // Reset the selected answers when a new question is fetched
        setQuestionInputState([])
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

  const AnswerQuestionForChatGPTInput = () => {
    const stringValue: string = selectedAnswers.map((e) => e.customTextInput).join(', ');
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

  useEffect(()=> {
    questionInputState.map((e)=> toggleAnswer(e.answerId, e.answerInput))
  },[])

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

  const calculateAnswerHeight = useMemo(() => {
    if (!popup?.popupImageHeight || !question?.answers.length) {
      return null;
    }
    
    return (popup.popupImageHeight ) / (question.answers.length + 1.2) - 10;
}, [popup, question?.answers]);

  const bgColor = useColorModeValue('white', 'white');
  
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
      <Box w="50%">
        <Box
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
          color={'black'} //TODO
          fontWeight= {"bold"} // TODO
          >
            {question?.text} 
          </Text>

      <VStack spacing={2} align="stretch" overflow='auto' height='90%'>
      
      {question?.answers.map((answer) => (
      <>
      {!answer.answerHasInputField &&
      (
      <Box 
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
      >
      <Button
      key={answer.id}
      as="a"
      variant="solid"
      borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
      boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
      borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
      bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
      textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
      onClick={() => answer.answerHasCallToAction ? undefined : toggleAnswer(answer.id, answer.text_for_chatgpt)}
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
        <Image 
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
      </Button>
      </Box>)
      }
      </>
      ))}
     {question?.answers.map(answer => (
          <>
          {answer.answerHasInputField &&
            <Box 
            borderWidth={2} 
            padding={!!answer.answerPadding ? answer.answerPadding : (popup?.answerPadding ?? undefined)} 
            borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
            boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
            borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
            bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
            textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
            margin = {!!answer.answerMargin ? answer.answerMargin : (popup?.answerMargin ?? undefined)}
            >
            <Text my={2} maxH={'40%'}>{answer.text}</Text>
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
           </Box>
        }
        </>
      ))}
    </VStack>    

    <Button position="absolute"  onClick={() => {
      postAnswer()
      }} colorScheme="teal" mt={5} bottom="14px" w='290px'>Submit</Button>
        </Box>

        {false && 
                <Img
                src={`${baseUrl}${popup?.popupImage}`}
              />
        }
    {popup?.popupHasLogo && 
    <Text h={'3%'} align={'center'}  fontSize={'xs'}>
    {'Powered with ♥ by convertpopup.com'}
    </Text>} 
    
    </Box>

    <Spacer />

    <Box w="50%">
      <Button
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
      </Button>

      {popupEngagement?.popupEngagementUniqueIdentifier && (
        <Flex
          direction="column"
          h={popup?.popupTitleAndContentPercentage ?? undefined }
          ml={popup?.popupTextMarginLeft ?? undefined}
          mr={popup?.popupTextMarginRight ?? undefined}
        >
          <Box>
            {popup?.popupTitle && (
              <Box
                p={2}
                mt={2}
                minHeight={popup?.popupTitleHeight ?? undefined}
                width={popup?.popupTitleWidth ?? undefined}
                textColor={popup?.popupTitleTextColor ?? undefined}
              >
                <Text fontSize= {popup?.popupTitleFontSize ?? "3xl"} fontWeight= {popup?.popupTitleFontWeight ?? "bold"} textAlign="center">
                  {popup?.popupTitle}
                </Text>
              </Box>
            )}

            {popup?.popupContent && (
              <Box
                p={4}
                minHeight={popup?.popupContentHeight ?? undefined}
                width={popup?.popupContentWidth ?? undefined}
                textColor={popup?.popupContentTextColor ?? undefined}
              >
                <Text fontSize= {popup?.popupContentFontSize ?? "sm"} fontWeight= {popup?.popupContentFontWeight ?? "bold"} >
                  {popup?.popupContent}
                  </Text>
              </Box>
            )}
          </Box>
        </Flex>
      )}
        <Box ref={flexContainerRef} overflowY="scroll" h={calculateHeight}>
        <Box p={2} m={1}>
          <Flex direction="column">
            {(pastChatGPTInput.length>0 ? pastChatGPTInput : ['']).map((input, index) => (
              <Box key={index}>
                <Flex justifyContent="flex-end">
                  <Box
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
                    { pastChatGPTInput.length >0 ? input : popup?.popupExampleInputChatGPT}
                  </Box>
                </Flex>
                  <Flex justifyContent="flex-start">
                    <Box
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
                      {pastChatGPTInput.length >0 ?  (pastChatGPTOutput[index]=== null? '...' : pastChatGPTOutput[index]) : popup?.popupExampleOutputChatGPT}
                    </Box>
                  </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>


      {chatGPTs.length === 0 && (
      <Box h={popup?.popupCTAPercentage  ?? undefined}>
            <Box mx={2}>
              {popupAdditionals?.map((suggestion, idx) => (
                <Button
                  key={`${suggestion.popupAdditionalId }--${idx}`} 
                  size="xs"
                  mt={1}
                  ml={1}
                  onClick={() => handleButtonSubmit(suggestion.popupAdditionalText)}
                >
                  {suggestion.popupAdditionalText}
                </Button>
              ))}
            </Box>
      </Box>
      )}


        <Box h={popup?.popupChatSendPercentage ?? undefined}>
        <Flex>
          <Box width="80%">
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
          </Box>
          <Box>
            <Button 
            onClick={handleChatGPTSubmit} 
            colorScheme={popup?.popupSendButtonColorScheme ?? undefined} 
            m={2} 
            ml={3} 
            textColor={popup?.popupSendButtonTextColor ?? undefined} 
            variant = {popup?.popupSendButtonVariant ?? undefined} 
            bgColor={popup?.popupSendButtonColor ?? undefined} >
            {popup?.popupSendButtonText ?? 'Send'}
            </Button>
          </Box>
        </Flex>
        </Box>
    </Box>
  </Flex>
  </>
)}

</>


  );
};


export default ConvertPopup;

