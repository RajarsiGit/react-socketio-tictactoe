import React, { useRef, useEffect, useState } from "react";
import styles from "./Board.module.css";
import { Button, Container, Col, Row, Modal, Jumbotron, Form, Alert, InputGroup } from "react-bootstrap";
import io from "socket.io-client";
import { checkWinLoss } from "../../services/control";
import { generateKey } from "../../services/generateKey";

const socket = io("http://localhost:5000");
//const socket = io("https://react-socketio-tic-tac-toe.herokuapp.com/");
const Board: React.FC = () => {
// eslint-disable-next-line react-hooks/exhaustive-deps
  const btnMatrixRef = [[{ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}],
                      [{ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}],
                      [{ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}]];
  const btnRef = {
    btnRef1: useRef<HTMLButtonElement>(null),
    btnRef2: useRef<HTMLButtonElement>(null),
    btnRef3: useRef<HTMLButtonElement>(null),
    btnRef4: useRef<HTMLButtonElement>(null),
    btnRef5: useRef<HTMLButtonElement>(null),
    btnRef6: useRef<HTMLButtonElement>(null)
  }
  type detailsType = {
    me: string,
    you: string
  }
  type colourType = {
    me: string,
    you: string
  }
  type modalDetailsType = {
    show: boolean,
    message: string
  }
  const initDetails: detailsType = {
    me: "-",
    you: "-"
  };
  const initColour: colourType = {
    me: "#007bff",
    you: "#007bff"
  }
  const modalDetails: modalDetailsType = {
    show: false,
    message: ""
  }
  let c = 0;
  const [alert, setAlert] = useState(false);
  const [loginModal, setLoginModal] = useState(true);
  const [key, setKey] = useState("");
  const [copyButton, setCopyButton] = useState("outline-secondary");
  const [modal, setModal] = useState(modalDetails);
  const [details, setDetails] = useState(initDetails);
  const [symbol, setSymbol] = useState("-");
  const [colour, setColour] = useState(initColour);
  const [button, setButton] = useState([[symbol, symbol, symbol], [symbol, symbol, symbol], [symbol, symbol, symbol]]);
  const changeState = (r: number, c: number, s: string) => {
    if (details.me === "-" && details.you === "-") {
      setModal({
        show: true,
        message: "Choice not set by both you and your opponent!"
      });
    } else if (details.me === "-") {
      setModal({
        show: true,
        message: "Choice not set by you!"
      });
    } else if (details.you === "-") {
      setModal({
        show: true,
        message: "Choice not set by your opponent!"
      });
    } else {
      let tempButton = [["", "", ""], ["", "", ""], ["", "", ""]]
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i === r && j === c) {
            tempButton[i][j] = s;
          } else {
            tempButton[i][j] = button[i][j]
          }
        }
      }
      setButton(tempButton);
      if (btnMatrixRef[r][c].ref.current) {
        btnMatrixRef[r][c].ref.current!.disabled = true;
      }
      socket.emit("sendMatrix", {key: key, button: tempButton});
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (btnMatrixRef[i][j].ref.current) {
            btnMatrixRef[i][j].ref.current!.disabled = true;
            btnMatrixRef[i][j].ref.current!.setAttribute("style", "background-color: #343a40; border-color: #343a40;");
          }
        }
      }
    }
  }
  const handleClick = (ref: React.RefObject<HTMLButtonElement>) => {
    if (ref === btnRef.btnRef1) {
      setSymbol("O");
      setColour({me: "#ffc107", you: colour.you});
      setDetails({me: "O", you: details.you});
      if (btnRef.btnRef1.current) {
        btnRef.btnRef1.current.disabled = true;
      }
      socket.emit("sendChoice", {key: key, symbol: "O", colour: "#ffc107"});
    } else if (ref === btnRef.btnRef2) {
      setSymbol("X");
      setColour({me: "#dc3545", you: colour.you});
      setDetails({me: "X", you: details.you});
      if (btnRef.btnRef2.current) {
        btnRef.btnRef2.current.disabled = true;
      }
      socket.emit("sendChoice", {key: key, symbol: "X", colour: "#dc3545"});
    } else if (ref === btnRef.btnRef3) {
      setModal({
        show: false,
        message: modal.message
      });
    } else if (ref === btnRef.btnRef4) {
      socket.emit("reload", {key: key, reload: true});
      window.location.reload();
    } else if (ref === btnRef.btnRef5) {
      setAlert(false);
      setKey(generateKey());
    } else if (ref === btnRef.btnRef6) {
      socket.emit("sendRoom", key);
      setLoginModal(false);
    }
  }
  useEffect(() => {
    socket.on("receiveChoice", data => {
      setDetails({me: details.me, you: data.symbol});
      setColour({me: colour.me, you: data.colour});
      if (btnRef.btnRef1.current && btnRef.btnRef2.current) {
        if (btnRef.btnRef1.current.innerText === data.symbol) {
          btnRef.btnRef1.current.disabled = true;
        } else if (btnRef.btnRef2.current.innerText === data.symbol) {
          btnRef.btnRef2.current.disabled = true;
        }
      }
    });
    socket.on("receiveMatrix", data => {
      setButton(data.button);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (btnMatrixRef[i][j].ref.current && btnMatrixRef[i][j].ref.current!.innerText === "-") {
            btnMatrixRef[i][j].ref.current!.disabled = false;
            btnMatrixRef[i][j].ref.current!.setAttribute("style", "background-color: #0069d9; border-color: #0069d9;");
          }
        }
      }
    });
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (button[i][j] !== "-") {
          if (btnMatrixRef[i][j].ref.current) {
            btnMatrixRef[i][j].ref.current!.disabled = true;
            if (button[i][j] === details.me) {
              btnMatrixRef[i][j].ref.current!.setAttribute("style", `background-color: ${colour.me}; border-color: ${colour.me};`)
            } else if (button[i][j] === details.you) {
              btnMatrixRef[i][j].ref.current!.setAttribute("style", `background-color: ${colour.you}; border-color: ${colour.you};`)
            }
          }
          c++;
        }
      }
    }
    socket.on("reload", (data) => {
      if (data.reload) {
        window.location.reload();
      }
    });
    if (btnRef.btnRef6.current && key.length === 7) {
      setAlert(false);
      btnRef.btnRef6.current.disabled = false;
    } else if (btnRef.btnRef6.current && key.length !== 7) {
      setAlert(true);
      btnRef.btnRef6.current.disabled = true;
    }
  }, [btnMatrixRef, btnRef.btnRef1, btnRef.btnRef2, button, c, details, colour, key.length, btnRef.btnRef6]);
  useEffect(() => {
    if (checkWinLoss(button).win) {
      if (checkWinLoss(button).symbol === details.me) {
        setModal({
          show: true,
          message: "You've Won!"
        });
      } else if (checkWinLoss(button).symbol === details.you) {
        setModal({
          show: true,
          message: "You've Lost!"
        });
      }
    } else if (!checkWinLoss(button).win && c === 9) {
      setModal({
        show: true,
        message: "It is draw!"
      });
    }
  }, [button, c, modal.message, details.me, details.you]);
  return (
    <div className={styles.Board}>
      <Modal show={loginModal} onHide={() => {}} aria-labelledby="modal-0" centered>
        <Modal.Header closeButton>
          <Modal.Title id="modal-0">
            Login
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Alert variant="danger" show={alert}>
          No key or invalid key length!
        </Alert>
          <Form>
            <InputGroup>
              <Form.Control type="text" maxLength={7} value={key} placeholder="Enter Server Key" onChange={(e: { target: any; }) => {
                setKey(e.target.value.toUpperCase());
              }} />
              <InputGroup.Append>
                <Button variant={copyButton} onClick={() => {
                  navigator.clipboard.writeText(key)
                  setCopyButton("secondary");
                  setTimeout(() => {
                    setCopyButton("outline-secondary");
                  }, 5000);
                }}>Copy</Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" ref={btnRef.btnRef5} onClick={() => {handleClick(btnRef.btnRef5)}}>
            Generate
          </Button>
          <Button variant="primary" ref={btnRef.btnRef6} onClick={() => {handleClick(btnRef.btnRef6)}}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={modal.show} onHide={() => {setModal({
        show: false,
        message: modal.message
      })}} size="lg" aria-labelledby="modal-1" centered>
        <Modal.Header closeButton>
          <Modal.Title id="modal-1">
            Message
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>{modal.message}</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button ref={btnRef.btnRef3} onClick={() => {handleClick(btnRef.btnRef3)}}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs="12" lg="4">
            <Jumbotron className="mt-3 mb-0 py-4">
              <Container>
                <Row className="justify-content-center">
                  <Col>
                    <h3>SOCKET.IO TIC-TAC-TOE</h3>
                  </Col>
                </Row>
                <Row className="justify-content-center">
                  <Col>
                    <Row className="justify-content-start">
                      <h5>You: {details.me}</h5>
                    </Row>
                    <Row className="justify-content-start">
                      <h5>Opponent: {details.you}</h5>
                    </Row>
                  </Col>
                  <Col>
                    <Row className="justify-content-end">
                      <p>Room: {key}</p>
                    </Row>
                  </Col>
                </Row>
              </Container>
            </Jumbotron>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs="12" lg="4">
            <Row className="justify-content-center my-3">
              <Col>
                <Button ref={btnMatrixRef[0][0].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(0, 0, symbol);
                }}>{button[0][0]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[0][1].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(0, 1, symbol);
                }}>{button[0][1]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[0][2].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(0, 2, symbol);
                }}>{button[0][2]}</Button>
              </Col>
            </Row>
            <Row className="justify-content-center my-3">
              <Col>
                <Button ref={btnMatrixRef[1][0].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(1, 0, symbol);
                }}>{button[1][0]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[1][1].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(1, 1, symbol);
                }}>{button[1][1]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[1][2].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(1, 2, symbol);
                }}>{button[1][2]}</Button>
              </Col>
            </Row>
            <Row className="justify-content-center my-3">
              <Col>
                <Button ref={btnMatrixRef[2][0].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(2, 0, symbol);
                }}>{button[2][0]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[2][1].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(2, 1, symbol);
                }}>{button[2][1]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[2][2].ref} variant="primary" className={styles.Boardbutton} onClick={() => {
                  changeState(2, 2, symbol);
                }}>{button[2][2]}</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs="6" lg="2">
            <Button ref={btnRef.btnRef1} variant="success" size="lg" onClick={() => {handleClick(btnRef.btnRef1)}} block>O</Button>
          </Col>
          <Col xs="6" lg="2">
            <Button ref={btnRef.btnRef2} variant="success" size="lg" onClick={() => {handleClick(btnRef.btnRef2)}} block>X</Button>
          </Col>
        </Row>
        <Row className="justify-content-center m-1">
          <Col xs="5" lg="1">
            <Button ref={btnRef.btnRef4} variant="danger" size="lg" onClick={() => {handleClick(btnRef.btnRef4)}} block>RESET</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Board;
