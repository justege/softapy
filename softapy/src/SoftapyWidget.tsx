import { useEffect, useState } from 'react';
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { baseUrl} from './shared'

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Props {
  widget: HTMLElement;
}

type Customer = {
  id: number;
  name: string;
  industry: string;
}

type ChatGPT = {
  id: number;
  visitorInputChatGPT: string;
  visitorOutputChatGPT: string;
  clientInputChatGPT: string;
  processedTitle: string;
  processedContent: string;
}


function SoftapyWidget({ widget }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [notFound, setNotFound] = useState<boolean>();
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<unknown>();
  const id = parseInt(widget.getAttribute('userId') ?? '2');
  const [chatGPTs, setChatGPTs] = useState<ChatGPT[]>([]);
  
  // 1. Create new engagement popup 
  // 2. Request the Id of the popup 
  // 3. Request the initial popup title and content 
  // 4. Prepare for chatinput and send input 
  // 5. Get chatouput 

  useEffect(() => {
    const fetchChatGPTs = async () => {
      try {
        const response = await fetch(baseUrl + 'clients/' + id + '/ABC12332/' +'chatgpt/');
        if (!response.ok) {
          throw new Error('Something went wrong, try again later');
        }
        const data = await response.json();
        console.log('data',data)
        setChatGPTs(data);
        setError(undefined);
      } catch (error) {
        setError(error);
        console.log('error',error)
      }
    };
    fetchChatGPTs();
  }, [id]);

  const createNewPopupEngagement = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/createNewPopupEngagement/${id}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      console.log('createNew', data);
      setError(undefined);
    } catch (error) {
      setError(error);
      console.log('error', error);
    }
  };
 

  return (
    <Box w={[1000, 700, 1500]} bg="green.400">
      <Button onClick = {() =>  createNewPopupEngagement()}>
      Button for popup creation
      </Button>
      {/* Display the chatGPT */}
      {chatGPTs.map((chatGPT) => (
        <Box key={chatGPT.id}>
          <Text>{chatGPT.visitorInputChatGPT}</Text>
        </Box>
      ))}
    </Box>
  );
}

export default SoftapyWidget;
