import { useState } from "react"

function UserSelect({onConnect}) {
    const [username, setUsername] = useState("");
    return(
        <div>
            <input type="text" value={username} onChange={(e) => {setUsername(e.target.value)}}/>
            <button onClick={() => onConnect(username)}>Connect</button>
        </div>
    )
}

export default UserSelect;