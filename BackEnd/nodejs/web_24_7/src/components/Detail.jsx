import React, { useRef } from 'react';
import axios from '../axios';
import './Detail.css';

const Detail = ({ detail, memberinfo, reset}) => {

  const feedbackContentRef = useRef();
  const alertMessage = useRef();
  const linkRef = useRef();

  const submit = () => {
    const connectionCode = detail.connection_code
    const feedbackContent = feedbackContentRef.current.value;
    const link = linkRef.current.value;
    const base = detail.user_video_url.split('.')[0]

    if (!feedbackContent) {
      alertMessage.current.style.display = 'block';
    } else {
      axios.post('/sendFeedback', {connection_code: connectionCode, feedbackContent: feedbackContent, link: link, base: base})
      .then((res) => {
        if (res.data.result === 'success') {
          reset()
        }
      });
    }
  };

  return (
    <div id='detail-container'>
      <div id='detail-left'>
        <div id='member-info-detail'>
          <div>
            <span className='member-name'>{memberinfo.nickname} 회원</span>
            <p className='member-info'>회원 정보</p>
          </div>
          <div id='hamburger-icon'>
            <img src='./hamburger.png' alt='' />
          </div>
        </div>
        <div id='user-video-with-comment'>
          <div>
            <p className='detail-heading'>스쿼트</p>
            <hr />
            <div id='video-section'>
              <video muted autoPlay loop playsInline>
                {/* <source src={detail.user_video_url} type='video/mp4'/> */}
                <source src='./lunge1.mp4' type='video/mp4' />
              </video>
            </div>
            <hr />
            <div id='user-comment'>
              <p>{detail.user_comment}</p>
            </div>
          </div>
        </div>
      </div>
      <div id='detail-right'>
        <div id='analysis-result'>
          <p className='detail-heading'>AI 분석 결과</p>
        </div>
        <div id='comment-write-form'>
          <textarea
            name=''
            id='comment-area'
            placeholder='내용 입력'
            ref={feedbackContentRef}
          ></textarea>
        </div>
        <div id='attachment-input-form'>
          <div id='attachment-input-section'>
            <input type='text' placeholder='첨부링크' ref={linkRef} />
          </div>
          <div id='attachment-button-section'>
            <input
              type='button'
              value=''
              id='submit'
              onClick={() => submit()}
            />
            <label for='submit'>저장</label>
          </div>
        </div>
      </div>
      <p id='alret-message' ref={alertMessage}>
        피드백 내용을 입력해주세요.
      </p>
    </div>
  );
};

export default Detail;
