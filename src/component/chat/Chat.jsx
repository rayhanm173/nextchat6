import './chat.css'
import ChatHistory from './chatHistory/ChatHistory'
import SendMessage from './sendMessage/SendMessage'

export default function Chat() {
   return (
       <div className="chat">
           <ChatHistory />
           <SendMessage />
       </div>
   )
}
