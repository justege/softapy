import { useEffect, useState, useRef } from 'react';
import { Box, Button, Flex, Heading, Input, Text, Spacer } from "@chakra-ui/react";
import { baseUrl} from './shared'

interface Props {
  widget: HTMLElement;
}

type ChatGPT = {
  id: number;
  requestId: number;
  inputChatGPT: string;
  outputChatGPT: string;
}

type PopupEngagement = {
  id: number;
  popupEngagementId: number;
  popupEngagementTitle: string;
  popupEngagementEnd: string;
  popupEngagementStart: string;
  popupEngagementUniqueIdentifier: string;
}

interface Popup {
  popupId: number;
  popupGoal: number | null;
  popupHeight: number | null;
  popupWidth: number | null;
  popupEmailSubscription: boolean | null;
  popupPromo: boolean | null;
  popupImage: string | null;
  popupBackgroundColor: string | null;
  popupBorderColor: string | null;
  popupBorderWidth: string | null;
  popupTitle: string | null;
  popupTitleHeight: number | null;
  popupTitleWidth: number | null;
  popupTitlePositioning: number | null;
  popupTitleTextColor: string | null;
  popupContent: string | null;
  popupContentHasBorder: boolean | null;
  popupContentHeight: number | null;
  popupContentWidth: number | null;
  popupContentPositioning: number | null;
  popupContentTextColor: string | null;
  popupChatHistoryPositioning: number | null;
  popupChatHistoryTextColor: string | null;
  popupChatHistoryTextSize: number | null;
  popupChatHistoryBoxColor: string | null;
  popupChatHistoryFocusBorderColor: string | null;
  popupChatButtonText: string | null;
  popupChatButtonPositioning: number | null;
  popupChatButtonTextColor: string | null;
  popupChatButtonTextSize: number | null;
  popupChatButtonBoxColor: string | null;
  popupChatButtonFocusBorderColor: string | null;
  popupSuggestionButtonPositioning: number | null;
  popupSuggestionButtonTextColor: string | null;
  popupSuggestionButtonTextSize: number | null;
  popupSuggestionButtonBoxColor: string | null;
  popupSuggestionButtonFocusBorderColor: string | null;
  popupCloseButtonText: string | null;
  popupCloseButtonPositioning: number | null;
  popupCloseButtonTextColor: string | null;
  popupCloseButtonTextSize: number | null;
  popupCTAButtonText: string | null;
  popupCTAButtonPositioning: number | null;
  popupCTAButtonTextColor: string | null;
  popupCTAButtonHeight: number | null;
  popupCTAButtonWidth: number | null;
  popupCTAButtonLink: string | null;
  popupCTAButtonBorderColor: string | null;
  popupCTAButtonHasBorder: boolean | null;
}



