import "../Stylesheets/sidebar.css";
import Logo from "../assests/logo green.png";
import {  BsChatLeftText } from "react-icons/bs";
import { RiHistoryFill } from "react-icons/ri";
import {MdArrowDropDown, MdOutlineCall } from "react-icons/md";
import { FiHelpCircle } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PiWalletBold } from "react-icons/pi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import facebook from "../assests/Facebook.svg";
import twitter from "../assests/Twitter.svg";
import insta from "../assests/Instagram.svg";
import youtube from "../assests/YouTube.svg";
import whatsapp from "../assests/WhatsApp.svg";
import { RiHomeLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { logout, userRecharge } from "../action/userAction";
import { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { getPackage } from "../action/packageAction";
import Tooltip from "react-bootstrap/Tooltip";

export function MyVerticallyCenteredModal(props) {
  const {user, token} = useSelector((state) => state.authState);
  const { singlePackage } = useSelector((state) => state.packageState);
  const [showPackages, setShowPackages] = useState(null);
  const [isLoading, setIsloading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      let response = await fetch(
        `${process.env.REACT_APP_URL}/api/v1/package/show`,
        {
          headers: {
            "Content-type": "multipart/form-data",
          },
          method: "GET",
        }
      );
      let data = await response.json();
      setIsloading(false);
      setShowPackages(data.packages);
    }
    fetchData();
  }, []);


  const postData = async () => {
    const userid = user?._id;
    dispatch(userRecharge(userid, { packages: singlePackage }));
  };

  return (
    <>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Packages{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Price</th>
                <th>Package Name</th>
                <th>Package Detail</th>
                <th>Select Package</th>
                <th>Button</th>
              </tr>
            </thead>
            {isLoading ? (
              <div className="loading">
                <Spinner
                  animation="grow"
                  variant="warning"
                  className="text-center"
                />
              </div>
            ) : (
              <tbody>
                {showPackages?.map((data, index) => (
                  <tr key={data?._id}>
                    <td>{index + 1}</td>
                    <td>{data?.fixedPrice}</td>
                    <td className="package_name">{data?.packageName}</td>
                    <td>{data?.packageDetail}</td>
                    <td className="check-box">
                      <input
                        type="checkbox"
                        onClick={() => dispatch(getPackage(data?._id))}
                      />
                    </td>
                    <td>
                      <Button
                        onClick={() => {
                          postData();
                          props.onHide();
                        }}
                        className="modal_btn"
                      >
                        Recharge
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide} className="modal_btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function UserRechargeDetailModal(props) {
  const { user } = useSelector((state) => state.authState);
  const [modalShow, setModalShow] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  return (
    <>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton id="pckg_header">
          <Modal.Title id="contained-modal-title-vcenter">
            Packages Details
          </Modal.Title>
          <Button
            onClick={() => {
              setModalShow(true);
              props.onHide();
            }}
            className="modal_btn"
          >
            New recharge
          </Button>
        </Modal.Header>
        {user?.packages == "" ? (
          <span className="alert-msg">You haven't recharged anything</span>
        ) : (
          <Modal.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Price</th>
                  <th>Package Name</th>
                  <th>Package Detail</th>
                  <th>Reacharge Date</th>
                </tr>
              </thead>
              {isLoading ? (
                <div className="loading">
                  <Spinner
                    animation="grow"
                    variant="warning"
                    className="text-center"
                  />
                </div>
              ) : (
                <tbody>
                  {user?.packages?.map((packageData, index) => (
                    <tr key={packageData?._id}>
                      <td>{index + 1}</td>
                      <td className="package_name">
                        {packageData?.packageName}
                      </td>
                      <td>{packageData?.packageDetail}</td>
                      <td>{packageData?.fixedPrice}</td>
                      <td>
                        {user?.rechargePrice?.find(
                          (recharge) =>
                            recharge.name === packageData.packageName
                        )?.date
                          ? new Date(
                              user?.rechargePrice?.find(
                                (recharge) =>
                                  recharge.name === packageData.packageName
                              )?.date
                            ).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              hour12: true,
                            })
                          : "No date found"}{" "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </Table>
          </Modal.Body>
        )}

        <Modal.Footer>
          <Button onClick={props.onHide} className="modal_btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </>
  );
}
export function Sidebar() {
  const { user} = useSelector((state) => state.authState);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userRechargeShow, setUserRechargeShow] = useState(false);

  function toggledropdown() {
    let content = document.querySelector(".drop-content");
    content.classList.toggle("toggle-content");
  }

  function closedropdown() {
    let content = document.querySelector(".drop-content");
    content.classList.remove("toggle-content");
  }

  function toggleHistory() {
    let historydrop = document.querySelector(".historydrop-container");
    historydrop.classList.toggle("open-history");
  }

  const logoutHandler = () => {
    dispatch(logout);
    navigate("/");
  };
const location =useLocation();
const currentpath = location.pathname;
const isActive = (path)=>currentpath === path
  return (
    <>
      <aside id="side">
        <div className="logoContainer">
          <img src={Logo} alt="logo" />
        </div>
        <div className="divider"></div>
        <section className="side-menu">
          <Link   className={`${isActive('/home') ? 'activeLink' : 'side-link'}`} to="/home">
            <RiHomeLine className="icon_size" />
            <span>Home</span>
          </Link>
          <Link  className={`${isActive('/chat') ? 'activeLink' : 'side-link'}`} 
           to="/chat">
            <BsChatLeftText className="icon_size" />
            <span>Chat </span>
          </Link>
          <Link className={`${isActive('/call') ? 'activeLink' : 'side-link'}`}  to="/call">
            <MdOutlineCall className="icon_size" />
            <span>Call</span>
          </Link>
          <button className="side-link" onClick={toggleHistory}>
            <RiHistoryFill className="icon_size" />
            History
            <MdArrowDropDown className="arr_drop" />
          </button>
          <div className="historydrop-container">
            <Link className={`${isActive('/chat_history') ? 'history_active' : 'history-link'}`}  to="/chat_history">
              <BsChatLeftText className="icon_size" />
              <span>Chat</span>
            </Link>
            <Link className={`${isActive('/call_history') ? 'history_active' : 'history-link'}`} to="/call_history" >
              <MdOutlineCall className="icon_size" />
              <span>Call</span>
            </Link>
          </div>

          {/* <Link className="side-link" to="/settings">
            <AiOutlineSetting className="icon_size" />
            <span>Settings</span>
          </Link> */}
          <Link className={`${isActive('/help') ? 'activeLink' : 'side-link'}`} to='/help'>
            <FiHelpCircle className="icon_size" />
            <span>Help</span>
          </Link>
        </section>
        <div className="divider"></div>
        <div className="astro_social_icon">
          <div className="media_icons">
            <img src={facebook} alt="" />
            <img src={twitter} alt="" />
            <img src={insta} alt="" />
            <img src={youtube} alt="" />
            <img src={whatsapp} alt="" />
          </div>
          <p>@ 2023 All Rights Received</p>
        </div>
      </aside>
      <main>
        <header id="head">
          <article>
            <h4>
              Hello{" "}
              <span style={{ color: "#229e48" }}>
                {user?.name ? user?.name : "User"}
              </span>
            </h4>
          </article>
          <div>
            {/* Earning */}
            <div className="earning">
              <Link to="/wallet" className="link">
                <PiWalletBold className="header_icon" />
              </Link>
              <span>₹{user?.packages ? user?.balance : "0"}</span>

              <Button
                onClick={() => setUserRechargeShow(true)}
                className="modal_btn"
              >
                Recharge
              </Button>
            </div>
            <IoMdNotificationsOutline className="header_icon" />

            {/* Profile */}
            <div className="profileDrop">
              <button className="dropbtn" onClick={toggledropdown}>
                <OverlayTrigger
                  placement="bottom"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip id="tooltip-disabled" className="tooltip_name">
                      {user?.name}
                    </Tooltip>
                  }
                >
                  <span
                    className="user-icon"
                    data-toggle="tooltip"
                    data-placement="bottom"
                    title="Tooltip on bottom"
                  >
                    {user && user.name ? user.name[0] : ""}
                  </span>
                </OverlayTrigger>
                <div style={{ marginTop: "5px" }}>
                  <RiArrowDropDownLine className="header_icon" />
                </div>
              </button>
              <div className="drop-content">
                <Link
                  to="/profile"
                  className="drop-link"
                  onClick={closedropdown}
                >
                  Your Profile
                </Link>
                <p className="drop-link" onClick={logoutHandler}>
                  {" "}
                  Logout{" "}
                </p>
              </div>
            </div>
            {/* 
            <MyVerticallyCenteredModal
              show={modalShow}
              onHide={() => setModalShow(false)}
            /> */}
            <UserRechargeDetailModal
              show={userRechargeShow}
              onHide={() => setUserRechargeShow(false)}
            />
          </div>
        </header>
      </main>
    </>
  );
}

