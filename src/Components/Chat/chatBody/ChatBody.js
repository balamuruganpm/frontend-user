import React, { useEffect, useState } from "react";
import "./chatBody.css";
import Sidebar from "../SideBar/Sidebar";
import { Sidebar as AppSiderbar } from "../../../../src/Pages/Sidebar";
import ChatOffcanvas from "../offCanvas/ChatOffcanvas";
import OffCanvasNav from "../../../../src/Pages/OffCanvasNav";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import Welcome from "../chatPages/Welcome";
import ChatContent from "../chatContent/ChatContent";
import { useSelector, useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import { UserRechargeDetailModal } from "../../../../src/Pages/Sidebar";
import { getBalanceAfterChat } from "../../../action/userAction";
import {
  fetchChatFail,
  fetchChatRequest,
  fetchChatSuccess,
} from "../../../slice/conversationSlice";
const ENDPOINT = process.env.REACT_APP_SOCKET_URL;
function ChatBody() {
  const { user, token } = useSelector((state) => state.authState);
  const { id } = useParams();
  const splitId = id.split("+")[0].trim();
  const [socket, setSocket] = useState(null);
  const [recentMessage, setAllMessages] = useState([]);
  const [astrologer, setAstrologer] = useState(null);
  const [userRechargeShow, setUserRechargeShow] = useState(false);
  const [time, setTime] = useState("");
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);
  const [timeStoped, setTimeStoped] = useState(false);
  const [showChatTimingModal, setShowChatTimingModal] = useState(timeStoped);
  const userBal = user?.balance;
  const chatAmount = astrologer?.astrologer?.displaychat;
  const fivemins = 5 * chatAmount;
  const tenmins = 10 * chatAmount;
  const fifteenmins = 15 * chatAmount;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userID = user?._id;


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
        ); // Dispatch new Message what i have sent
        setAllMessages(messages.payload); // Dispatch action to update messages in the state
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

  // Show astrologer on side bar
  useEffect(() => {
    async function fetchData() {
      let response = await fetch(
        `${process.env.REACT_APP_URL}/api/v1/astrologer/getAstrologer/${id}`,
        {
          method: "GET",
        }
      );
      let data = await response.json();
      setAstrologer(data);
    }
    fetchData();
  }, []);

  function handleTime(time) {
    setTime(time);
  }
  const handleStopTimer = (stopTimerValue) => {
    setTimeStoped(stopTimerValue);
  };

  useEffect(() => {
    console.log("timed Stoped", timeStoped);
    setShowChatTimingModal(timeStoped);
    if (timeStoped) {
      alert("Chat Time Ended", navigate("/home"));
    }
  }, [timeStoped]);


  const date = new Date();
  const astrologerName = astrologer?.astrologer?.displayname;
  return (
    <>
      <div id="fixedbar">
        <AppSiderbar />
      </div>
      <div id="offcanvas">
        <OffCanvasNav />
      </div>
      <UserRechargeDetailModal
        show={userRechargeShow}
        onHide={() => setUserRechargeShow(false)}
      />
      <div>
        {userBal == 0 ? (
          <Modal show={show} onHide={handleClose}>
            <Modal.Body>
              <h2>Insufficient Balance</h2>
              <p>
                Your current balance is {userBal}. Please recharge to continue.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={()=>{ handleClose();navigate('/home')} }>
                Close
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setUserRechargeShow(true);
                  handleClose();
                }}
              >
                Recharge Now
              </Button>
            </Modal.Footer>
          </Modal>
        ) : (
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Chat Timing</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Amount Detail</th>
                    <th>Total Amount</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {userBal >= fivemins ? (
                    <tr>
                      <td
                        rowSpan={3}
                        style={{ verticalAlign: "middle", textAlign: "center" }}
                      >
                        chat: &#8377;{chatAmount}/min
                      </td>
                      <td>Amount: &#8377; {fivemins} </td>
                      <td>
                        <Button
                          variant="success"
                          onClick={(e) => {
                            e.preventDefault();
                            if (userBal >= fivemins) {
                              handleClose(fivemins);
                              handleTime(1);
                              dispatch(
                                getBalanceAfterChat(
                                  astrologerName,
                                  date,
                                  5,
                                  fivemins,
                                  userID,
                                  token
                                )
                              );
                            } else {
                              toast.error("Insufficient Balance");
                            }
                          }}
                        >
                          5 mins
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                  {userBal >= tenmins ? (
                    <tr>
                      <td>Amount: &#8377; {tenmins} </td>
                      <td>
                        <Button
                          variant="success"
                          onClick={() =>
                            userBal >= tenmins
                              ? (handleClose(tenmins),
                                handleTime(2),
                                dispatch(
                                  getBalanceAfterChat(
                                    astrologerName,
                                    date,
                                    10,
                                    tenmins,
                                    userID,
                                    token
                                  )
                                ))
                              : toast.error("Insufficiant Balance")
                          }
                        >
                          10 mins
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}

                  {userBal >= fifteenmins ? (
                    <tr>
                      <td>Amount: &#8377; {fifteenmins} </td>
                      <td>
                        <Button
                          variant="success"
                          onClick={() =>
                            userBal >= fifteenmins
                              ? (handleClose(fifteenmins),
                                handleTime(3),
                                dispatch(
                                  getBalanceAfterChat(
                                    astrologerName,
                                    date,
                                    15,
                                    fifteenmins,
                                    userID,
                                    token
                                  )
                                ))
                              : toast.error("Insufficiant Balance")
                          }
                        >
                          15 mins
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                </tbody>
              </Table>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
      
      <div className="main__chatbody">
 
        <Sidebar
          latestMsg={
            recentMessage?.length > 0
              ? recentMessage[recentMessage?.length - 1]?.message
              : " "
          }
          time={
            recentMessage?.length > 0
              ? recentMessage[recentMessage?.length - 1]?.createdAt
              : " "
          }
          astrologer={astrologer}
          timeStopped={handleStopTimer}
        />

        <ChatOffcanvas
          latestMsg={
            recentMessage?.length > 0
              ? recentMessage[recentMessage?.length - 1]?.message
              : " "
          }
          time={
            recentMessage?.length > 0
              ? recentMessage[recentMessage?.length - 1]?.createdAt
              : " "
          }
          astrologer={astrologer}
          setTime={time}
          timeStopped={handleStopTimer}
        />

        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="chat_content" element={<ChatContent setTime={time}  timeStopped={handleStopTimer} astrologer={astrologer} />} />
        </Routes>
      </div>
    </>
  );
}

export default ChatBody;