function SoftapyWidget({ widget }: Props) {
  const [popupEngagement, setPopupEngagement] = useState<PopupEngagement>()
  const [popup, setPopup] = useState<Popup>()
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [notFound, setNotFound] = useState<boolean>();
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<unknown>();
  const id = parseInt(widget.getAttribute('userId') ?? '1');
  const popupId = parseInt(widget.getAttribute('popupId') ?? '1');
  const [chatGPTs, setChatGPTs] = useState<ChatGPT[]>([]);
  const [inputChatGPT, setInputChatGPT] = useState('');
  const [pastChatGPTInput, setPastChatGPTInput] = useState<string[]>([]);

  
  // 1. Create new engagement popup  - Done
  // 2. Request the Id of the popup  - Done
  // 3. Request the initial popup title and content 
  // 4. Prepare for chatinput and send input 
  // 5. Get chatouput 

  const createNewPopupEngagement = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/createNewPopupEngagement/${id}`, {
        method: 'POST',
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
      const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupEngagement?.popupEngagementUniqueIdentifier}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputChatGPT }),
      });
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setError(undefined);
    } catch (error) {
      setError(error);
    }
  };

  const fetchPopup = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/${popupId}`);
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
    try {
      const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupEngagement?.popupEngagementUniqueIdentifier}`);
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setChatGPTs(data.chatgpt);
      setError(undefined);
    } catch (error) {
      setError(error);
    }
  };
  
  useEffect(() => {
    fetchPopup();
    fetchChatGPTs();
  }, [id,popupEngagement?.popupEngagementUniqueIdentifier,pastChatGPTInput]);

 

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value
    setInputChatGPT(message);

  };

  const handleSubmit = () => {
    chatGPTInput(inputChatGPT);
    fetchChatGPTs();
    setPastChatGPTInput((state) => [...state, inputChatGPT])
    setInputChatGPT('')
  };

  const [popupCreationState, setPopupCreationState] = useState(false);

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

  useEffect(()=>{
    if (popupCreationState){
      createNewPopupEngagement()
      console.log(popup)
    }
  },[popupCreationState])

  const flexContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flexContainerRef.current) {
      flexContainerRef.current.scrollTop = flexContainerRef.current.scrollHeight;
    }
  }, [popupEngagement, chatGPTs]);
  
  return (
    <>
{popupEngagement ?
  <Flex
    ref={flexContainerRef} // Add this line
    direction="row"
    w={popup?.popupWidth ?? [800,550]}
    h={popup?.popupHeight ?? [500,350]}
    bg={popup?.popupBackgroundColor ?? "white"}
    p={4}
    position="fixed"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)"
    border={popup?.popupBorderWidth ?? undefined}
    borderColor={popup?.popupBorderColor ?? undefined}
    borderRadius="md" // TODO: can be done better
    boxShadow="lg" // TODO: can be done better
    overflow="auto" // Add this line
  >

    <Box w={'50%'}>
      Image.png
    </Box>


    <Spacer />


    <Box w={'50%'}>
      {popupEngagement?.popupEngagementUniqueIdentifier && (
        <Flex direction={'column'}>
          <Box>
            {/* -------------- popupTitle ----------------*/}
            {popup?.popupTitle ?
              <Box borderColor={'black'} p={2} mt={2} minHeight={popup?.popupTitleHeight ?? undefined} width={popup?.popupTitleWidth ?? undefined} >
                <Text fontSize="3xl" textAlign={'center'}>{popup?.popupTitle}</Text>
              </Box>
              : null}

            {/* -------------- popupContent --------------*/}
            {popup?.popupContent ?
              <Box borderColor={'black'} p={4} minHeight={popup?.popupContentHeight ?? undefined} width={popup?.popupContentWidth ?? undefined}>
                <Text fontSize="bold" textAlign={'center'}>{popup?.popupContent}</Text>
              </Box>
              : null}
          </Box>
        </Flex>
      )}

      {/* -------------- PopupChatHistory ----------------*/}
      {chatGPTs.length > 0 && pastChatGPTInput.length > 0 ?
        <Box p={2} m={1}>
          <Flex direction="column">
            {chatGPTs.map((chatGPT, index) => (
              <Box key={`${chatGPT.requestId}--${chatGPT.id}`} mt={1} p={4} borderRadius="md" boxShadow="md">
                <Text>{pastChatGPTInput[index]}</Text>
                <Text>{chatGPT.outputChatGPT}</Text>
              </Box>
            ))}
          </Flex>
        </Box>
        : null}

      <Flex>
        <Box width={'80%'}>
          <Input
            type="text"
            value={inputChatGPT}
            onChange={handleInputChange}
            placeholder={popup?.popupChatButtonText ?? "You can enter text here"}
            borderRadius="md"
            bgColor={popup?.popupChatButtonBoxColor ?? 'white'}
            focusBorderColor={popup?.popupChatButtonTextColor ?? 'white'}
            _placeholder={{ color: 'white' }}
            p={2}
            m={2}
          />
        </Box>
        <Box>
          <Button onClick={handleSubmit} colorScheme="blue" m={2} ml={3}>
            {'Send'}
          </Button>
        </Box>
      </Flex>
    </Box>
  </Flex>
  : null}
</>

  );
};

export default SoftapyWidget;
