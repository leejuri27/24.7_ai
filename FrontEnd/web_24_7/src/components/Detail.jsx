import React from 'react';
import './Detail.css'

const Detail = ({ detail }) => {
  console.log(detail);
  return (
    <div id='detail-container'>
      <div id='detail-left'>
        <div id='member-info-detail'>
          <div>
            <span className='member-name'>{detail.nickname} 회원</span>
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
            {/* <video src={detail.user_video_url}></video> */}
            <video src='./pushup.mp4'></video>
          </div>
        </div>
      </div>
      <div id='detail-right'>
        <div id='analysis-result'>
          <p className='detail-heading'>AI 분석 결과</p>
        </div>
        <div id='comment-write-form'>
          <textarea name="" id="comment-area" placeholder='내용 입력'></textarea>
        </div>
      </div>
    </div>
  );
};

export default Detail;
