import { useEffect, useRef, useState, useMemo, useCallback, useReducer } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex,  Spacer, Img, Text, Button, useBreakpointValue} from "@chakra-ui/react";
import { baseUrl} from './shared'
import { Props, ChatGPT, PopupEngagement, PopupAdditional , Popup, Question, selectedAnswersType} from './Types'
import { useForm } from 'react-hook-form';
import {ChatComponent} from './ChatComponent'
import { QuestionaireInChat } from './QuestionaireInChat';




type FieldValues = {
    questionId: {
      [key: string]: string;
    };
  }

type ReducerState = {
    popupEngagement?: PopupEngagement;
    popupAdditionals: PopupAdditional[];
    popup?: Popup;
    error?: unknown;
    chatGPTs: ChatGPT[];
    inputChatGPT: string;
    pastChatGPTInput: string[];
    question: Question | null;
    selectedAnswers: selectedAnswersType;
    popupCreationState: boolean;
    questionStartTime: number | null;
}

const initialState: ReducerState = {
    popupEngagement: undefined,
    popupAdditionals: [],
    popup: undefined,
    error: undefined,
    chatGPTs: [],
    inputChatGPT: '',
    pastChatGPTInput: [],
    question: null,
    selectedAnswers: [],
    popupCreationState: false,
    questionStartTime: null,
}

type ReducerDispatchAction = 
| { type: 'setPopupEngagement'; payload?: PopupEngagement}
| { type: 'setPopupAdditionals'; payload: PopupAdditional[]}
| { type: 'setPopup'; payload?:Popup}
| { type: 'setError'; payload?:unknown}
| { type: 'setChatGPTs'; payload?:ChatGPT[]}
| { type: 'setInputChatGPT'; payload?:string}
| { type: 'setPastChatGPTInput'; payload?:string[]}
| { type: 'setQuestion'; payload:Question | null}
| { type: 'setSelectedAnswers'; payload?: selectedAnswersType}
| { type: 'toggleAnswer'; payload: { answerId: number; customTextInput: string }}
| { type: 'setPopupCreationState'; payload?:boolean}
| { type: 'setQuestionStartTime'; payload:number | null}





function theStateReducer(state: ReducerState, action: ReducerDispatchAction): ReducerState {

    switch(action.type) {
        case 'setPopupEngagement': {
            return { ...state, popupEngagement: action.payload };
        }
        case 'setPopupAdditionals': {
            return { ...state, popupAdditionals: action.payload };
        }
        case 'setPopup': {
            return { ...state, popup: action.payload };
        }
        case 'setError': {
            return { ...state, error: action.payload };
        }
        case 'setChatGPTs': {
            return { ...state, chatGPTs: action.payload || [] };
        }
        case 'setInputChatGPT': {
            return { ...state, inputChatGPT: action.payload || '' };
        }
        case 'setPastChatGPTInput': {
            return { ...state, pastChatGPTInput: action.payload || [] };
        }
        case 'setQuestion': {
            return { ...state, question: action.payload };
        }
        case 'setSelectedAnswers': {
            return {
                ...state,
                selectedAnswers: action.payload || []
            };
        }
        case 'toggleAnswer': {

            const isSelected = state.selectedAnswers.some((e) => e.answerId === action.payload.answerId);

            const answerId = action.payload.answerId ?? 0;
            const customTextInput = action.payload.customTextInput ?? ''



            return {
                ...state,
                selectedAnswers: isSelected
                    ? state.selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== action.payload.answerId)
                    : [...state.selectedAnswers, { answerId, customTextInput }],
            };
        }
        case 'setPopupCreationState': {
            return { ...state, popupCreationState: action.payload || false };
        }
        case 'setQuestionStartTime': {
            return { ...state, questionStartTime: action.payload };
        }
        default:
            return state;
    }
}

function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  }


