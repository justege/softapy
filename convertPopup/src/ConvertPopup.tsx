import { useEffect, useState } from 'react';
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
  const mainComponents = [''] // TODO: change to dictionary 


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

  const chatGPTInput = async (inputChatGPT: string, question_id?: number) => {
      try {
        const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}/${question_id ?? null}`, {
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
        const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}/${question?.id}`);
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
    fetch(`${baseUrl}/start/${popupId}/1/`)
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
        AnswerQuestionForChatGPTInput(combinedList, data.id)
        if(data.id){
          setQuestion(data);
        } else {
          setQuestion(null)
        }
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

}

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

  const handleChatGPTSubmit = (questionId: number) => {
    setPastChatGPTInput((state) => [...state, inputChatGPT])
    chatGPTInput(inputChatGPT, questionId);
    fetchChatGPTs();
    setInputChatGPT('')
  }

  const handleButtonSubmit = (ButtonInput: string) => {
    setPastChatGPTInput((state) => [...state, ButtonInput])
    chatGPTInput(ButtonInput);
    fetchChatGPTs();
    setInputChatGPT('')
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value
    setInputChatGPT(message);
  };

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

  useEffect(()=>{
    if (shouldCreatePopupEngagement){
      createNewPopupEngagement()
    }
  },[shouldCreatePopupEngagement])



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
        onClick={() => setPopupEngagement(undefined)}
        bg={popup?.popupCloseButtonBoxColor ?? undefined}
        color={popup?.popupCloseButtonTextColor ?? undefined}
        colorScheme={popup?.popupCloseButtonVariantBoxColor ?? undefined}
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

  
  </>
)}

</>


  );
};


export default ConvertPopup;

