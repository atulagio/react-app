import { useEffect, useState } from "react";

function Hello() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        
        async function getUsers(){

            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const users = await response.json();
            setUsers(users);
        }
        getUsers();

    },[]);
    return (
        <div>
            <h2>User List</h2>
            {users.map((user) => (
                <li key={user.id}>{user.name}</li>
            ))
            }
        </div>
    );
}

export default Hello;