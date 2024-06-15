import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import './userinfo.css'


export default function UserInfo() {
    const {data:session}= useSession()
    
   return (
       <div className="userinfo">
            <div className="infowrapper">
              <div className="userinformation">
                <div>
                    <Image src={session.user.image} alt="image" width={45} height={45} className="userimg"/>
                </div>
                <div className="text-[20px] font-normal">{capitalizeFirstLetter(session?.user?.name)}</div>
              </div>
              <div className="flex align-middle flex-row justify-center">
              <button onClick={()=>signOut()}>Logout</button>
              </div>
            </div>
       </div>
   )
}

function capitalizeFirstLetter(string) {
const words = string.split(" ");

return words.map((word) => { 
    return word[0].toUpperCase() + word.substring(1); 
}).join(" ");
}
