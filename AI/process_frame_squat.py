import os
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
        # self.file_directory = f'C:\\Users\\gjaischool\\Desktop\\test\\output{self.ex_count}.mp4'
        
        self.file_directory = f'C:\\Users\\gjaischool\\Desktop\\24.7\\BackEnd\\nodejs\\public\\uploads\\output{self.ex_count}.mp4'
        # self.file_directory = os.path.join(__file__, '..', 'BackEnd', 'nodejs','public', 'uploads', 'video') + f'output{self.ex_count}.mp4'

        # 매개변수 값
        self.flip_frame = flip_frame
        
        # 매개변수 값.
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
            'ANGLE_LIST': [],
            'HIP_ANGLE_LIST': [],
            'MIN_ANGLE_LIST': [],
            'SCORE_LIST': [],
            
            'rec': False,

            'curr_state': None
        }
        
    # 무릎 각도 기반 상태 반환
    def _get_state(self, knee_angle):
        
        knee = None        

        if self.thresholds['HIP_KNEE_VERT']['NORMAL'][0] <= knee_angle <= self.thresholds['HIP_KNEE_VERT']['NORMAL'][1]:
            knee = 1
        elif self.thresholds['HIP_KNEE_VERT']['TRANS'][0] <= knee_angle <= self.thresholds['HIP_KNEE_VERT']['TRANS'][1]:
            knee = 2
        elif self.thresholds['HIP_KNEE_VERT']['PASS'][0] <= knee_angle <= self.thresholds['HIP_KNEE_VERT']['PASS'][1]:
            knee = 3

        return f's{knee}' if knee else None
    
    # 점수 계산 함수
    def _get_score(self, angle):
        # state_tracker에 넣을때 엉덩이, 무릎, 발목 순서로 넣었으니 그대로 할당
        hip_angle = angle[0]
        knee_angle = angle[1]
        ankle_angle = angle[2]
        score = 0
        if 30 <= hip_angle <= 44:
            score += 100
        elif 28 <= hip_angle <= 46:
            score += 90
        elif 26 <= hip_angle <= 48:
            score += 80
        elif 24 <= hip_angle <= 50:
            score += 70
        elif 22 <= hip_angle <= 52:
            score += 60
        elif 20 <= hip_angle <= 54:
            score += 50
        elif 18 <= hip_angle <= 56:
            score += 40
        elif 16 <= hip_angle <= 58:
            score += 30

        if 76 <= knee_angle <= 90:
            score += 100
        elif 74 <= knee_angle <= 91:
            score += 90
        elif 72 <= knee_angle <= 92:
            score += 80
        elif 70 <= knee_angle <= 93:
            score += 70
        elif 68 <= knee_angle <= 94:
            score += 60
        elif 66 <= knee_angle <= 95:
            score += 50
        elif 64 <= knee_angle <= 96:
            score += 40
        elif 62 <= knee_angle <= 97:
            score += 30
        
        if 20 <= ankle_angle <= 27:
            score += 100
        elif 19 <= ankle_angle <= 28:
            score += 90
        elif 18 <= ankle_angle <= 29:
            score += 80
        elif 17 <= ankle_angle <= 30:
            score += 70
        elif 16 <= ankle_angle <= 31:
            score += 60
        elif 15 <= ankle_angle <= 32:
            score += 50
        elif 14 <= ankle_angle <= 33:
            score += 40
        elif 13 <= ankle_angle <= 34:
            score += 30
            
        return score // 3

    def process(self, frame: np.array, pose):
        
        frame_height, frame_width, _ = frame.shape
        
        keypoints = pose.process(frame)
        # 포즈 랜드마크가 존재하는 경우, 해당 랜드마크를 기반으로 코, 어깨, 팔꿈치, 손목, 엉덩이, 무릎, 발목, 발의 좌표를 가져온다.
        if keypoints.pose_landmarks:
            ps_lm = keypoints.pose_landmarks

            nose_coord = get_landmark_features(ps_lm.landmark, self.dict_features, 'nose', frame_width, frame_height)
            left_shldr_coord, left_elbow_coord, left_wrist_coord, left_hip_coord, left_knee_coord, left_ankle_coord, left_foot_coord = \
                                get_landmark_features(ps_lm.landmark, self.dict_features, 'left', frame_width, frame_height)
            right_shldr_coord, right_elbow_coord, right_wrist_coord, right_hip_coord, right_knee_coord, right_ankle_coord, right_foot_coord = \
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
        
                
            # 오프셋 각도가 임계값보다 작은 경우
            else:    
                # 왼쪽 어깨와 오른쪽 엉덩이 사이 거리 계산
                dist_l_sh_hip = abs(left_foot_coord[1]- left_shldr_coord[1])
                # 오른쪽 어깨와 왼쪽 엉덩이 사이 거리 계산
                dist_r_sh_hip = abs(right_foot_coord[1] - right_shldr_coord[1])

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
                    knee_coord = left_knee_coord
                    ankle_coord = left_ankle_coord
                    foot_coord = left_foot_coord

                    multiplier = -1
                                        
                # 반대의 경우, 오른쪽 어깨 관련 좌표 변수 할당
                else:
                    shldr_coord = right_shldr_coord
                    elbow_coord = right_elbow_coord
                    wrist_coord = right_wrist_coord
                    hip_coord = right_hip_coord
                    knee_coord = right_knee_coord
                    ankle_coord = right_ankle_coord
                    foot_coord = right_foot_coord

                    multiplier = 1

                # 엉덩이 수직 각도 계산/ 기준 : 어깨 좌표, 엉덩이 좌표
                hip_vertical_angle = find_angle(shldr_coord, np.array([hip_coord[0], 0]), hip_coord)
                cv2.ellipse(frame, hip_coord, (30, 30), 
                            angle = 0, startAngle = -90, endAngle = -90+multiplier*hip_vertical_angle, 
                            color = self.COLORS['white'], thickness = 2, lineType = self.linetype)

                draw_dotted_line(frame, hip_coord, start=hip_coord[1]-40, end=hip_coord[1], line_color=self.COLORS['white'])

                # 엉덩이와 무릎 사이의 수직 각도 계산/ 기준 : 엉덩이 좌표, 무릎 좌표
                knee_vertical_angle = find_angle(hip_coord, np.array([knee_coord[0], 0]), knee_coord)
                cv2.ellipse(frame, knee_coord, (20, 20), 
                            angle = 0, startAngle = -90, endAngle = -90-multiplier*knee_vertical_angle, 
                            color = self.COLORS['white'], thickness = 2,  lineType = self.linetype)

                draw_dotted_line(frame, knee_coord, start=knee_coord[1]-40, end=knee_coord[1], line_color=self.COLORS['white'])

                # 무릎과 발목 사이의 수직 각도 계산/ 기준 : 무릎 좌표, 발목 좌표
                ankle_vertical_angle = find_angle(knee_coord, np.array([ankle_coord[0], 0]), ankle_coord)
                cv2.ellipse(frame, ankle_coord, (30, 30),
                            angle = 0, startAngle = -90, endAngle = -90 + multiplier*ankle_vertical_angle,
                            color = self.COLORS['white'], thickness = 2,  lineType=self.linetype)
                
                draw_dotted_line(frame, ankle_coord, start=ankle_coord[1]-40, end=ankle_coord[1], line_color=self.COLORS['white'])
        
                # 랜드마크들을 연결하는 선을 그림    
                cv2.line(frame, shldr_coord, elbow_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, wrist_coord, elbow_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, shldr_coord, hip_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, knee_coord, hip_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, ankle_coord, knee_coord,self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, ankle_coord, foot_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)

                # 랜드마크 점 시각화    
                cv2.circle(frame, shldr_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, elbow_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, wrist_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, hip_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, knee_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, ankle_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, foot_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)

                # 현재 상태를 가져오고, 상태 시퀀스 업데이트.
                hip_ankle_knee_angle = find_angle(hip_coord, ankle_coord, knee_coord)
                current_state = self._get_state(int(hip_ankle_knee_angle))
                self.state_tracker['curr_state'] = current_state

                
                # 현재 상태가 s1인 경우
                if current_state == 's1':
                    if self.state_tracker['rec'] == True:
                        self.state_tracker['rec'] = False
                        self.out.release()
                        self.ex_count += 1
                        self.file_directory = f'C:\\Users\\gjaischool\\Desktop\\24.7\\BackEnd\\nodejs\\public\\uploads\\output{self.ex_count}.mp4'
                        # self.file_directory = f'C:\\Users\\gjaischool\\Desktop\\test\\output{self.ex_count}.mp4'
                        # self.file_directory = os.path.abspat(os.path.join(__file__, '..', 'BackEnd', 'nodejs','public', 'uploads', 'video') + f'output{self.ex_count}.mp4')
                        
                        self.out = cv2.VideoWriter(self.file_directory, cv2.VideoWriter_fourcc(*'mp4v'), self.fps, self.frame_size)
                    
                        file_size = os.path.getsize(self.file_directory)
                        print('file name : ', self.file_directory)
                        print('file_size : ' ,file_size, 'byte')
                        
                        
                        
                        
                    if len(self.state_tracker['HIP_ANGLE_LIST']) > 3:
                        max_hip = max(self.state_tracker['HIP_ANGLE_LIST'])
                        score = self._get_score(
                            self.state_tracker['ANGLE_LIST'][self.state_tracker['HIP_ANGLE_LIST'].index(max_hip)])
                        self.state_tracker['SCORE_LIST'].append(score)
                        # print(
                        #         self.state_tracker['ANGLE_LIST'][self.state_tracker['HIP_ANGLE_LIST'].index(max_hip)])
                        # print('squat score : ', score)

                    
                    self.state_tracker['ANGLE_LIST'] = []
                    self.state_tracker['HIP_ANGLE_LIST'] = []

                # ----------------------------------------------------------------------------------------------------
                # 현재 상태가 s1이 아닌 경우
                else:
                    self.state_tracker['rec'] = True
                    
                    if self.state_tracker['rec'] == True:
                        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                        self.out.write(frame)

                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    self.state_tracker['HIP_ANGLE_LIST'].append(
                        hip_vertical_angle)
                    self.state_tracker['ANGLE_LIST'].append(
                        [hip_vertical_angle, knee_vertical_angle, ankle_vertical_angle])
                # ----------------------------------------------------------------------------------------------------
                
                # 텍스트 좌표 계산
                hip_text_coord_x = hip_coord[0] + 10
                knee_text_coord_x = knee_coord[0] + 15
                ankle_text_coord_x = ankle_coord[0] + 10
                
                # 프레임 뒤집은 경우, 택스트 좌표 반대로 설정
                if self.flip_frame:
                    frame = cv2.flip(frame, 1)
                    hip_text_coord_x = frame_width - hip_coord[0] + 10
                    knee_text_coord_x = frame_width - knee_coord[0] + 15
                    ankle_text_coord_x = frame_width - ankle_coord[0] + 10

                # 프레임에 엉덩이, 무릎, 발목의  수직 각도를 나타내는 텍스트 표시
                cv2.putText(frame, str(int(hip_vertical_angle)), (hip_text_coord_x, hip_coord[1]), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)
                cv2.putText(frame, str(int(knee_vertical_angle)), (knee_text_coord_x, knee_coord[1]+10), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)
                cv2.putText(frame, str(int(ankle_vertical_angle)), (ankle_text_coord_x, ankle_coord[1]), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)

                # 스쿼트 자세분석 점수 표시
                draw_text(
                        frame, 
                        "SCORE: " + str(self.state_tracker['SCORE_LIST']), 
                        pos=(int(frame_width*0.58), 80),
                        text_color=(255, 255, 230),
                        font_scale=0.7,
                        text_color_bg=(0, 100, 0)
                    )  
                

            
        return frame

                    