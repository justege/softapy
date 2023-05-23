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

function SoftapyWidget({ widget }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);

  //const { id } = useParams();
  const [customer, setCustomer] = useState<Customer>();
  const [tempCustomer, setTempCustomer] = useState();
  const [notFound, setNotFound] = useState<boolean>();
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState();
  const id = parseInt(widget.getAttribute('userId') ?? '1')
  

  useEffect(() => {
    const url = baseUrl + 'api/customer/' + id;
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Something went wrong, try again later');
            }

            return response.json();
        })
        .then((data) => {
            setCustomer(data.customer);
            setTempCustomer(data.customer);
            setError(undefined);
        })
        .catch((e) => {
            setError(e.message);
        });
}, []);

  return (
    <Box w={[1000, 700, 1500]} bg="green.400">
      <Heading>
      {customer ? customer.name : 'no customer' }
      </Heading>

    </Box>
  );
}

export default SoftapyWidget;
