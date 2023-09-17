import { useEffect, useRef, useState, useMemo, useCallback, useReducer } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex,  Spacer, Img, Text} from "@chakra-ui/react";
import { baseUrl} from './shared'
import { Props, ChatGPT, PopupEngagement, PopupAdditional , Popup, Question, selectedAnswersType} from './Types'
import { useForm } from 'react-hook-form';
import {Questionaire} from './Questionaire'
import {ChatComponent} from './ChatComponent'
import { PopupCustomizationPage } from './PopupComponent'
import { QuestionaireInChat } from './QuestionaireInChat';



type FieldValues = {
    questionId: {
      [key: string]: string;
    };
  }

type ReducerState = {
    popupEngagement?: PopupEngagement;
    popupAdditionals: PopupAdditional[];
    pastChatGPTOutput: string[];
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
    pastChatGPTOutput: [],
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
| { type: 'setPastChatGPTOutput'; payload?: string[]}
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
        case 'setPastChatGPTOutput': {
            return { ...state, pastChatGPTOutput: action.payload || [] };
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


function ConvertPopup({ id, popupId }: Props) {
    const [ theReducerState, setTheReducerState] = useReducer(theStateReducer, initialState)

    const { control, watch, reset } = useForm<FieldValues>();

    const {
        popupEngagement,
        popupAdditionals,
        pastChatGPTOutput,
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
    const mainComponents = [''] // TODO: change to dictionary 


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
          const response = await fetch(`/popup/createNewPopupEngagement/${popupId}/${id}`, {
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
          const response = await fetch(`/popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`, {
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

            setTheReducerState({type: 'setPastChatGPTOutput', payload: [...pastChatGPTInput, ...output]})
  
          } 
          setTheReducerState({type: 'setError', payload: undefined})
        } catch (error) {
        setTheReducerState({type: 'setError', payload: error})
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
          const response = await fetch(`/popup/${popupId}/${id}`);
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
            const response = await fetch(`/popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`);
            if (!response.ok) {
              throw new Error('Something went wrong, try again later');
            }
            const data = await response.json();
            setTheReducerState({type: 'setPopupAdditionals', payload: data.popupAdditional})
      
            if (data.chatgpt.length) {
            setTheReducerState({type: 'setChatGPTs', payload: data.chatgpt})

            setTheReducerState({type: 'setPastChatGPTOutput', payload: data.chatgpt.map((e: any)=> e.outputChatGPT)})
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
      }, [id,popupEngagement?.popupEngagementUniqueIdentifier]);
    
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
    }, [id,pastChatGPTInput]);

      
    const handleChatGPTSubmit = useCallback((questionId: number) => {
        if (inputChatGPT !== null) {
          const saySomethingImGivingUpOnYou = inputChatGPT
          setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, saySomethingImGivingUpOnYou]})
          chatGPTInput(saySomethingImGivingUpOnYou, questionId);
          fetchChatGPTs();
          setTheReducerState({type: 'setInputChatGPT', payload: ''})
        }
      }, [chatGPTInput, fetchChatGPTs]);


      const handleButtonSubmit = useCallback((ButtonInput: string) => {
        setTheReducerState({type: 'setPastChatGPTInput', payload: [...pastChatGPTInput, ButtonInput]})

        chatGPTInput(ButtonInput);
        fetchChatGPTs();
          setTheReducerState({type: 'setInputChatGPT', payload: ''})
      }, [chatGPTInput, fetchChatGPTs]);
    
      const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const message = event.target.value;
        setTheReducerState({type: 'setInputChatGPT', payload: message})
      };
    


  useEffect(() => {
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
        bgGradient={popup?.popupBackgroundGradient ?? undefined}
      >
      {mainComponents.includes('Questionaire') &&
      <>
      {question ? (<>
      <Questionaire 
          {...{
            popup,
            question,
            selectedAnswers,
            control,
            clickAnswer,
            toggleAnswer,
            submitAnswer,
          }}
        />
        </>
        )
      :
          <>
         <a href={popup?.popupImageUrl!} target="_blank" rel="noopener noreferrer">
          <Img
            border={popup?.popupImageBorderWidth ?? undefined}
            borderColor={popup?.popupImageBorderColor ?? undefined}
            width={popup?.popupImageWidth ?? undefined}
            height={popup?.popupImageHeight ?? undefined}
            src={`${baseUrl}${popup?.popupImage}`}
            alt="Popup Image"
          />
        </a>
          { popup?.popupHasLogo && 
          <Text h={'5%'} mt={1} align={'center'} fontSize={'sm'}>
          {'Made with ♥ by convertpopup.com'}
          </Text>
          } 
          </>
            }
      </>
    }
        
        {mainComponents.includes('ChatComponent') &&
        <ChakraBox w='45%'>
        <ChatComponent 
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
            }}
          /> 
          </ChakraBox>
        } 
        {mainComponents.includes('popupCustomization') && 
        <PopupCustomizationPage componentId={popupId} />
        }
    
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
            onClick={() => setTheReducerState({type: 'setPopupEngagement', payload: undefined})}
            bg={popup?.popupCloseButtonBoxColor ?? undefined}
            color={popup?.popupCloseButtonTextColor ?? undefined}
            colorScheme={popup?.popupCloseButtonColorScheme ?? undefined}
            variant={popup?.popupCloseButtonVariant ?? undefined}
            position="absolute"
            top={-47}
            right={-47}
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

