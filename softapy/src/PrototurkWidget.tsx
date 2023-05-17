

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Props {
  widget: HTMLElement;
}

function PrototurkWidget({ widget }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        setError("An error occurred while fetching data");
        console.error(error);
      });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!users.length) {
    return <>Widget yükleniyor..</>;
  }

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <h2>{user.name}</h2>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      ))}
    </div>
  );
}

export default PrototurkWidget;

