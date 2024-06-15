import { useState, useRef, useEffect } from "react";
import "./sendmessage.css";
import EmojiPicker from "emoji-picker-react";
import {
  addDoc,
  average,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db, storage } from "@/lib/firebase";
import { upload } from "@/lib/upload";
import Image from "next/image";

export default function SendMessage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const emojiRef = useRef(null);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [voiceblob, setVoiceblob] = useState(null);
  const [noMic, setNomic] = useState(false);

  const [open, setOpen] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [startVoice, setStartVoice] = useState(false);
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const imgref = useRef(null);
  const voiceref = useRef(null);
  // fix
  if (noMic) {
    setTimeout(() => {
      setNomic(false);
    }, 1000);
  }

  document.addEventListener("mousedown", (e) => {
    if (emojiRef.current && open && !emojiRef.current.contains(e.target)) {
      setOpen(false);
    }
  });

  const handleVoice = () => {
    setStartVoice(!startVoice);
    console.log(startVoice);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedUrl(url);
        chunks.current = [];
        setVoiceblob(recordedBlob);
      };
      mediaRecorder.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // fix

      stopRecording();
      setNomic(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  if (startVoice) {
    console.log("start");
    startRecording();
  } else {
    console.log("stop");
    stopRecording();
  }

  const handleEmoji = (e) => {
    setMessage((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      console.log(e.target);
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    setImg({ file: null, url: "" });
    setRecordedUrl("");
    setMessage("");
    setVoiceblob(null);

    if (message === "" && img.file == null && recordedUrl == null) {
      console.log("return img and msg", img, message);
      return;
    }

    let imgUrl = null;
    let voiceUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
        console.log(imgUrl);
      }

      if (voiceblob) {
        console.log(voiceblob, "recorddd");
        voiceUrl = await upload(voiceblob);
      }

      await addDoc(collection(db, "messages"), {
        text: message,
        name: session.user.name,
        avatar: session.user.image,
        createdAt: new Date(),
        uid: session.user.id,
        ...(imgUrl && { img: imgUrl }),
        ...(voiceUrl && { voice: voiceUrl }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="sendmessage">
      {img.file && (
        <div className="preview">
          <div
            className="closebutton"
            onClick={() => {
              setImg({ file: null, url: "" });
              imgref.current.value = "";
            }}
          >
            x
          </div>
          {img.file && <Image src={img.url} style={{borderRadius:6}} width={innerWidth<1025?320:480} height={innerWidth<1025?180:270} />}
        </div>
      )}
      {startVoice && !noMic ? (
        <div className="flashtext">
          <span className="redcircle"></span> Recording..
        </div>
      ) : (
        ""
      )}
      {recordedUrl ? (
        <div className="recordwrapper">
          <audio controls src={recordedUrl} className="audiocontrol" />
          <div className="discarddiv">
            <button
              className="discardbtn"
              onClick={(e) => {
                setRecordedUrl("");
                setVoiceblob(null);

                console.log("discard");
              }}
            >
              Discard
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      <form onSubmit={(e) => handleSend(e)}>
        <div className="sendmsgwrapper">
          <div className="icons">
            <label htmlFor="file" className="m-auto">
              <img src="./img.png" className="imgicon" />
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => handleImg(e)}
              ref={imgref}
            />
            {/* <img src='./camera.png'/> */}
            <div
              id="file"
              className="voiceicon"
              style={{ backgroundColor: "transparent" }}
              onClick={(e) => {
                handleVoice(e);
              }}
            >
              {mediaRecorder.current &&
              mediaRecorder.current.state === "recording"
                ? stopsvg
                : noMic
                ? nomicsvg
                : micsvg}{" "}
            </div>
          </div>

          <label htmlFor="messageInput" hidden>
            Enter Message
          </label>
          <input
            id="messageInput"
            name="messageInput"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-input__input"
            placeholder="type message..."
          />
          <div className="emoji" ref={emojiRef}>
            <img
              src="./emoji.png"
              onClick={(e) => {
                setOpen((prev) => !prev);
              }}
            />
            <div className="picker">
              <EmojiPicker
                searchDisabled={true}
                open={open}
                onEmojiClick={handleEmoji}
                width={innerWidth > 1024 ? 350 : 250}
                height={innerWidth > 1024 ? 350 : 320}
              />
            </div>
          </div>
          <button className="sendButton">Send</button>
        </div>
      </form>
      <div></div>
    </div>
  );
}

const micsvg = (
  <svg
    width="15"
    height="19"
    viewBox="0 0 15 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.6875 0C3.83281 0 3.125 0.707813 3.125 1.5625V10.9375C3.125 11.7922 3.83281 12.5 4.6875 12.5H9.375C10.2297 12.5 10.9375 11.7922 10.9375 10.9375V1.5625C10.9375 0.707813 10.2297 0 9.375 0H4.6875ZM4.6875 1.5625H9.375V10.9375H4.6875V1.5625ZM0 7.8125V10.9375C0 13.5156 2.10938 15.625 4.6875 15.625H6.25V17.1875H3.125V18.75H10.9375V17.1875H7.8125V15.625H9.375C11.9531 15.625 14.0625 13.5156 14.0625 10.9375V7.8125H12.5V10.9375C12.5 12.6711 11.1086 14.0625 9.375 14.0625H4.6875C2.95391 14.0625 1.5625 12.6711 1.5625 10.9375V7.8125H0Z"
      fill="white"
    />
  </svg>
);

const nomicsvg = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.12422 0L0 1.12422L20.3125 21.4367L21.4359 20.3133L16.5289 15.4055C17.2797 14.575 17.75 13.4859 17.75 12.2805V9.15547H16.1875V12.2805C16.1875 13.0555 15.9039 13.7633 15.4305 14.307L14.332 13.2078C14.518 12.9516 14.625 12.6219 14.625 12.2805V2.90547C14.625 2.04453 13.9234 1.34297 13.0625 1.34297H8.375C7.51406 1.34297 6.8125 2.04453 6.8125 2.90547V5.68906L1.12422 0ZM8.375 2.90547H13.0625V11.9391L8.375 7.25156V2.90547ZM3.6875 9.15547V12.2805C3.6875 14.8656 5.78984 16.968 8.375 16.968H9.9375V18.5305H6.8125V20.093H14.625V18.5305H11.5V16.968H13.0625C13.2609 16.968 13.4562 16.9438 13.6484 16.9188L12.1344 15.4055H8.375C6.65078 15.4055 5.25 14.0047 5.25 12.2805V9.15547H3.6875ZM6.8125 10.0836V12.2805C6.8125 13.1414 7.51406 13.843 8.375 13.843H10.5727L9.01016 12.2805H8.375V11.6453L6.8125 10.0836Z"
      fill="#FF0000"
    />
  </svg>
);

const stopsvg = (
  <svg
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.75 1.5625V17.1875C18.75 17.6019 18.5854 17.9993 18.2924 18.2924C17.9993 18.5854 17.6019 18.75 17.1875 18.75H1.5625C1.1481 18.75 0.750671 18.5854 0.457646 18.2924C0.16462 17.9993 0 17.6019 0 17.1875V1.5625C0 1.1481 0.16462 0.750671 0.457646 0.457646C0.750671 0.16462 1.1481 0 1.5625 0H17.1875C17.6019 0 17.9993 0.16462 18.2924 0.457646C18.5854 0.750671 18.75 1.1481 18.75 1.5625Z"
      fill="#FF0000"
    />
  </svg>
);
