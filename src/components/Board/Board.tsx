import React, { useRef, useEffect, useState } from 'react';
import styles from './Board.module.css';
import { Button, Container, Col, Row, Modal, Jumbotron } from 'react-bootstrap';
import io from 'socket.io-client';
import { checkWinLoss } from '../../services/control';

const socket = io('https://react-socketio-tic-tac-toe.herokuapp.com/');
const Board: React.FC = () => {
// eslint-disable-next-line react-hooks/exhaustive-deps
  const btnMatrixRef = [[{ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}],
                      [{ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}],
                      [{ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}, {ref: useRef<HTMLButtonElement>(null)}]];
  const btnRef = {
    btnRef1: useRef<HTMLButtonElement>(null),
    btnRef2: useRef<HTMLButtonElement>(null),
    btnRef3: useRef<HTMLButtonElement>(null),
    btnRef4: useRef<HTMLButtonElement>(null)
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
    me: '-',
    you: '-'
  };
  const initColour: colourType = {
    me: '#007bff',
    you: '#007bff'
  }
  const modalDetails: modalDetailsType = {
    show: false,
    message: ''
  }
  let c = 0;
  const [modal, setModal] = useState(modalDetails);
  const [details, setDetails] = useState(initDetails);
  const [symbol, setSymbol] = useState('-');
  const [colour, setColour] = useState(initColour);
  const [button, setButton] = useState([[symbol, symbol, symbol], [symbol, symbol, symbol], [symbol, symbol, symbol]]);
  const changeState = (r: number, c: number, s: string) => {
    if (details.me === '-' && details.you === '-') {
      setModal({
        show: true,
        message: 'Choice not set by both you and your opponent!'
      });
    } else if (details.me === '-') {
      setModal({
        show: true,
        message: 'Choice not set by you!'
      });
    } else if (details.you === '-') {
      setModal({
        show: true,
        message: 'Choice not set by your opponent!'
      });
    } else {
      let tempButton = [['', '', ''], ['', '', ''], ['', '', '']]
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
      socket.emit('sendMatrix', tempButton);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (btnMatrixRef[i][j].ref.current) {
            btnMatrixRef[i][j].ref.current!.disabled = true;
            btnMatrixRef[i][j].ref.current!.setAttribute('style', 'background-color: #343a40; border-color: #343a40;');
          }
        }
      }
    }
  }
  const handleClick = (ref: React.RefObject<HTMLButtonElement>) => {
    if (ref === btnRef.btnRef1) {
      setSymbol('O');
      setColour({me: '#ffc107', you: colour.you});
      setDetails({me: 'O', you: details.you});
      if (btnRef.btnRef1.current) {
        btnRef.btnRef1.current.disabled = true;
      }
      socket.emit('sendChoice', {symbol: 'O', colour: '#ffc107'});
    } else if (ref === btnRef.btnRef2) {
      setSymbol('X');
      setColour({me: '#dc3545', you: colour.you});
      setDetails({me: 'X', you: details.you});
      if (btnRef.btnRef2.current) {
        btnRef.btnRef2.current.disabled = true;
      }
      socket.emit('sendChoice', {symbol: 'X', colour: '#dc3545'});
    } else if (ref === btnRef.btnRef3) {
      setModal({
        show: false,
        message: modal.message
      });
    } else if (ref === btnRef.btnRef4) {
      socket.emit('reload', true);
      window.location.reload();
    }
  }
  useEffect(() => {
    socket.on('receiveChoice', data => {
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
    socket.on('receiveMatrix', data => {
      setButton(data);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (btnMatrixRef[i][j].ref.current && btnMatrixRef[i][j].ref.current!.innerText === '-') {
            btnMatrixRef[i][j].ref.current!.disabled = false;
            btnMatrixRef[i][j].ref.current!.setAttribute('style', 'background-color: #0069d9; border-color: #0069d9;');
          }
        }
      }
    });
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (button[i][j] !== '-') {
          if (btnMatrixRef[i][j].ref.current) {
            btnMatrixRef[i][j].ref.current!.disabled = true;
            if (button[i][j] === details.me) {
              btnMatrixRef[i][j].ref.current!.setAttribute('style', `background-color: ${colour.me}; border-color: ${colour.me};`)
            } else if (button[i][j] === details.you) {
              btnMatrixRef[i][j].ref.current!.setAttribute('style', `background-color: ${colour.you}; border-color: ${colour.you};`)
            }
          }
          c++;
        }
      }
    }
    socket.on('reload', (data) => {
      if (data) {
        window.location.reload();
      }
    });
  }, [btnMatrixRef, btnRef.btnRef1, btnRef.btnRef2, button, c, details, colour]);
  useEffect(() => {
    if (checkWinLoss(button).win) {
      if (checkWinLoss(button).symbol === details.me) {
        setModal({
          show: true,
          message: 'You\'ve Won!'
        });
      } else if (checkWinLoss(button).symbol === details.you) {
        setModal({
          show: true,
          message: 'You\'ve Lost!'
        });
      }
    } else if (!checkWinLoss(button).win && c === 9) {
      setModal({
        show: true,
        message: 'It is draw!'
      });
    }
  }, [button, c, modal.message, details.me, details.you]);
  return (
    <div className={styles.Board}>
      <Modal show={modal.show} size='lg' aria-labelledby='contained-modal-title-vcenter' centered>
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
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
        <Row className='justify-content-center'>
          <Col xs='12' lg='4'>
            <Jumbotron className='mt-3 mb-0 py-4'>
              <Container>
                <Row className='justify-content-center'>
                  <Col>
                    <h3>SOCKET.IO TIC-TAC-TOE</h3>
                  </Col>
                </Row>
                <Row className='justify-content-center'>
                  <Col>
                    <h5>You: {details.me}</h5>
                  </Col>
                  
                </Row>
                <Row className='justify-content-center'>
                <Col>
                    <h5>Opponent: {details.you}</h5>
                  </Col>
                </Row>
              </Container>
            </Jumbotron>
          </Col>
        </Row>
        <Row className='justify-content-center'>
          <Col xs='12' lg='4'>
            <Row className='justify-content-center my-3'>
              <Col>
                <Button ref={btnMatrixRef[0][0].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(0, 0, symbol);
                }}>{button[0][0]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[0][1].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(0, 1, symbol);
                }}>{button[0][1]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[0][2].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(0, 2, symbol);
                }}>{button[0][2]}</Button>
              </Col>
            </Row>
            <Row className='justify-content-center my-3'>
              <Col>
                <Button ref={btnMatrixRef[1][0].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(1, 0, symbol);
                }}>{button[1][0]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[1][1].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(1, 1, symbol);
                }}>{button[1][1]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[1][2].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(1, 2, symbol);
                }}>{button[1][2]}</Button>
              </Col>
            </Row>
            <Row className='justify-content-center my-3'>
              <Col>
                <Button ref={btnMatrixRef[2][0].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(2, 0, symbol);
                }}>{button[2][0]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[2][1].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(2, 1, symbol);
                }}>{button[2][1]}</Button>
              </Col>
              <Col>
                <Button ref={btnMatrixRef[2][2].ref} variant='primary' className={styles.Boardbutton} onClick={() => {
                  changeState(2, 2, symbol);
                }}>{button[2][2]}</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className='justify-content-center'>
          <Col xs='6' lg='2'>
            <Button ref={btnRef.btnRef1} variant='success' size="lg" onClick={() => {handleClick(btnRef.btnRef1)}} block>O</Button>
          </Col>
          <Col xs='6' lg='2'>
            <Button ref={btnRef.btnRef2} variant='success' size="lg" onClick={() => {handleClick(btnRef.btnRef2)}} block>X</Button>
          </Col>
        </Row>
        <Row className='justify-content-center m-1'>
          <Col xs='5' lg='1'>
            <Button ref={btnRef.btnRef4} variant='danger' size="lg" onClick={() => {handleClick(btnRef.btnRef4)}} block>RESET</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Board;
