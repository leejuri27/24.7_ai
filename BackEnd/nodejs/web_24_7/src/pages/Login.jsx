import React, { useContext } from 'react';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';
import { Trainer } from '../App'
import './Login.css';

const Login = () => {

  const { setTrainerInfo } = useContext(Trainer);

  const inputEmailRef = useRef();
  const inputPwRef = useRef();
  const signInCheckRef = useRef();

  const [signInCheckText, setSignInCheckText] = useState('');

  useEffect(() => {
    signInCheckRef.current.style.display = 'none';
  }, []);

  const signIn = () => {
    let regex = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');
    const inputEmail = inputEmailRef.current.value;
    const inputPw = inputPwRef.current.value;
    if (regex.test(inputEmail)) {
      axios
        .post('/login', {
          email: inputEmail,
          pw: inputPw
        })
        .then((res) => {
          console.log('success', res.data);
          if (res.data.result === 1) {
            console.log(res.data.trainer);
            setTrainerInfo(res.data.trainer);
          }
        })
        .catch((err) => {
          console.error('failed', err);
          setSignInCheckText('입력한 정보와 일치하는 데이터가 없습니다.');
          signInCheckRef.current.style.display = 'block';
          signInCheckRef.current.style.color = 'red';
        });
    } else {
      setSignInCheckText(
        '잘못된 이메일 형식입니다. 올바른 이메일을 입력해주세요.'
      );
      signInCheckRef.current.style.display = 'block';
      signInCheckRef.current.style.color = 'red';
    }
  };

  return (
    <div className='login'>
      <img src='./loginLogo.png' alt='' id='login-logo' />
      <form method='POST'>
        <input
          type='text'
          placeholder='Email'
          className='login-input'
          ref={inputEmailRef}
        />
        <input
          type='password'
          placeholder='Password'
          className='login-input'
          ref={inputPwRef}
        />
        <p className='check-result' ref={signInCheckRef}>
          {signInCheckText}
        </p>
        <input
          type='button'
          value='로그인'
          id='login-btn'
          className='login-input'
          onClick={() => signIn()}
        />
      </form>
      <div className='user-link'>
        <Link to={'/join'}>
          <span>가입하기</span>
        </Link>
        <Link to={'/find_password'}>
          <span>비밀번호 찾기</span>
        </Link>
      </div>
    </div>
  );
};

export default Login;
