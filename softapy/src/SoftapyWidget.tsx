import { useEffect, useState } from 'react';
import { Box, Heading, Text } from "@chakra-ui/react";
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

  const [customer, setCustomer] = useState<Customer>();
  const [tempCustomer, setTempCustomer] = useState<Customer>();
  const [notFound, setNotFound] = useState<boolean>();
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<unknown>();
  const id = parseInt(widget.getAttribute('userId') ?? '1');
  const [chatGPTs, setChatGPTs] = useState<ChatGPT[]>([]);
  


  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(baseUrl + 'api/customer/' + id);
        if (!response.ok) {
          throw new Error('Something went wrong, try again later');
        }
        const data = await response.json();
        setCustomer(data.customer);
        setTempCustomer(data.customer);
        setError(undefined);
      } catch (error) {
        setError(error);
      }
    };

    const fetchChatGPTs = async () => {
      try {
        const response = await fetch(baseUrl + 'clients/' + id + '/ABC12332' +'/chatgpt/');
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

    fetchCustomer();
    fetchChatGPTs();
  }, [id]);

  return (
    <Box w={[1000, 700, 1500]} bg="green.400">
      <Heading>{customer ? customer.name : 'no customer'}</Heading>
      
      {/* Display the chatGPTs */}
      {chatGPTs.map((chatGPT) => (
        <Box key={chatGPT.id}>
          <Text>{chatGPT.visitorInputChatGPT}</Text>
          <Text>{chatGPT.visitorOutputChatGPT}</Text>
          <Text>{chatGPT.clientInputChatGPT}</Text>
          <Text>{chatGPT.processedTitle}</Text>
          <Text>{chatGPT.processedContent}</Text>
        </Box>
      ))}
    </Box>
  );
}

export default SoftapyWidget;
