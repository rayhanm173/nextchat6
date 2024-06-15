import { useSession } from "next-auth/react"
import Image from "next/image"
import './message.css'
import moment from "moment";

export default function Message({message}) {

    let dateObj = new Date(message.createdAt.seconds * 1000);
    const{data: session}= useSession()
    
   return (
    <div className={message.uid==session.user.id?"eighty me mescontainer":"eighty else mescontainer"}>
       
        <div className="timewrapper">
       
           <div className="flexme">
            <div>
                <Image src={message.avatar} alt="image" width={45} height={45} className="profilepic"/>
            </div>
            <div className="textwrapper">
                <div className="boldme bot6">{message.name}</div>
                <p className="wrapme">{message.text}</p>
                {message.img && <div><Image src={message.img} alt="image" width={200} height={400} className="msgimg"/></div>}
                {message.voice && <div><audio controls src={message.voice} className="voicechat"/></div>}
            </div>
            </div>
            <div className="elapsedtime">
                <p className="ago">{moment(dateObj).fromNow()}</p>
            </div>
       </div>
       </div>
       
   )
}
