import React, { useRef, useState } from "react";

function Money() {
    const [money, setMoney] = useState(0);
    const moneyRef = useRef(null);

    const inMoney = () => {
        const sum = parseInt(moneyRef.current.value, 10)
        setMoney(money + sum)
    }

    const outMoney = () => {
        const sum = parseInt(moneyRef.current.value, 10)
        setMoney(money - sum)
    }

    return (
      <div>
        <h1>금액관리</h1>
        <input ref={moneyRef} ></input>
        <br></br>
        <button onClick={inMoney}>입금</button>
        <button onClick={outMoney}>출금</button>
        <p>잔액 : {money} </p>
      </div>
    );
  }
  
  export default Money;
