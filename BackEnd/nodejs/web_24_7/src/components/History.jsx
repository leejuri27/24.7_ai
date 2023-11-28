import React, { useEffect, useState } from 'react';
import './History.css'

const History = ({ history, selectConnection }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageContents, setCurrentPageContents] = useState([]);
  const maxPage = Math.ceil((history.length + 1) / 10);

  const selectHistoryHandle = (connection_code) => {
    selectConnection(connection_code);
  };

  useEffect(() => {
    setCurrentPageContents(
      history.slice((currentPage - 1) * 10, currentPage * 10)
    );
    // eslint-disable-next-line
  }, [currentPage, history]);

  useEffect(() => {
    setCurrentPage(1)
  }, [history])

  return (
    <div id='history'>
      <div className='history-container'>
        <div className='history-item'>
          <p className='history-index'>No.</p>
          <p className='history-date'>신청 날짜</p>
          <p className='history-category'>운동 종류</p>
          <p className='history-comment'>사용자 요청내용</p>
          <p className='history-check'></p>
        </div>
        <ul>
          {currentPageContents.map((data, index) => {
            return data.confirm_trainer === 0 ? (
              <li onClick={() => selectHistoryHandle(data.connection_code)} key={index}>
                <hr />
                <div className='history-item'>
                  <p className='history-index'>{index + 1}</p>|
                  <p className='history-date'>{data.connection_date}</p>|
                  <p className='history-category'>{data.exercise_category}</p>|
                  <p className='history-comment'>{data.user_comment}</p>
                  <div className='history-check  not-checked'></div>
                </div>
              </li>
            ) : (
              <li onClick={() => selectHistoryHandle(data.connection_code)} key={index}>
                <hr />
                <div className='history-item'>
                  <p className='history-index'>{index + 1}</p>|
                  <p className='history-date'>{data.connection_date}</p>|
                  <p className='history-category'>{data.exercise_category}</p>|
                  <p className='history-comment'>{data.user_comment}</p>
                  <div className='history-check'></div>
                </div>
              </li>
            );
          })}
        </ul>
        
      </div>
      <div id='page-number-container'>
          <ul id='page-number'>
            {[...Array(maxPage)].map((n, index) => {
              return index + 1 === currentPage ? (
                <li id='current-page' onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </li>
              ) : (
                <li onClick={() => setCurrentPage(index + 1)}>{index + 1}</li>
              );
            })}
          </ul>
        </div>
    </div>
  );
};

export default History;
