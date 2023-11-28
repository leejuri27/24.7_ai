import React, { useContext, useEffect, useRef, useState } from 'react';
import Detail from '../components/Detail';
import History from '../components/History';
import axios from '../axios';
import { Trainer } from '../App';
import './Index.css';

const Index = () => {
  const { trainerInfo } = useContext(Trainer);

  const filterMemberQuery = useRef();

  const [memberList, setMemberList] = useState([]);
  const [filteredMemberList, setFilteredMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(0);
  const [selectedMemberData, setSelectedMemberData] = useState({});
  const [memberHistory, setMemberHistory] = useState([]);
  const [selectedConnCode, setSelectedConnCode] = useState(0);
  const [detailData, setDetailData] = useState({});

  const conectionChangeHandle = (connection_code) => {
    setSelectedConnCode(connection_code);
  };

  const reset = () => {
    setSelectedMember(0);
    setSelectedConnCode(0);
    setDetailData({});
  };

  const getMemberList = () => {
    axios
      .post('/getMemberList', {
        trainer_code: trainerInfo.trainer_code,
      })
      .then((res) => {
        setMemberList(res.data.list);
        setFilteredMemberList(res.data.list);
      });
  };

  const getHistory = () => {
    axios
      .post(`/getHistory`, {
        trainer_code: trainerInfo.trainer_code,
        user_code: selectedMember,
      })
      .then((res) => {
        setMemberHistory(res.data.history);
      });
  };

  const getMemberInfo = () => {
    axios
      .post('/getMemberInfo', {
        user_code: selectedMember,
      })
      .then((res) => {
        setSelectedMemberData(res.data.info);
      });
  };

  const getDetail = () => {
    axios
      .post('/getDetail', {
        connection_code: selectedConnCode,
      })
      .then((res) => {
        setDetailData(res.data.detail);
      });
  };

  const filterMember = () => {
    reset()
    const query = filterMemberQuery.current.value;
    const filtered = memberList.filter((user) => {
      return user.nickname.includes(query)
    })
    setFilteredMemberList(filtered)
  }

  const listClickHandle = (user_code) => {
    reset();
    setSelectedMember(user_code);
  };

  useEffect(() => {
    getMemberList();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedConnCode !== 0 && selectedConnCode !== undefined) {
      getDetail(selectedConnCode);
    } else {
      setDetailData({});
    }
    // eslint-disable-next-line
  }, [selectedConnCode]);

  useEffect(() => {
    if (selectedMember !== 0 && selectedMember !== undefined) {
      getHistory(selectedMember);
      getMemberInfo(selectedMember);
    } else {
      setMemberHistory([]);
    }
    // eslint-disable-next-line
  }, [selectedMember]);

  return (
    <div className='main'>
      <div className='menu-list'>
        <img src='./pageLogo.png' alt='' id='main-logo' />
        <div id='trainer-info'>
          <div id='profile-img' > 
            <img src={'./'+trainerInfo.profile_pic} alt="" />
          </div>
          <p>{trainerInfo.trainer_name} 트레이너님</p>
          <div id='hamburger-icon'>
            <img src='./hamburger.png' alt='' />
          </div>
        </div>
        <div id='member-list-container'>
          <p>가입 회원 리스트</p>
          <div id='member-search-form'>
            <input type='text' name='' id='member-search-input' ref={filterMemberQuery}/>
            <input type='button' id='member-search-button' value='검색' onClick={() => filterMember()} />
          </div>
          <div id='member-list'>
            <ul>
              {filteredMemberList.map((item, index) => {
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
          <Detail
            detail={detailData}
            memberinfo={selectedMemberData}
            reset={reset}
          />
        ) : memberHistory.length > 0 ? (
          <History
            history={memberHistory}
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
