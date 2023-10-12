import { useEffect, useRef, useState, useMemo, useCallback, useReducer } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex,  Spacer, Img, Text, Button, useBreakpointValue} from "@chakra-ui/react";
import { baseUrl} from './shared'
import { Props, ChatGPT, PopupEngagement, PopupAdditional , Popup, Question, selectedAnswersType, PopupPage } from './Types'
import { useForm } from 'react-hook-form';
import {ChatComponent} from './ChatComponent'
import { QuestionaireInChat } from './QuestionaireInChat';
import { ReducerState, initialState, ReducerDispatchAction, theStateReducer } from './Reducer'

type FieldValues = {
  questionId: {
  [key: string]: string;
  };
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

function ConvertPopup({ userId, popupId }: Props) {
  


  const showPopupButton = document.getElementById('showPopupButton');

  const { control, watch, reset } = useForm<FieldValues>();

  const csrfToken = getCookie('csrftoken');
  const headers = useMemo(() => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (csrfToken) {
      headers.append('X-CSRFToken', csrfToken);
    }
    return headers;
  }, [csrfToken]);

  const [ theReducerState, setTheReducerState] = useReducer(theStateReducer, initialState)
  const {
    popupEngagement,
    popupAdditionals,
    popup,
    error,
    chatGPTs,
    inputChatGPT,
    pastChatGPTInput,
    question,
    selectedAnswers,
    popupCreationState,
    questionStartTime,
  } = theReducerState;
  const [ pastChatGPTOutput, setPastChatGPTOutput] = useState<string[]>([question?.text ?? ''])
    
  showPopupButton?.addEventListener('click', function() {
    setTheReducerState({ type: 'setPopupCreationState', payload: true });
    setTheReducerState({ type: 'setQuestionStartTime', payload: Date.now() });
  });

  window.addEventListener('beforeunload', async (event: BeforeUnloadEvent) => {
    event.preventDefault(); // Prompt the user with a confirmation dialog

    if (popupEngagement?.id !== null && popupEngagement?.id !== undefined) {
        try {
            fetch(`${baseUrl}/popup/updatePopupEngagementEnd/${popupEngagement?.id}`, {
                method: 'POST',
                headers: headers,
            });
        } catch (error) {
            console.error('Error updating popup engagement end:', error);
        }
    }
  });

  const fetchPopup = async () => {
    try {
      const response = await fetch(`${baseUrl}/popup/${popupId}/${userId}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ conversationStartedAtWebsiteLink: window.location.href }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setTheReducerState({type: 'setPopupEngagement', payload: data.customer})
      setTheReducerState({type: 'setPopup', payload: data.popup})
      setTheReducerState({ type: 'setQuestionStartTime', payload: Date.now() });
      setTheReducerState({ type: 'setQuestion', payload: data.question })
      setPastChatGPTOutput([data.question.text])
      setTheReducerState({type: 'setChatGPTs', payload: [{id: 0, inputChatGPT: '', outputChatGPT: data.question.text, requestId: 0}]})
      setTheReducerState({type: 'setError', payload: undefined})
    } catch (error) {
    setTheReducerState({type: 'setError', payload: error})
    }
  };


  const fetchPopupPages = async () => {
    try {
      const responsePopupPages = await fetch(`${baseUrl}/api/popupPages/${popupId}/`);
      const data = await responsePopupPages.json();

      const regexPattern = data.popupPages.map((page: PopupPage) => {
        const escapedPage = page.showOnWebsite.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        if (escapedPage.endsWith('/\\*')) {
          // If showOnWebsite ends with '/*', match the entire domain and all subpages
          return `(${escapedPage.replace(/\/\*$/, '(/.*)?')})`;
        } else {
          // Otherwise, match only the exact URL
          return `^${escapedPage}$`; // Add '^' and '$' for exact matching
        }
      }).join('|');
      
      const regex = new RegExp(`(${regexPattern})`);
      const currentURL = window.location.href;
      const regexResult = data.popupPages.some((page: PopupPage) => regex.test(currentURL))

      if (regexResult){
        fetchPopup()
      }

    } catch (error) {
      // Handle errors here
      console.error('Error fetching Popup Pages:', error);
    }
  };


  useEffect(() => {
    fetchPopupPages()
  }, []);

    const chatGPTInput = async (inputChatGPT: string, question_id?: number) => {
      console.log('triggered')
      try {
        const response = await fetch(`${baseUrl}/popup/postchatgpt/${userId}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ inputChatGPT: inputChatGPT, next_question_id: question_id }),
        });
        if (!response.ok) {
          throw new Error('Something went wrong, try again later');
        }
        const data = await response.json();
        if (data.chatgpt.length > 0) {
          
          setTheReducerState({type: 'setChatGPTs', payload: data.chatgpt})
          const output = data.chatgpt.map((e: any) => e.outputChatGPT)
          //setPastChatGPTOutput((oldState) => [...oldState, ...output])

        } 
        setTheReducerState({type: 'setError', payload: undefined})
      } catch (error) {
      setTheReducerState({type: 'setError', payload: error})
      setTheReducerState({type: 'setChatGPTs', payload: []})
      }
  };

    const submitAnswer = async () => {
      const questionInputFormWatch = watch('questionId');
      const combinedList = [
        ...theReducerState.selectedAnswers,
        ...(questionInputFormWatch
          ? Object.entries(questionInputFormWatch).map(([answerId, text]) => text !=='' ? ({
              answerId: parseInt(answerId),
              customTextInput: text ?? '',
            }) : null) 
          : []),
      ];
      postAnswer(combinedList)
      }

        const AnswerQuestionForChatGPTInput = (combinedList: any, next_question_id?: number) => {
        const and = popup?.popupWordForAnd

        const stringValue: string =  combinedList.map((e: any) => e?.customTextInput).filter((e: any)=> e !== '').join(` ${and} `) 

        setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput,...[stringValue]]})
        chatGPTInput(stringValue, next_question_id);
        //fetchChatGPTs();
        };


      const postAnswer = async (combinedList: any) => {
          if (questionStartTime) {
            console.log('hello2')
            const answerTime = (Date.now() - questionStartTime) / 1000; // Calculate the time taken
            try {
              const response = await fetch(`${baseUrl}/answer/${question?.id}/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                  answer: combinedList,
                  popup_engagement: popupEngagement?.popupEngagementUniqueIdentifier,
                  answerTime: answerTime,
                }),
              });
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              const data = await response.json();
              AnswerQuestionForChatGPTInput(combinedList, data.id);
              if (data.id) {
              setTheReducerState({type: 'setQuestionStartTime', payload: Date.now()})
              setTheReducerState({type: 'setQuestion', payload: data})
              console.log(' data.text', data.text)
              setPastChatGPTOutput((output) => [...output, data.text])
              
              } else {
              setTheReducerState({type: 'setQuestion', payload: null})
              setTheReducerState({type: 'setQuestionStartTime', payload: null})
              }
              setTheReducerState({type: 'setSelectedAnswers', payload: []})
              reset();
            } catch (error) {
              console.error('There has been a problem with your fetch operation:', error);
            }
          }
        };

  
  const toggleAnswer = (answerId: number, answerChatGPT: string) => {
      setTheReducerState({
      type: 'toggleAnswer',
      payload: { answerId: answerId, customTextInput: answerChatGPT },
      });
      return { answerId, text: answerChatGPT };
  };

    
  const clickAnswer = (answerId: number, answerChatGPT: string) => {

    console.log('hello')

      const isSelected = selectedAnswers.some((e) => e.answerId === answerId);
      const updatedAnswers = isSelected
      ? selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== answerId)
      : [...selectedAnswers, { answerId, customTextInput: answerChatGPT }];
      
      postAnswer(updatedAnswers);
      
      
      setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, answerChatGPT]})
    
      return updatedAnswers;
  };

  // useEffect(() => {
  //     fetchChatGPTs();
  // }, [userId,pastChatGPTInput]);

  console.log('chat', chatGPTs, pastChatGPTOutput)

    
  const handleChatGPTSubmit = (questionId: number) => {
      if (inputChatGPT !== null) {
        const saySomethingImGivingUpOnYou = inputChatGPT
        setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, saySomethingImGivingUpOnYou]})
        chatGPTInput(saySomethingImGivingUpOnYou, questionId);
        //fetchChatGPTs();
        setTheReducerState({type: 'setInputChatGPT', payload: ''})
      }
  };


    const handleButtonSubmit = (ButtonInput: string) => {
      setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, ButtonInput]})

      chatGPTInput(ButtonInput);
      //fetchChatGPTs();
      setTheReducerState({type: 'setInputChatGPT', payload: ''})
    }
  
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const message = event.target.value;
      setTheReducerState({type: 'setInputChatGPT', payload: message})
    };

    useEffect(() => {
      if(popup?.activateOnScroll){
      const handleScroll = () => {
        // Add your logic to determine when to show the popup after scrolling
        if (!popupCreationState && window.scrollY > 500) {
          setTheReducerState({ type: 'setPopupCreationState', payload: true });
          setTheReducerState({ type: 'setQuestionStartTime', payload: Date.now() });
        }
      };
    
      window.addEventListener('scroll', handleScroll);
    
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
    }, [popupCreationState, popup?.activateOnScroll]);


    useEffect(() => {
    if (popup?.activateOnInactivity){
    let inactivityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        // Add your logic to show the popup after inactivity
        if (!popupCreationState) {
          setTheReducerState({ type: 'setPopupCreationState', payload: true });
          setTheReducerState({ type: 'setQuestionStartTime', payload: Date.now() });
        }
      }, 10000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearTimeout(inactivityTimeout);
    };
  }
  }, [popupCreationState, popup?.activateOnInactivity]);


useEffect(() => {
  if(popup?.activateOnExit){
  
  const handleMouseOut = (event: MouseEvent) => {
    if (event.clientY <= 0 && !popupCreationState) {
      setTheReducerState({type: 'setPopupCreationState', payload: true})

      setTheReducerState({type: 'setQuestionStartTime', payload: Date.now()})
    }
  };

  window.addEventListener('mouseout', handleMouseOut);

  return () => {
    window.removeEventListener('mouseout', handleMouseOut);
  };
}
}, [popupCreationState, popup?.activateOnExit]);




const top = useBreakpointValue({ base: '57%', sm: '57%', md: '57%', lg: '62%', xl: '62%', '2xl': '62%' });
const right = useBreakpointValue({ base: '-22%', sm: '-20%', md: '-18%', lg: '-16%', xl: '-14%', '2xl': '-11%'});

return (
  <>

  { (!(theReducerState.popupCreationState) && popup?.popupOrChat == 'Chatbot' && popup?.status) && (
  <ChakraBox>
  <Button  
    position="fixed"
    borderRadius={'3xl'}
    boxShadow={'md'}
    bottom="2%"
    right="1%"
    p={5} 
    fontSize={'2xl'} 
    height={'70px'} 
    w={'200px'} 
    zIndex={'popover'}
    onClick={() => {
      setTheReducerState({type: 'setPopupCreationState', payload: true})
    }} 
    colorScheme={popup?.teaserColor ?? 'purple'}
  >
  {popup?.teaserText ?? ''}
  </Button>
  </ChakraBox>)
  }
  { (popupEngagement && popupCreationState && (popup?.status || popup?.alwaysDisplay)) && (
    <>   
    <Flex
      direction="row"
      w={popup?.popupWidth ?? [800, 550]}
      h={popup?.popupHeight ?? [500, 350]}
      bg={popup?.popupBackgroundColor ?? "white"}
      p={4}
      zIndex={'popover'}
      position="fixed"
      top={popup?.popupOrChat === "Chatbot" ? top : '50%'}
      right={popup?.popupOrChat === "Chatbot" ? right : undefined} 
      left={popup?.popupOrChat === "Popup" ? '50%' : undefined} 
      transform="translate(-50%, -50%)"
      border={popup?.popupBorderWidth ?? undefined}
      borderColor={popup?.popupBorderColor ?? undefined}
      borderRadius={popup?.popupBorderRadius ?? '0'}
      boxShadow={popup?.popupBorderBoxShadow ?? "dark-lg"} 
      bgGradient={popup?.popupBackgroundGradient ?? undefined}
    >
      <QuestionaireInChat         
      {...{
            popupEngagement,
            popup,
            question,
            selectedAnswers,
            pastChatGPTInput,
            chatGPTs,
            pastChatGPTOutput,
            popupAdditionals,
            inputChatGPT,
            handleChatGPTSubmit,
            handleButtonSubmit,
            handleInputChange,
            control,
            clickAnswer,
            toggleAnswer,
            submitAnswer,
          }}
      />
      {!popup?.alwaysDisplay &&
      <ChakraButton
          onClick={() => setTheReducerState({type: 'setPopupCreationState', payload: false})}
          bg={popup?.popupCloseButtonBoxColor ?? undefined}
          color={popup?.popupCloseButtonTextColor ?? undefined}
          colorScheme={popup?.popupCloseButtonColorScheme ?? undefined}
          variant={popup?.popupCloseButtonVariant ?? undefined}
          position="absolute"
          top={-41}
          right={-41}
          m={1}
          p={1}
        >
          {popup?.popupCloseButtonText}
      </ChakraButton>
  }
    </Flex>
    </>)}
  </>
  );

}
  

export default ConvertPopup

