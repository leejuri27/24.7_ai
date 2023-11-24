import time
import cv2
import numpy as np
from utils import find_angle, get_landmark_features, draw_text, draw_dotted_line
# utils 사용 이유
# ediaPipe Pose 기능으로 제공되는 스켈레톤은 고정된 구조로 특정 응용 프로그램에 맞게 스켈레톤을 조정하기 어려움
# get_landmark_features로 직접 스켈레톤을 만들면 원하는 구조로 쉽게 만들 수 있고, 계산량이 보다 적어 속도가 빠르다는 장점이 있다.

class ProcessFrame:
    def __init__(self, thresholds, fps, frame_size, flip_frame = False):
        
        self.ex_count = 1
        self.file_directory = f'C:\\Users\\gjaischool\\Desktop\\test\\output{self.ex_count}.mp4'
        
        # self.flip_frame 매개변수 값
        self.flip_frame = flip_frame

        # self.thresholds 매개변수 값.
        self.thresholds = thresholds
        
        self.fps = fps
        
        self.frame_size = frame_size
        
        self.out = cv2.VideoWriter(self.file_directory, cv2.VideoWriter_fourcc(*'mp4v'), self.fps, self.frame_size)

        # opencv 폰트 타입
        self.font = cv2.FONT_HERSHEY_SIMPLEX

        # opencv 라인 타입
        self.linetype = cv2.LINE_AA

        # 변수에 원을 그릴 때 반지름 값
        self.radius = 20

        # 변수에 각 색상의 BGR 형식 값
        self.COLORS = {
                        'blue'       : (0, 127, 255),
                        'red'        : (255, 50, 50),
                        'green'      : (0, 255, 127),
                        'light_green': (100, 233, 127),
                        'yellow'     : (255, 255, 0),
                        'magenta'    : (255, 0, 255),
                        'white'      : (255,255,255),
                        'cyan'       : (0, 255, 255),
                        'light_blue' : (102, 204, 255)
                    }

        #  랜드마크 기능 유지, 왼쪽 오른쪽
        self.dict_features = {}
        self.left_features = {
                                'shoulder': 11,
                                'elbow'   : 13,
                                'wrist'   : 15,                    
                                'hip'     : 23,
                                'knee'    : 25,
                                'ankle'   : 27,
                                'foot'    : 31
                            }

        self.right_features = {
                                'shoulder': 12,
                                'elbow'   : 14,
                                'wrist'   : 16,
                                'hip'     : 24,
                                'knee'    : 26,
                                'ankle'   : 28,
                                'foot'    : 32
                            }

        self.dict_features['left'] = self.left_features
        self.dict_features['right'] = self.right_features
        self.dict_features['nose'] = 0

        # 자세 추적 및 상태 공유
        # 이 딕셔너리에는 상태 시퀀스, 비활성 시간, 텍스트 표시 여부, 프레임 카운트 등이 포함됨
        self.state_tracker = {
            'state_seq': [],
            'ANGLE_LIST': [],
            'front_knee_ANGLE_LIST': [],
            'MIN_ANGLE_LIST': [],
            'SCORE_LIST' : [],
            'rec': False,
            'curr_state': None
            
        }

    # 점수 계산 함수
    def _get_score(self, angle):
        # state_tracker에 넣을때 엉덩이, 무릎, 발목 순서로 넣었으니 그대로 할당
        hip_angle = angle[0]
        front_knee_angle = angle[1]
        back_knee_angle = angle[2]
        score = 0
        if    hip_angle <= 11:
            score += 100
        elif  hip_angle <= 12:
            score += 90
        elif  hip_angle <= 13:
            score += 80 
        elif  hip_angle <= 14:
            score += 70
        elif  hip_angle <= 15:
            score += 60
        elif  hip_angle <= 16:
            score += 50
        elif  hip_angle <= 17:
            score += 40
        elif  hip_angle <= 18:
            score += 30

        if 78 <= front_knee_angle<= 84:
            score += 100
        elif 76 <= front_knee_angle <= 86:
            score += 90
        elif 74 <= front_knee_angle <= 88:
            score += 80
        elif 72 <= front_knee_angle <= 90:
            score += 70
        elif 70 <= front_knee_angle <= 92:
            score += 60
        elif 68 <= front_knee_angle <= 94:
            score += 50
        elif 66 <= front_knee_angle <= 96:
            score += 40
        elif 64 <= front_knee_angle <= 98:
            score += 30

            
        if 94 <= back_knee_angle <= 110:
            score += 100
        elif 91 <= back_knee_angle <= 113:
            score += 90
        elif 88 <= back_knee_angle <= 116:
            score += 80
        elif 85 <= back_knee_angle <= 119:
            score += 70
        elif 82 <= back_knee_angle <= 122:
            score += 60
        elif 79 <= back_knee_angle <= 125:
            score += 50
        elif 76 <= back_knee_angle <= 128:
            score += 40
        elif 73 <= back_knee_angle <= 131:
            score += 30

        
        return score // 3
    
    # 무릎 각도 기반 상태 반환
    def _get_state(self, front_knee_angle):
        
        front_knee = None        

        if self.thresholds['HIP_BACK_KNEE_VERT']['NORMAL'][0] <= front_knee_angle <= self.thresholds['HIP_BACK_KNEE_VERT']['NORMAL'][1]:
            front_knee = 1
        # elif self.thresholds['HIP_BACK_KNEE_VERT']['TRANS'][0] <= front_knee_angle <= self.thresholds['HIP_BACK_KNEE_VERTknee_VERT']['TRANS'][1]:
        #     front_knee = 2
        elif self.thresholds['HIP_BACK_KNEE_VERT']['PASS'][0] <= front_knee_angle <= self.thresholds['HIP_BACK_KNEE_VERT']['PASS'][1]:
            front_knee = 2

        return f's{front_knee}' if front_knee else None

    # 상태 시퀀스 업데이트
    def _update_state_sequence(self, state):

        if state == 's2':
            if (('s3' not in self.state_tracker['state_seq']) and (self.state_tracker['state_seq'].count('s2'))==0) or \
                    (('s3' in self.state_tracker['state_seq']) and (self.state_tracker['state_seq'].count('s2')==1)):
                        self.state_tracker['state_seq'].append(state)

        elif state == 's3':
            if (state not in self.state_tracker['state_seq']) and 's2' in self.state_tracker['state_seq']: 
                self.state_tracker['state_seq'].append(state)

    def process(self, frame: np.array, pose):
    
        frame_height, frame_width, _ = frame.shape

        # 이미지 처리.
        keypoints = pose.process(frame)
        # 포즈 랜드마크가 존재하는 경우, 해당 랜드마크를 기반으로 코, 어깨, 팔꿈치, 손목, 엉덩이, 무릎, 발목, 발의 좌표를 가져온다.
        if keypoints.pose_landmarks:
            ps_lm = keypoints.pose_landmarks

            nose_coord = get_landmark_features(ps_lm.landmark, self.dict_features, 'nose', frame_width, frame_height)
            left_shldr_coord, left_elbow_coord, left_wrist_coord, left_hip_coord, front_knee_coord, left_ankle_coord, left_foot_coord = \
                                get_landmark_features(ps_lm.landmark, self.dict_features, 'left', frame_width, frame_height)
            right_shldr_coord, right_elbow_coord, right_wrist_coord, right_hip_coord, back_knee_coord, right_ankle_coord, right_foot_coord = \
                                get_landmark_features(ps_lm.landmark, self.dict_features, 'right', frame_width, frame_height)
            # 왼쪽 어깨, 오른쪽 어깨, 코의 좌표를 사용하여 오프셋 각도를 계산함.
            offset_angle = find_angle(left_shldr_coord, right_shldr_coord, nose_coord)
            # 오프셋 각도가 임계값보다 큰 경우
            if offset_angle > self.thresholds['OFFSET_THRESH']:
                
                # 프레임에 코, 왼쪽 어깨, 오른쪽 어깨 원으로 표시.
                cv2.circle(frame, nose_coord,3, self.COLORS['white'], -1)
                cv2.circle(frame, left_shldr_coord, 3, self.COLORS['yellow'], -1)
                cv2.circle(frame, right_shldr_coord, 3, self.COLORS['magenta'], -1)
                
                # 좌우반전
                if self.flip_frame:
                    frame = cv2.flip(frame, 1)
        
                # 카메라가 정렬되지 않았을 때.    
                draw_text(
                    frame, 
                    'CAMERA NOT ALIGNED PROPERLY!!!', 
                    pos=(30, frame_height-60),
                    text_color=(255, 255, 230),
                    font_scale=0.65,
                    text_color_bg=(255, 153, 0),
                ) 
                
                # 프레임에 오프셋 각도 텍스트 표시(관절 각도)    
                draw_text(
                    frame, 
                    'OFFSET ANGLE: '+str(offset_angle), 
                    pos=(30, frame_height-30),
                    text_color=(255, 255, 230),
                    font_scale=0.65,
                    text_color_bg=(255, 153, 0),
                ) 
                
            # 오프셋 각도가 임계값보다 작은 경우
            else:
                # 왼쪽 어깨와 오른쪽 엉덩이 사이 거리 계산
                dist_l_sh_hip = abs(left_foot_coord[1]- left_shldr_coord[1])
                # 오른쪽 어깨와 왼쪽 엉덩이 사이 거리 계산
                dist_r_sh_hip = abs(right_foot_coord[1] - right_shldr_coord)[1]

                # 각 좌표 초기화
                shldr_coord = None
                elbow_coord = None
                wrist_coord = None
                hip_coord = None
                knee_coord = None
                ankle_coord = None
                foot_coord = None
                
                # 왼쪽 어깨 변수가 오른쪽 어깨 변수보다 클 경우, 왼쪽 어깨 관련 좌표 변수 할당
                if dist_l_sh_hip > dist_r_sh_hip:
                    shldr_coord = left_shldr_coord
                    elbow_coord = left_elbow_coord
                    wrist_coord = left_wrist_coord
                    hip_coord = left_hip_coord
                    knee_coord = front_knee_coord
                    ankle_coord = left_ankle_coord
                    foot_coord = left_foot_coord

                    multiplier = -1
                    # side = -90
                                    
                # 반대의 경우, 오른쪽 어깨 관련 좌표 변수 할당
                else:
                    shldr_coord = right_shldr_coord
                    elbow_coord = right_elbow_coord
                    wrist_coord = right_wrist_coord
                    hip_coord = right_hip_coord
                    knee_coord = back_knee_coord
                    ankle_coord = right_ankle_coord
                    foot_coord = right_foot_coord

                    multiplier = 1
                        
                # ------------------- 화면에서 보여줄 엉덩이 수직각도, 왼 오른 무릎 내각 계산 --------------
                # 엉덩이 수직 각도 계산/ 기준 : 어깨 좌표, 엉덩이 좌표
                hip_internal_angle = find_angle(shldr_coord, np.array([hip_coord[0], 0]), hip_coord)
                cv2.ellipse(frame, hip_coord, (30, 30), 
                            angle = 0, startAngle = -90, endAngle = -90+multiplier*hip_internal_angle, 
                            color = self.COLORS['white'], thickness = 2, lineType = self.linetype)

                                # (왼쪽 무릎) 엉덩이와 발목 사이의 무릎 각도 계산/ 기준 : 엉덩이 좌표, 무릎 좌표
                front_knee_internal_angle_1 = find_angle(hip_coord, np.array([0, front_knee_coord[1]]), front_knee_coord)
                front_knee_internal_angle_2 = find_angle(left_ankle_coord, np.array([0, front_knee_coord[1]]), front_knee_coord)
                front_knee_internal_angle = front_knee_internal_angle_1 + front_knee_internal_angle_2
                if hip_coord[1] <= front_knee_coord[1]:
                    cv2.ellipse(frame, front_knee_coord, (20, 20), 
                                angle = 0, startAngle = -180, endAngle = -180+front_knee_internal_angle_1, 
                                color = self.COLORS['white'], thickness = 2,  lineType = self.linetype)
                    cv2.ellipse(frame, front_knee_coord, (20, 20), 
                                angle = 0, startAngle = -180, endAngle = -180-front_knee_internal_angle_2, 
                                color = self.COLORS['white'], thickness = 2,  lineType = self.linetype)
                if hip_coord[1] >= front_knee_coord[1]:
                    cv2.ellipse(frame, front_knee_coord, (20, 20), 
                                angle = 0, startAngle = -180-front_knee_internal_angle_1, endAngle = -180-front_knee_internal_angle_2, 
                                color = self.COLORS['white'], thickness = 2,  lineType = self.linetype)

                # (오른쪽 무릎) 엉덩이와 발목 사이의 무릎 각도 계산/ 기준 : 엉덩이 좌표, 무릎 좌표
                back_knee_internal_angle_1 = find_angle(hip_coord, np.array([back_knee_coord[0], 0]), back_knee_coord)
                back_knee_internal_angle_2 = find_angle(right_ankle_coord, np.array([back_knee_coord[0], 0]), back_knee_coord)
                back_knee_internal_angle = back_knee_internal_angle_1 + back_knee_internal_angle_2
                cv2.ellipse(frame, back_knee_coord, (20, 20), 
                            angle = 0, startAngle = -90, endAngle = back_knee_internal_angle_1-90, 
                            color = self.COLORS['white'], thickness = 2,  lineType = self.linetype)
                cv2.ellipse(frame, back_knee_coord, (20, 20), 
                            angle = 0, startAngle = -90, endAngle = -90-back_knee_internal_angle_2, 
                            color = self.COLORS['white'], thickness = 2,  lineType = self.linetype)
                
                # ------------------------------------------------------------        
                # 랜드마크들을 연결하는 선을 그림    
                cv2.line(frame, shldr_coord, elbow_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, wrist_coord, elbow_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, shldr_coord, hip_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, front_knee_coord, hip_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, back_knee_coord, hip_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, left_ankle_coord, front_knee_coord,self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, right_ankle_coord, back_knee_coord,self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, left_ankle_coord, left_foot_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, right_ankle_coord, right_foot_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)

                # 랜드마크 점 시각화    
                cv2.circle(frame, shldr_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, elbow_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, wrist_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, hip_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, front_knee_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, back_knee_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, left_ankle_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, right_ankle_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, left_foot_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, right_foot_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
            
                # 현재 상태를 가져오고, 상태 시퀀스 업데이트.
                current_state = self._get_state(int(front_knee_internal_angle))
                self.state_tracker['curr_state'] = current_state
                self._update_state_sequence(current_state)

                # 횟수 카운트 관련 코드
                # -------------------------------------- COMPUTE COUNTERS --------------------------------------
                # 현재 상태가 s1인 경우
                if current_state == 's1':
                    if self.state_tracker['rec'] == True:
                        print(' ')
                        
                        self.state_tracker['rec'] = False
                        self.out.release()
                        self.ex_count += 1
                        self.file_directory = f'C:\\Users\\gjaischool\\Desktop\\test\\output{self.ex_count}.mp4'
                        self.out = cv2.VideoWriter(self.file_directory, cv2.VideoWriter_fourcc(*'mp4v'), self.fps, self.frame_size)

                    if len(self.state_tracker['front_knee_ANGLE_LIST']) > 3:
                        min_front_knee = min(self.state_tracker['front_knee_ANGLE_LIST'])
                        score = self._get_score(
                            self.state_tracker['ANGLE_LIST'][self.state_tracker['front_knee_ANGLE_LIST'].index(min_front_knee)])
                        print(
                            self.state_tracker['ANGLE_LIST'][self.state_tracker['front_knee_ANGLE_LIST'].index(min_front_knee)])
                        print(score)
                        self.state_tracker['SCORE_LIST'].append(score)
                        
                    # 변수 초기화
                    self.state_tracker['ANGLE_LIST'] = []
                    self.state_tracker['front_knee_ANGLE_LIST'] = []
                    self.state_tracker['state_seq'] = []
                    self.state_tracker['INCORRECT_POSTURE'] = False
                # ----------------------------------------------------------------------------
                # 현재 상태가 s1이 아닌 경우
                elif current_state == 's2':
                    self.state_tracker['rec'] = True
                    
                    if self.state_tracker['rec'] == True:
                        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                        self.out.write(frame)

                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    self.state_tracker['front_knee_ANGLE_LIST'].append(
                        front_knee_internal_angle)
                    self.state_tracker['ANGLE_LIST'].append(
                        [hip_internal_angle, front_knee_internal_angle, back_knee_internal_angle])
                        
                # ----------------------------------------------------------------------------------------------------               
        
                # 텍스트 좌표 계산
                hip_text_coord_x = hip_coord[0] + 10
                front_knee_text_coord_x = front_knee_coord[0] + 15
                back_knee_text_coord_x = back_knee_coord[0] + 15
                    
                # 프레임 뒤집은 경우, 택스트 좌표 반대로 설정
                if self.flip_frame:
                    frame = cv2.flip(frame, 1)
                    hip_text_coord_x = frame_width - hip_coord[0] + 10
                    front_knee_text_coord_x = frame_width - front_knee_coord[0] + 15
                    back_knee_text_coord_x = frame_width - back_knee_coord[0] + 15

                # 프레임에 엉덩이는 수직 각도, 왼 무릎, 오른 무릎의  내각을 나타내는 텍스트 표시
                cv2.putText(frame, str(int(hip_internal_angle)), (hip_text_coord_x, hip_coord[1]), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)
                cv2.putText(frame, str(int(front_knee_internal_angle)), (front_knee_text_coord_x, front_knee_coord[1]+10), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)
                cv2.putText(frame, str(int(back_knee_internal_angle)), (back_knee_text_coord_x, back_knee_coord[1]+10), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4) 
                
                # 스쿼트 자세분석 점수 표시
                draw_text(
                    frame, 
                    "SCORE: " + str(self.state_tracker['SCORE_LIST']), 
                    pos=(int(frame_width*0.68), 80),
                    text_color=(255, 255, 230),
                    font_scale=0.7,
                    text_color_bg=(0, 100, 0)
                )  
                        
        return frame