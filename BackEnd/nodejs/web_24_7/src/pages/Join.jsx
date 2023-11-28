import React, { useEffect, useRef, useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
import './Join.css';

const Join = () => {
  let regex = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');

  const navigate = useNavigate();
  const fileRef = useRef();
  const fileNameRef = useRef();
  const emailCheckRef = useRef();
  const pwRef = useRef();
  const rePwRef = useRef();
  const nameRef = useRef();
  const careerRef = useRef();
  const joinCheckRef = useRef();

  const [emailCheckRes, setEmailCheckRes] = useState(false);
  const [emailCheckText, setEmailCheckText] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [joinCheckText, setJoinCheckText] = useState('');
  const [originFileName, setOriginFileName] = useState('');

  useEffect(() => {
    setEmailCheckRes(false);
    setEmailCheckText('');
    emailCheckRef.current.style.display = 'none';
  }, [inputEmail]);

  const emailCheck = () => {
    if (regex.test(inputEmail)) {
      axios
        .post('/emailCheck', {
          email: inputEmail,
        })
        .then((res) => {
          if (res.data.result === 'ok') {
            setEmailCheckRes(true);
            setEmailCheckText('사용 가능한 이메일입니다.');
            emailCheckRef.current.style.display = 'block';
            emailCheckRef.current.style.color = 'green';
          } else {
            setEmailCheckText(
              '중복된 이메일입니다. 다른 이메일을 입력해주세요'
            );
            emailCheckRef.current.style.display = 'block';
            emailCheckRef.current.style.color = 'red';
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setEmailCheckText(
        '잘못된 이메일 형식입니다. 올바른 이메일을 입력해주세요.'
      );
      emailCheckRef.current.style.display = 'block';
      emailCheckRef.current.style.color = 'red';
    }
  };

  const handleFileChange = (e) => {
    const filename = e.target.value;
    setOriginFileName(filename);
  };

  const join = () => {
    const inputPw = pwRef.current.value;
    const reInputPw = rePwRef.current.value;
    const inputName = nameRef.current.value;
    const career = careerRef.current.value;
    const fileName = fileNameRef.current.value;
    const file = fileRef.current.files[0];
    setJoinCheckText('');
    joinCheckRef.current.style.display = 'block';
    joinCheckRef.current.style.color = 'red';
    if (emailCheckRes === false) {
      setJoinCheckText('이메일 중복확인을 해주세요!');
    } else if (!inputPw) {
      setJoinCheckText('비밀번호를 입력해주세요');
    } else if (inputPw !== reInputPw) {
      setJoinCheckText('비밀번호가 같지 않습니다.');
    } else if (!inputName) {
      setJoinCheckText('이름을 입력해주세요');
    } else if (!fileName) {
      setJoinCheckText('프로필 사진을 등록하지 않으셨습니다. 이대로 진행하시겠습니까?')
    } else {
      const formData = new FormData();
      formData.append('profilePic', file);
      formData.append('email', inputEmail);
      formData.append('pw', inputPw);
      formData.append('name', inputName);
      formData.append('career', career);
      axios
        .post('/join', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          if (res.data.result === 0) {
            navigate('/')
          }
        })
        .catch((err) => {
          console.error('failed', err);
        });
    }
  };

  return (
    <div className='join'>
      <img src='./joinLogo.png' alt='' id='join-logo' />
      <form action='' method='post'>
        <div className='join-form'>
          <p>이메일</p>
          <div id='join-email-form'>
            <input
              type='text'
              name=''
              id=''
              className='join-input'
              onChange={(e) => {
                setInputEmail(e.target.value);
              }}
            />
            <input
              type='button'
              value='중복확인'
              id='dup-check-btn'
              onClick={() => emailCheck()}
            />
          </div>
          <p className='check-result' ref={emailCheckRef}>
            {emailCheckText}
          </p>
          <p>비밀번호</p>
          <input type='password' name='' className='join-input' ref={pwRef} />
          <p>비밀번호 확인</p>
          <input type='password' name='' className='join-input' ref={rePwRef} />
          <p>이름</p>
          <input type='text' name='' className='join-input' ref={nameRef} />
          <p>프로필 사진</p>
          <div id='join-upload-form'>
            <input
              className='join-input'
              value={originFileName}
              placeholder='첨부파일'
              ref={fileNameRef}
              disabled
            />
            <label for='profile_pic'>파일찾기</label>
            <input
              type='file'
              id='profile_pic'
              ref={fileRef}
              onChange={handleFileChange}
            />
          </div>
          <p>경력사항</p>
          <textarea name='' id='join-career' ref={careerRef}></textarea>
          <p className='check-result' ref={joinCheckRef}>
            {joinCheckText}
          </p>
          <input
            type='button'
            value='가입하기'
            id='join-btn'
            className='join-input'
            onClick={() => join()}
          />
        </div>
      </form>
    </div>
  );
};

export default Join;
