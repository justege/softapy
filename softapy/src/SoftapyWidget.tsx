import { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
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

type Popup = {
  popupId : number;
  popupTitle: string;
  popupContent: string;
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
  const [popupCreationState, setPopupCreationState] = useState(false)
  
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
      console.log('popupData',data)
      setPopup(data.popup);
      setError(undefined);
    } catch (error) {
      setError(error);
      console.log('error',error)
    }
  };
  const fetchChatGPTs = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupEngagement?.popupEngagementUniqueIdentifier}`);
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      console.log('data',data)
      setChatGPTs(data.chatgpt);
      setError(undefined);
    } catch (error) {
      setError(error);
      console.log('error',error)
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


  return (
    <>
    <Button onClick={createNewPopupEngagement} mt={4} colorScheme="gray">
      Create Popup
    </Button>

    { popupEngagement ? <Box
    w={[800, 650, 540]}
    bg="rgba(0, 0, 0, 0.8)"
    p={4}
    position="fixed"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)"
    borderRadius="md"
    boxShadow="lg"
    color="white"
  >

{popupEngagement?.popupEngagementUniqueIdentifier && (
      <Box borderRadius="lg" p={4} mt={4} boxShadow="md">
        <Text fontWeight="bold">{popup?.popupTitle}</Text>
        <Text>{popup?.popupContent}</Text>
      </Box>
    )}
    <Box borderRadius="lg" p={4} mb={4} boxShadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        Chatbot
      </Text>
      <Flex direction="column">
        {chatGPTs.length > 0 && pastChatGPTInput.length > 0 ? (
          chatGPTs.map((chatGPT, index) => (
            <Box key={`${chatGPT.requestId}--${chatGPT.id}`} mt={2} p={2} borderWidth={1} borderRadius="md">
              <Text>{pastChatGPTInput[index]}</Text>
              <Text>{chatGPT.outputChatGPT}</Text>
            </Box>
          ))
        ) : (
          <Text>No chat history yet.</Text>
        )}
      </Flex>
    </Box>
    <Input
      type="text"
      value={inputChatGPT}
      onChange={handleInputChange}
      placeholder="Enter your message"
      borderRadius="md"
      mb={2}
    />
    <Button onClick={handleSubmit} mt={2} colorScheme="blue">
      Send
    </Button>
    </Box> : null}
    </>
    
  );
};

export default SoftapyWidget;
