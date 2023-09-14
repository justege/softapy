import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex,  Spacer, Img, Text} from "@chakra-ui/react";
import { baseUrl} from './shared'
import { Props, ChatGPT, PopupEngagement, PopupAdditional, Popup, Question, selectedAnswersType} from './Types'
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

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}


function ConvertPopupOld({ id, popupId }: Props) {
  const [popupEngagement, setPopupEngagement] = useState<PopupEngagement>()
  const [popupAdditionals, setPopupAdditionals] = useState<PopupAdditional[]>([])
  const [pastChatGPTOutput, setPastChatGPTOutput] = useState<string[]>([])
  const [popup, setPopup] = useState<Popup>()
  const [error, setError] = useState<unknown>();
  const [chatGPTs, setChatGPTs] = useState<ChatGPT[]>([]);
  const inputChatGPT = useRef<HTMLInputElement>(null);
  const [pastChatGPTInput, setPastChatGPTInput] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question  | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<selectedAnswersType>([]);  
  const [popupCreationState, setPopupCreationState] = useState(false);
  const mainComponents = [''] // TODO: change to dictionary 
  const questionStartTime = useRef<number | null>(null)



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
      const response = await fetch(`/popup/createNewPopupEngagement/${popupId}/${id}`, {
        method: 'POST',
        headers: headers,
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
      const response = await fetch(`/popup/${popupId}/${id}`);
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
        const response = await fetch(`/popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`);
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
    if(popup?.questionnaire){
    fetch(`/start/${popupId}/${popup?.questionnaire}/`)
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
    }
  }, [popup?.questionnaire]);

  const submitAnswer = async () => {
  const questionInputFormWatch = watch('questionId');
  const combinedList = [
    ...selectedAnswers,
    ...(questionInputFormWatch
      ? Object.entries(questionInputFormWatch).map(([answerId, text]) => text !=='' ? ({
          answerId: parseInt(answerId),
          customTextInput: text ?? '',
        }) : null) 
      : []),
  ];
  postAnswer(combinedList)
  }

  console.log('questionStartTime.current', (Date.now() - questionStartTime.current!)/1000)

  
  const postAnswer = async (combinedList: any) => {
    if (questionStartTime) {
      const answerTime = (Date.now() - questionStartTime.current!) / 1000; // Calculate the time taken
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
          questionStartTime.current = Date.now();
          setQuestion(data);
        } else {
          questionStartTime.current = null;
          setQuestion(null);
        }
        setSelectedAnswers([]); // Reset the selected answers when a new question is fetched
        reset();
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    }
  };




const toggleAnswer = (answerId: number, answerChatGPT: string) => {
  setSelectedAnswers((selectedAnswers) => {
    const isSelected = selectedAnswers.some((e) => e.answerId === answerId);

    return isSelected
     ? selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== answerId)
     : [...selectedAnswers, { answerId: answerId, customTextInput: answerChatGPT }];
  });

  return { answerId: answerId, text: answerChatGPT }
};

const clickAnswer = (answerId: number, answerChatGPT: string) => {
  setSelectedAnswers((selectedAnswers) => {
    const isSelected = selectedAnswers.some((e) => e.answerId === answerId);

    const updatedAnswers = isSelected
      ? selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== answerId)
      : [...selectedAnswers, { answerId, customTextInput: answerChatGPT }];

    postAnswer(updatedAnswers);
    setPastChatGPTInput([...pastChatGPTInput, answerChatGPT]);

    return updatedAnswers;
  });
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
    setPastChatGPTInput([...pastChatGPTInput,...[stringValue]])
    chatGPTInput(stringValue, next_question_id);
    fetchChatGPTs();
  };

  
  useEffect(() => {
    fetchChatGPTs();
}, [id,pastChatGPTInput]);


  const handleChatGPTSubmit = useCallback((questionId: number) => {
    if (inputChatGPT.current !== null) {
      const saySomethingImGivingUpOnYou = inputChatGPT.current.value;
      setPastChatGPTInput((prev) => [...prev, saySomethingImGivingUpOnYou]);
      chatGPTInput(saySomethingImGivingUpOnYou, questionId);
      fetchChatGPTs();
      inputChatGPT.current.value = '';
    }
  }, [chatGPTInput, fetchChatGPTs]);

  const handleButtonSubmit = useCallback((ButtonInput: string) => {
    setPastChatGPTInput((prev) => [...prev, ButtonInput]);
    chatGPTInput(ButtonInput);
    fetchChatGPTs();
    inputChatGPT.current!.value = '';
  }, [chatGPTInput, fetchChatGPTs]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value;
    
    // Access the input element via the ref and update its value
    if (inputChatGPT.current) {
      inputChatGPT.current.value = message;
    }
  };


  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0 && !popupCreationState) {
          setPopupCreationState(true);
          questionStartTime.current = Date.now();

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

      </ChakraBox>
    } 
    {mainComponents.includes('popupCustomization') && 
    <PopupCustomizationPage componentId={popupId} />
    }

   
    <ChakraButton
        onClick={() => setPopupEngagement(undefined)}
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
};


export default ConvertPopupOld;

