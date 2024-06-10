import { useState, useRef, useEffect } from 'react'
import './sendmessage.css'
import EmojiPicker from 'emoji-picker-react'
import {addDoc, average, collection, serverTimestamp} from 'firebase/firestore'
import { useSession } from 'next-auth/react'
import { db, storage } from '@/lib/firebase'
import { upload } from '@/lib/upload'
import Image from 'next/image'


export default function SendMessage() {

    const {data:session}= useSession()
    const [message, setMessage]= useState('')
    const emojiRef= useRef(null)
    const [img, setImg]=useState({
        file: null, 
        url: ''
       })
    const [voiceblob, setVoiceblob]= useState(null)


    const [open, setOpen]= useState(false)
    const [recordedUrl, setRecordedUrl] = useState('');
    const [startVoice, setStartVoice]= useState(false)
    const mediaStream = useRef(null);
    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
  

    document.addEventListener('mousedown',(e)=>{
      if(emojiRef.current &&open &&!emojiRef.current.contains(e.target)){
        setOpen(false)
      }
    })

    const handleVoice=()=>{
        setStartVoice(!startVoice)
        console.log(startVoice)
      }
      
      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(
            { audio: true }
          );
          mediaStream.current = stream;
          mediaRecorder.current = new MediaRecorder(stream);
          mediaRecorder.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.current.push(e.data);
            }
          };
          mediaRecorder.current.onstop = () => {
            const recordedBlob = new Blob(
              chunks.current, { type: 'audio/webm' }
            );
            const url = URL.createObjectURL(recordedBlob);
            setRecordedUrl(url);
            chunks.current = [];
            setVoiceblob(recordedBlob)
          };
          mediaRecorder.current.start();
        } catch (error) {
          console.error('Error accessing microphone:', error);
        }
      };
      
    
      
      const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
        }
        if (mediaStream.current) {
          mediaStream.current.getTracks().forEach((track) => {
            track.stop();
          });
        }
        
      };
    
      if(startVoice){
        console.log('start')
        startRecording()
      }else{
        console.log('stop')
        stopRecording()
      }
      
    const handleEmoji=(e)=>{
        setMessage(prev=> prev+e.emoji)
        setOpen(false)
   } 

   const handleImg=(e)=>{
    if(e.target.files[0]){
        console.log(e.target)
        setImg({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
        })
    }
   }
   
   const handleSend=async(e)=>{
    e.preventDefault()

    setImg({file: null, url: ''})
    setRecordedUrl('')
    setMessage('')
    setVoiceblob(null)

    if(message === '' &&img.file== null &&recordedUrl==null)
        {
            console.log('return img and msg', img, message)
            return
        }
        

    let imgUrl=null
    let voiceUrl= null
    try{
        if(img.file){
            imgUrl= await upload(img.file)
            console.log(imgUrl)
        }

        if(voiceblob){
            console.log(voiceblob, 'recorddd')
            voiceUrl= await upload(voiceblob)

        }

        
        await addDoc(collection(db, 'messages'),{
            text: message,
            name: session.user.name,
            avatar: session.user.image,
            createdAt: new Date(),
            uid: session.user.id,
            ...(imgUrl && {img: imgUrl}),
            ...(voiceUrl && {voice: voiceUrl} )
        })
        
       
    }catch(err){
        console.log(err)
    }

    
   }

   return (
       <div className="sendmessage">
        {img.file &&
        <div className='preview'>
          <div className='closebutton' onClick={()=>{setImg({file:null,url:''})}}>x</div>
          {img.file && <Image src={img.url} width={90} height={50}/>}
        </div>
      }
      {startVoice? <div className='flashtext'><span className='redcircle'></span> Recording..</div>:''}
                    {recordedUrl? <div className='recordwrapper'><audio controls src={recordedUrl} className='audiocontrol'/>
                                    <div className='discarddiv'>
                                    <button className='discardbtn' onClick={(e)=>{setRecordedUrl('')
                                                        setVoiceblob(null)
                                                        console.log('discard')
                                    }}>Discard</button>
                                    </div>
                                    </div>:''}
           <form onSubmit={(e)=>handleSend(e)}>
            <div className='sendmsgwrapper'>
                <div className='icons'>
                        <label htmlFor='file'>
                            <img src='./img.png' className='imgicon'/>
                        </label>
                            <input type='file' id='file' style={{display: 'none'}} onChange={handleImg}/>
                            {/* <img src='./camera.png'/> */}
                            <div id='file' className='voiceicon' style={{backgroundColor: 'transparent'}} onClick={(e)=>{handleVoice(e)}}><img src='./mic.png'/> </div> 
                </div>
                    
                <label htmlFor='messageInput' hidden>
                    Enter Message
                </label>
                <input id='messageInput' name='messageInput' type='text' value={message} onChange={(e)=> setMessage(e.target.value)} className='form-input__input' placeholder='type message...'/>
                <div className='emoji' ref={emojiRef}>
                        <img src='./emoji.png' onClick={(e)=>{setOpen(prev=>!prev)}}/>
                        <div className='picker'>
                            <EmojiPicker open={open} onEmojiClick={handleEmoji} width={innerWidth>1024?350:250} height={innerWidth>1024?350:320}/>
                        </div>
                    </div>
                        <button className='sendButton'>Send</button>
                </div>
           </form>
           <div>  

                    
                    
                    
                                    
            </div>
    </div>
)}