function ConvertPopup({ userId, popupId }: Props) {
    const [ theReducerState, setTheReducerState] = useReducer(theStateReducer, initialState)
    const [ isPopupOpen, setIsPopupOpen ] = useState(false)
    const [ pastChatGPTOutput, setPastChatGPTOutput] = useState<string[]>([])

    const { control, watch, reset } = useForm<FieldValues>();

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

    const csrfToken = getCookie('csrftoken');


    const headers = useMemo(() => {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      if (csrfToken) {
        headers.append('X-CSRFToken', csrfToken);
      }
      return headers;
    }, [csrfToken]);
  
    window.addEventListener('beforeunload', async (event: BeforeUnloadEvent) => {
      event.preventDefault(); // Prompt the user with a confirmation dialog
  
      if (popupEngagement?.id !== null) {
          try {
              await fetch(`/popup/updatePopupEngagementEnd/${popupEngagement?.id}`, {
                  method: 'POST',
                  headers: headers,
              });
          } catch (error) {
              console.error('Error updating popup engagement end:', error);
          }
      }
    });

    const createNewPopupEngagement = async () => {
        try {
          const response = await fetch(`/popup/createNewPopupEngagement/${popupId}/${userId}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ conversationStartedAtWebsiteLink: window.location.href }),
          });
          if (!response.ok) {
            throw new Error('Something went wrong, try again later');
          }
          const data = await response.json();
          setTheReducerState({type: 'setPopupEngagement', payload: data.customer})
          setTheReducerState({type: 'setError', payload: undefined})
        } catch (error) {
        setTheReducerState({type: 'setError', payload: error})
        }
      };

      const chatGPTInput = async (inputChatGPT: string, question_id?: number) => {
        try {
          const response = await fetch(`/popup/chatgpt/${userId}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ inputChatGPT: inputChatGPT }),
          });
          if (!response.ok) {
            throw new Error('Something went wrong, try again later');
          }
          const data = await response.json();
          if (data.chatgpt.length > 0) {
            
            setTheReducerState({type: 'setChatGPTs', payload: data.chatgpt})
            const output = data.chatgpt.map((e: any) => e.outputChatGPT)
            setPastChatGPTOutput((oldState) => [...oldState, ...output])
  
          } 
          setTheReducerState({type: 'setError', payload: undefined})
        } catch (error) {
        setTheReducerState({type: 'setError', payload: error})
        setTheReducerState({type: 'setChatGPTs', payload: []})
        }
    };


    useEffect(() => {
        if(popup?.questionnaire){
        fetch(`/start/${popupId}/${popup?.questionnaire}/`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((data) => setTheReducerState({ type: 'setQuestion', payload: data }))
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
        }
      }, [popup?.questionnaire]);


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

  
        const postAnswer = async (combinedList: any) => {
            if (questionStartTime) {
              const answerTime = (Date.now() - questionStartTime) / 1000; // Calculate the time taken
              try {
                const response = await fetch(`/answer/${question?.id}/`, {
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


    const fetchPopup = async () => {
        try {
          const response = await fetch(`/popup/${popupId}/${userId}`);
          if (!response.ok) {
            throw new Error('Something went wrong, try again later');
          }
          const data = await response.json();
          setTheReducerState({type: 'setPopup', payload: data.popup})

    
          setTheReducerState({type: 'setError', payload: undefined})
        } catch (error) {
        setTheReducerState({type: 'setError', payload: error})
        }
      };


      const fetchChatGPTs = async () => {
        if (popupEngagement?.popupEngagementUniqueIdentifier){
          try {
            const response = await fetch(`/popup/chatgpt/${userId}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`);
            if (!response.ok) {
              throw new Error('Something went wrong, try again later');
            }
            const data = await response.json();
            setTheReducerState({type: 'setPopupAdditionals', payload: data.popupAdditional})
      
            if (data.chatgpt.length) {
            setTheReducerState({type: 'setChatGPTs', payload: data.chatgpt})

            const output =  data.chatgpt.map((e: any)=> e.outputChatGPT)

            setPastChatGPTOutput(output)
            } 
            setTheReducerState({type: 'setError', payload: undefined})
        } catch (error) {
        setTheReducerState({type: 'setError', payload: error})
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
    
    
    useEffect(() => {
        if (popupEngagement?.popupEngagementUniqueIdentifier){
          fetchPopup();
          fetchChatGPTs();
        }
      }, [userId,popupEngagement?.popupEngagementUniqueIdentifier]);
    
      const AnswerQuestionForChatGPTInput = (combinedList: any, next_question_id?: number) => {
        const and = popup?.popupWordForAnd
      
        const stringValue: string =  combinedList.map((e: any) => e?.customTextInput).filter((e: any)=> e !== '').join(` ${and} `) 


        setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput,...[stringValue]]})
        chatGPTInput(stringValue, next_question_id);
        fetchChatGPTs();
      };
    
      
    const clickAnswer = (answerId: number, answerChatGPT: string) => {

        setTheReducerState({
            type: 'toggleAnswer',
            payload: { answerId: answerId, customTextInput: answerChatGPT },
        });

        const isSelected = selectedAnswers.some((e) => e.answerId === answerId);


        const updatedAnswers = isSelected
        ? selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== answerId)
        : [...selectedAnswers, { answerId, customTextInput: answerChatGPT }];
      
        postAnswer(updatedAnswers);


        setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, answerChatGPT]})
      
        return updatedAnswers;
    };

    useEffect(() => {
        fetchChatGPTs();
    }, [userId,pastChatGPTInput]);

      
    const handleChatGPTSubmit = (questionId: number) => {
        if (inputChatGPT !== null) {
          const saySomethingImGivingUpOnYou = inputChatGPT
          setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, saySomethingImGivingUpOnYou]})
          chatGPTInput(saySomethingImGivingUpOnYou, questionId);
          fetchChatGPTs();
          setTheReducerState({type: 'setInputChatGPT', payload: ''})
        }
      };


      const handleButtonSubmit = (ButtonInput: string) => {
        setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, ButtonInput]})

        chatGPTInput(ButtonInput);
        fetchChatGPTs();
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
      }, [popupCreationState]);


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
    }, [popupCreationState]);


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
  }, [popupCreationState]);

  useEffect(() => {
    if(!popupCreationState){
    const handleWindowLoad = () => {
      createNewPopupEngagement()
    };
    window.addEventListener('load', handleWindowLoad);
    return () => {
      window.removeEventListener('load', handleWindowLoad);
    };
  }
  }, []);

  const top = useBreakpointValue({ base: '57%', sm: '57%', md: '57%', lg: '57%', xl: '57%', '2xl': '62%' });
  const right = useBreakpointValue({ base: '-22%', sm: '-20%', md: '-18%', lg: '-16%', xl: '-14%', '2xl': '-11%'});

  console.log('cha', chatGPTs, pastChatGPTInput, pastChatGPTOutput)

  return (
    <>

    { !theReducerState.popupCreationState && popup?.popupOrChat == 'Chatbot' && (<ChakraBox     
    >
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
      onClick={() => setTheReducerState({type: 'setPopupCreationState', payload: true})} 
      colorScheme={popup?.teaserColor ?? 'purple'}
    >
    {popup?.teaserText ?? ''}
    </Button>
    </ChakraBox>)
    }
    { (popupEngagement && popupCreationState) && (
      <>   
      <Flex
        direction="row"
        w={popup?.popupWidth ?? [800, 550]}
        h={popup?.popupHeight ?? [500, 350]}
        bg={popup?.popupBackgroundColor ?? "white"}
        p={4}
        position="fixed"
        top={popup?.popupOrChat === "Chatbot" ? top : '50%'}
        right={popup?.popupOrChat === "Chatbot" ? right : '50%'} 
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
      </Flex>
      </>)}
    </>
    );

 }
    

export default ConvertPopup

