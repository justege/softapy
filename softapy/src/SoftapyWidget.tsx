import { useEffect, useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Props {
  widget: HTMLElement;
}

type Customers = {
  id: number;
  name: string;
  industry: string;
}

function SoftapyWidget({ widget }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customers[]>()

  useEffect(()=> {
    fetch('http://localhost:8000/api/customers/')
    .then((response)=> response.json())
    .then((data) => {
      setCustomers(data.customers)
      console.log(data.customers)
    })
  },[])

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        setError("An error occurred while fetching data");
      });

    // Fetch website URL
    setWebsiteUrl(window.location.href);

  // Fetch cache keys
  if ("caches" in window) {
    caches.keys()
      .then((keyIterator) => Array.from(keyIterator))
      .then((keys) => {
        // Access the cache storage for each cache key
        keys.forEach((key) => {
          caches.open(key).then((cache) => {
            // Retrieve and use the cached responses from the cache storage
            cache.keys().then((cachedRequests) => {
              // Process the cached requests as needed
              cachedRequests.forEach((cachedRequest) => {
                console.log("Cache Key:", key);
                console.log("Cached Request:", cachedRequest.url);
                // Access other properties of the cached request if needed
              });
            });
          });
        });
      })
      .catch((error) => {
        console.error("Error retrieving cache keys:", error);
      });
  }

  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  console.log('customers',customers)

  return (
    <Box w={[1000, 700, 1500]} bg="green.400">
      <Heading>
      {customers ? customers.map((e)=> e.name) : 'hello'}
      </Heading>

    </Box>
  );
}

export default SoftapyWidget;
