import React, { useEffect, useState } from 'react';
import Detail from '../components/Detail';
import History from '../components/History';
import axios from '../axios';
import './Index.css';

const Index = () => {
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(0);
  const [selectedMemberData, setSelectedMemberData] = useState({});
  const [memberHistory, setMemberHistory] = useState([]);
  const [selectedConnCode, setSelectedConnCode] = useState(0);
  const [detailData, setDetailData] = useState({});

  const trainerCode = 20000002;

  const conectionChangeHandle = (connection_code) => {
    setSelectedConnCode(connection_code);
  };

  const getMemberList = () => {
    axios
      .post('/trainer/getMemberList', {
        trainer_code: trainerCode,
      })
      .then((res) => {
        setMemberList(res.data.list);
      });
  };

  const getHistory = () => {
    axios
      .post(`/trainer/getHistory`, {
        trainer_code: trainerCode,
        user_code: selectedMember,
      })
      .then((res) => {
        setMemberHistory(res.data.history);
      });
  };

  const getMemberInfo = () => {
    axios
      .post('/trainer/getMemberInfo', {
        user_code: selectedMember,
      })
      .then((res) => {
        setSelectedMemberData(res.data.info);
      });
  };

  const getDetail = () => {
    axios
      .post('/trainer/getDetail', {
        connection_code: selectedConnCode,
      })
      .then((res) => {
        setDetailData(res.data.detail);
      });
  };

  const listClickHandle = (user_code) => {
    setSelectedMember(user_code);
    setSelectedConnCode(0);
    setDetailData({});
    setMemberHistory([]);
  };

  useEffect(() => {
    getMemberList();
  }, []);

  useEffect(() => {
    if (selectedConnCode !== 0 && selectedConnCode !== undefined) {
      console.log(selectedConnCode);
      getDetail(selectedConnCode);
    }
    // eslint-disable-next-line
  }, [selectedConnCode]);

  useEffect(() => {
    console.log('History Length', memberHistory.length);
    console.log('Selected Member', selectedMember);
  }, [selectedMember, memberHistory]);

  useEffect(() => {
    if (selectedMember !== 0 && selectedMember !== undefined) {
      getHistory(selectedMember);
      getMemberInfo(selectedMember);
    }
    // eslint-disable-next-line
  }, [selectedMember]);

  return (
    <div className='main'>
      <div className='menu-list'>
        <img src='./pageLogo.png' alt='' id='main-logo' />
        <div id='trainer-info'>
          <div id='profile-img' />
          <p>김형진 트레이너님</p>
          <div id='hamburger-icon'>
            <img src='./hamburger.png' alt='' />
          </div>
        </div>
        <div id='member-list-container'>
          <p>가입 회원 리스트</p>
          <div id='member-search-form'>
            <input type='text' name='' id='member-search-input' />
            <input type='button' id='member-search-button' value='검색' />
          </div>
          <div id='member-list'>
            <ul>
              {memberList.map((item, index) => {
                return item.checked === 0 &&
                  item.user_code === selectedMember ? (
                  <li
                    key={index}
                    className='selected-li'
                    onClick={() => listClickHandle(item.user_code)}
                  >
                    <div className='member-li'>{item.nickname} 회원</div>
                    <div className='red-dot' />
                  </li>
                ) : item.user_code === selectedMember ? (
                  <li
                    key={index}
                    className='selected-li'
                    onClick={() => listClickHandle(item.user_code)}
                  >
                    <div className='member-li'>{item.nickname} 회원</div>
                  </li>
                ) : item.checked === 0 ? (
                  <li
                    key={index}
                    onClick={() => listClickHandle(item.user_code)}
                  >
                    <div className='member-li'>{item.nickname} 회원</div>
                    <div className='red-dot' />
                  </li>
                ) : (
                  <li
                    key={index}
                    onClick={() => listClickHandle(item.user_code)}
                  >
                    <div className='member-li'>{item.nickname} 회원</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <div className='data-container'>
        {detailData.exercise_category ? (
          <Detail detail={detailData} />
        ) : memberHistory.length > 0 ? (
          <History
            history={memberHistory}
            memberinfo={selectedMemberData}
            selectConnection={conectionChangeHandle}
          />
        ) : (
          <div id='before-select'>
            <span>열람할 회원을 클릭하세요.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
