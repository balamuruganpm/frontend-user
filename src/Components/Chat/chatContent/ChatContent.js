import React, { useState, useEffect, useRef } from "react";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import "./chatContent.css";
import { IconButton } from "@mui/material";
import { IoAddOutline } from "react-icons/io5";
import { AiOutlineSend } from "react-icons/ai";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  fetchChatFail,
  fetchChatRequest,
  fetchChatSuccess,
  sendChatFail,
  sendChatRequest,
  sendChatSuccess,
} from "../../../slice/conversationSlice";
const ENDPOINT = process.env.REACT_APP_SOCKET_URL ;


function ChatContent() {
  const { user, token } = useSelector((state) => state.authState);
  const { id } = useParams();
  const splitId = id.split("+")[0].trim();
  const [allMessages, setAllMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef();
  const [astrologer, setAstrologer] = useState(null);
  const dispatch = useDispatch();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //initialising WebSocket
  useEffect(() => {
    const newSocket = new WebSocket(ENDPOINT);

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");

      const setupMessage = {
        type: "setup",
        userId: user?._id,
      };
      newSocket.send(JSON.stringify(setupMessage));
    };

    newSocket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?._id]);

  //get messages
  useEffect(() => {
    const getChatMessages = async () => {
      try {
        dispatch(fetchChatRequest()); // Dispatch action to indicate message fetching has started

        // Emit a WebSocket message to request chat messages
        socket.send(
          JSON.stringify({
            type: "get messages",
            room: splitId,
            userId: user?._id,
          })
        );
      } catch (error) {
        dispatch(fetchChatFail(error.message));
      }
    };

    const handleMessageEvent = (event) => {
      const messageData = JSON.parse(event.data);
      if (messageData.type === "messages") {
        console.log("messageData Get", messageData.payload);
        const messages = dispatch(fetchChatSuccess(messageData.messages));

        setAllMessages(messages.payload); // Dispatch action to update messages in the state
      } else if (messageData.type === "new message") {
        const messages = dispatch(
          fetchChatSuccess((prevMessage = []) => [...prevMessage, messageData])
        ); // Dispatch action with messageData as payload
        setAllMessages(messages.payload); // Update state with messages payload
      } else if (messageData.type === "error") {
        dispatch(fetchChatFail(messageData.message));
      }
    };

    if (socket) {
      socket.addEventListener("open", () => {
        console.log("WebSocket connection is open.");
        console.log("paramsId", splitId);
        getChatMessages(); // Call the function to fetch chat messages
      });

      socket.addEventListener("message", handleMessageEvent);

      socket.addEventListener("close", () => {
        console.log("WebSocket connection is closed.");
      });
    } else {
      console.error("WebSocket connection is not open.");
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.removeEventListener("message", handleMessageEvent);
      }
    };
  }, [dispatch, socket, splitId, user]);
  // send message function
  const sendMessage = async () => {
    try {
      dispatch(sendChatRequest()); // Dispatch action to indicate message sending has started

      // Emit a WebSocket message to send a new chat message
      socket.send(
        JSON.stringify({
          type: "new message",
          room: splitId,
          userId: user?._id,
          message: messageContent,
        })
      );

      // Listen for WebSocket messages containing chat messages
      socket.addEventListener("message", (event) => {
        const messageData = JSON.parse(event.data);
        if (messageData.type === "new message") {
          // Dispatch action to update messages in the state
          dispatch(sendChatSuccess(messageData));
        } else if (messageData.type === "error") {
          dispatch(sendChatFail(messageData?.message));
        }
      });
    } catch (error) {
      dispatch(sendChatFail(error.message));
    }
  };

  useEffect(() => {
    if (socket) {
      socket.addEventListener("open", () => {
        console.log("WebSocket connection is open.");
        console.log("paramsId", splitId);
        // No need to call any function here
      });

      socket.addEventListener("close", () => {
        console.log("WebSocket connection is closed.");
      });
    } else {
      console.error("WebSocket connection is not open.");
    }

    // Cleanup function
    return () => {
      // Remove event listeners or perform any cleanup if needed
    };
  }, [socket, splitId, user?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  //header part of selected astrologer
  useEffect(() => {
    const getAstrologer = async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_URL}/api/v1/astrologer/getAstrologer/${splitId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        let data = await response.json();
        // console.log("astrologer", data.astrologer);
        setAstrologer(data.astrologer);
        // setLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getAstrologer();
  }, [splitId]);

  return (
    <div className="main__chatcontent">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ ease: "anticipate", duration: "0.3" }}
        >
          <div className="current-chatting-user">
            <p className="con-icon">{astrologer?.displayname[0]}</p>
            <div className="header-text">
              <p className="con-title">{astrologer?.displayname}</p>

              <p className="con-timeStamp">online</p>
            </div>
            <IconButton style={{ background: "#F3F3F3" }} className="btn-nobg">
              End
            </IconButton>
          </div>
          {/* Your UI elements */}
          <div className="content__body">
            <div className="chat__items">
              {allMessages?.map((message, index) =>
                message.senderId === user._id ? (
                  <MessageSelf key={index} props={message} />
                ) : (
                  <MessageOthers
                    key={index}
                    props={message}
                    astrologer={astrologer}
                  />
                )
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="content__footer">
            <div className="sendNewMessage">
              <IconButton>
                <IoAddOutline />
              </IconButton>
              <input
                type="text"
                placeholder="Type a message here"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(event) => {
                  if (event.code === "Enter") {
                    sendMessage();
                    setMessageContent("");
                  }
                }}
              />
              <button
                onClick={() => {
                  sendMessage(splitId, user?._id, messageContent);
                  setMessageContent("");
                }}
                className="btnSendMsg"
                id="sendMsgBtn"
              >
                <AiOutlineSend />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ChatContent;
