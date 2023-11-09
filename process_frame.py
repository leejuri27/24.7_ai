import time
import cv2
import numpy as np
from utils import find_angle, get_landmark_features, draw_text, draw_dotted_line
# utils 사용 이유
# ediaPipe Pose 기능으로 제공되는 스켈레톤은 고정된 구조로 특정 응용 프로그램에 맞게 스켈레톤을 조정하기 어려움
# get_landmark_features로 직접 스켈레톤을 만들면 원하는 구조로 쉽게 만들 수 있고, 계산량이 보다 적어 속도가 빠르다는 장점이 있다.



class ProcessFrame:
    def __init__(self, thresholds, flip_frame = False):
        
        # Set if frame should be flipped or not. 매개변수 값
        self.flip_frame = flip_frame

        # self.thresholds 매개변수 값.
        self.thresholds = thresholds

        # opencv 폰트 타입
        self.font = cv2.FONT_HERSHEY_SIMPLEX

        # opencv 라인 타입
        self.linetype = cv2.LINE_AA

        # set radius to draw arc
        # 변수에 원을 그릴 때 반지름 값
        self.radius = 20

        # Colors in BGR format.
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



        # Dictionary to maintain the various landmark features.
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

        
        # For tracking counters and sharing states in and out of callbacks.
        # 자세 추적 및 상태 공유
        # 이 딕셔너리에는 상태 시퀀스, 비활성 시간, 텍스트 표시 여부, 프레임 카운트 등이 포함됨
        self.state_tracker = {
            'state_seq': [],

            'start_inactive_time': time.perf_counter(),
            'start_inactive_time_front': time.perf_counter(),
            'INACTIVE_TIME': 0.0,
            'INACTIVE_TIME_FRONT': 0.0,

            # 0 --> Bend Backwards, 1 --> Bend Forward, 2 --> Keep shin straight, 3 --> Deep squat
            'DISPLAY_TEXT' : np.full((4,), False),
            'COUNT_FRAMES' : np.zeros((4,), dtype=np.int64),

            'LOWER_HIPS': False,

            'INCORRECT_POSTURE': False,

            'prev_state': None,
            'curr_state':None,

            'SQUAT_COUNT': 0,
            'IMPROPER_SQUAT':0
            
        }
        # 자세 피드백
        # 이 딕셔너리에는 자세 ID, 표시할 텍스트, 텍스트 크기 및 색상이 포함됩니다.
        self.FEEDBACK_ID_MAP = {
                                0: ('BEND BACKWARDS', 215, (0, 153, 255)),
                                1: ('BEND FORWARD', 215, (0, 153, 255)),
                                2: ('KNEE FALLING OVER TOE', 170, (255, 80, 80)),
                                3: ('SQUAT TOO DEEP', 125, (255, 80, 80))
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



    # 상태 시퀀스 업데이트
    def _update_state_sequence(self, state):

        if state == 's2':
            if (('s3' not in self.state_tracker['state_seq']) and (self.state_tracker['state_seq'].count('s2'))==0) or \
                    (('s3' in self.state_tracker['state_seq']) and (self.state_tracker['state_seq'].count('s2')==1)):
                        self.state_tracker['state_seq'].append(state)
            

        elif state == 's3':
            if (state not in self.state_tracker['state_seq']) and 's2' in self.state_tracker['state_seq']: 
                self.state_tracker['state_seq'].append(state)

            

    # 피드백 표시
    def _show_feedback(self, frame, c_frame, dict_maps, lower_hips_disp):


        if lower_hips_disp:
            draw_text(
                    frame, 
                    'LOWER YOUR HIPS', 
                    pos=(30, 80),
                    text_color=(0, 0, 0),
                    font_scale=0.6,
                    text_color_bg=(255, 255, 0)
                )  

        for idx in np.where(c_frame)[0]:
            draw_text(
                    frame, 
                    dict_maps[idx][0], 
                    pos=(30, dict_maps[idx][1]),
                    text_color=(255, 255, 230),
                    font_scale=0.6,
                    text_color_bg=dict_maps[idx][2]
                )

        return frame



    def process(self, frame: np.array, pose):
       

        frame_height, frame_width, _ = frame.shape

        # Process the image.
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
                
                display_inactivity = False
                # 휴식상태를 표시하지 않는 경우, 휴식 시간 계산
                end_time = time.perf_counter()
                self.state_tracker['INACTIVE_TIME_FRONT'] += end_time - self.state_tracker['start_inactive_time_front']
                self.state_tracker['start_inactive_time_front'] = end_time
                # 휴식시간이 임계값보다 큰 경우, 두 카운트 모두 초기화
                if self.state_tracker['INACTIVE_TIME_FRONT'] >= self.thresholds['INACTIVE_THRESH']:
                    self.state_tracker['SQUAT_COUNT'] = 0
                    self.state_tracker['IMPROPER_SQUAT'] = 0
                    display_inactivity = True

                # 프레임에 코, 왼쪽 어깨, 오른쪽 어깨 원으로 표시.
                cv2.circle(frame, nose_coord,3, self.COLORS['white'], -1)
                cv2.circle(frame, left_shldr_coord, 3, self.COLORS['yellow'], -1)
                cv2.circle(frame, right_shldr_coord, 3, self.COLORS['magenta'], -1)
                
                # 좌우반전
                if self.flip_frame:
                    frame = cv2.flip(frame, 1)

                # 휴식상태 표시
                if display_inactivity:
                    # cv2.putText(frame, 'Resetting SQUAT_COUNT due to inactivity!!!', (10, frame_height - 90), 
                    #             self.font, 0.5, self.COLORS['blue'], 2, lineType=self.linetype)
                    self.state_tracker['INACTIVE_TIME_FRONT'] = 0.0
                    self.state_tracker['start_inactive_time_front'] = time.perf_counter()

                # 올바른 스쿼트 표시
                draw_text(
                    frame, 
                    "CORRECT: " + str(self.state_tracker['SQUAT_COUNT']), 
                    pos=(int(frame_width*0.68), 30),
                    text_color=(255, 255, 230),
                    font_scale=0.7,
                    text_color_bg=(18, 185, 0)
                )  
                
                # 잘못된 스쿼트 표시
                draw_text(
                    frame, 
                    "INCORRECT: " + str(self.state_tracker['IMPROPER_SQUAT']), 
                    pos=(int(frame_width*0.68), 80),
                    text_color=(255, 255, 230),
                    font_scale=0.7,
                    text_color_bg=(221, 0, 0),
                    
                )  
                
                # 카메라가 정렬되지 않았음.    
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

                # 측면보기 비활성 시간 재설정 
                self.state_tracker['start_inactive_time'] = time.perf_counter()
                self.state_tracker['INACTIVE_TIME'] = 0.0
                self.state_tracker['prev_state'] =  None
                self.state_tracker['curr_state'] = None
            
            # Camera is aligned properly.
            # 오프셋 각도가 임계값보다 작은 경우
            else:
                # 휴식시간과 임계값 초기화
                self.state_tracker['INACTIVE_TIME_FRONT'] = 0.0
                self.state_tracker['start_inactive_time_front'] = time.perf_counter()

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
                    

                # ------------------- Verical Angle calculation --------------
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
                
                # 엉덩이, 무릎, 발목 좌표 기준으로 점선을 그림
                draw_dotted_line(frame, ankle_coord, start=ankle_coord[1]-40, end=ankle_coord[1], line_color=self.COLORS['white'])

                # ------------------------------------------------------------
        
                # 랜드마크들을 연결하는 선을 그림    
                # Join landmarks.
                cv2.line(frame, shldr_coord, elbow_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, wrist_coord, elbow_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, shldr_coord, hip_coord, self.COLORS['light_blue'], 2, lineType=self.linetype)
                cv2.line(frame, knee_coord, hip_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, ankle_coord, knee_coord,self.COLORS['light_blue'], 2,  lineType=self.linetype)
                cv2.line(frame, ankle_coord, foot_coord, self.COLORS['light_blue'], 2,  lineType=self.linetype)

                # 랜드마크 점 시각화    
                # Plot landmark points
                cv2.circle(frame, shldr_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, elbow_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, wrist_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, hip_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, knee_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, ankle_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)
                cv2.circle(frame, foot_coord, 3, self.COLORS['yellow'], -1,  lineType=self.linetype)

                
                # 현재 상태를 가져오고, 상태 시퀀스 업데이트.
                current_state = self._get_state(int(knee_vertical_angle))
                self.state_tracker['curr_state'] = current_state
                self._update_state_sequence(current_state)







                # 횟수 카운트 관련 코드
                # -------------------------------------- COMPUTE COUNTERS --------------------------------------
                # 현재 상태가 s1인 경우
                if current_state == 's1':
                    # 올바른 스쿼트 카운트
                    if len(self.state_tracker['state_seq']) == 3 and not self.state_tracker['INCORRECT_POSTURE']:
                        self.state_tracker['SQUAT_COUNT']+=1
                    # 잘못된 스쿼트 카운트    
                    elif 's2' in self.state_tracker['state_seq'] and len(self.state_tracker['state_seq'])==1:
                        self.state_tracker['IMPROPER_SQUAT']+=1

                    elif self.state_tracker['INCORRECT_POSTURE']:
                        self.state_tracker['IMPROPER_SQUAT']+=1
                        
                    # 변수 초기화
                    self.state_tracker['state_seq'] = []
                    self.state_tracker['INCORRECT_POSTURE'] = False


                # ----------------------------------------------------------------------------------------------------

                # -------------------------------------- PERFORM FEEDBACK ACTIONS --------------------------------------
                # 현재 상태가 s1이 아닌 경우
                else:
                    # 엉덩이 수직 각도가 범위 임계값 상한값보다 큰 경우 텍스트 리스트의 첫번째 텍스트가 표시되게 설정.
                    if hip_vertical_angle > self.thresholds['HIP_THRESH'][1]:
                        self.state_tracker['DISPLAY_TEXT'][0] = True
                        
                    # 엉덩이 수직 각도가 범위 임계값 하한값보다 작고, 상태 시퀀스가 s2에 포함된 경우 텍스트 리스트의 두 번째 요소가 표시되게 설정.
                    elif hip_vertical_angle < self.thresholds['HIP_THRESH'][0] and \
                         self.state_tracker['state_seq'].count('s2')==1:
                            self.state_tracker['DISPLAY_TEXT'][1] = True
                        
                                        
                    # 무릎 수직 각도가 범위 임계값 하한값과 상한값 사이에 있으며, 상태 시퀀스가 s2에 포함된 경우 LOWER_HIPS 라는 텍스트가 표시되게 설정.
                    if self.thresholds['KNEE_THRESH'][0] < knee_vertical_angle < self.thresholds['KNEE_THRESH'][1] and \
                       self.state_tracker['state_seq'].count('s2')==1:
                        self.state_tracker['LOWER_HIPS'] = True

                    # 무릎 수직 각도가 범위 임계값 상한값보다 큰 경우, 텍스트 리스트의 세번째 요소가 표시되게 설정하고 올바른 자세로 설정.
                    elif knee_vertical_angle > self.thresholds['KNEE_THRESH'][2]:
                        self.state_tracker['DISPLAY_TEXT'][3] = True
                        self.state_tracker['INCORRECT_POSTURE'] = True

                    # 발목 수직 각도가 범위보다 큰 경우, 텍스트 리스트의 네번째 요소를 표시되게 설정, 올바른 자세로 설정
                    if (ankle_vertical_angle > self.thresholds['ANKLE_THRESH']):
                        self.state_tracker['DISPLAY_TEXT'][2] = True
                        self.state_tracker['INCORRECT_POSTURE'] = True


                # ----------------------------------------------------------------------------------------------------


                
                
                
                
                
                # ----------------------------------- COMPUTE INACTIVITY ---------------------------------------------
                # 비활동 시간 계산
                display_inactivity = False
                # 현재 상태와 이전 상태가 동일한 경우
                if self.state_tracker['curr_state'] == self.state_tracker['prev_state']:
                    # 현재 시간을 가져와 상태 업데이트
                    end_time = time.perf_counter()
                    self.state_tracker['INACTIVE_TIME'] += end_time - self.state_tracker['start_inactive_time']
                    self.state_tracker['start_inactive_time'] = end_time
                    
                    # 멈춰있는 상태가 멈춰있는 상태 임계값을 초과하면 스쿼트 카운트들을 초기화 하고 비활동 상태로 설정
                    if self.state_tracker['INACTIVE_TIME'] >= self.thresholds['INACTIVE_THRESH']:
                        self.state_tracker['SQUAT_COUNT'] = 0
                        self.state_tracker['IMPROPER_SQUAT'] = 0
                        display_inactivity = True

                # 그렇지 않은 경우
                else:
                    # 현재 시간을 초기화 
                    self.state_tracker['start_inactive_time'] = time.perf_counter()
                    self.state_tracker['INACTIVE_TIME'] = 0.0

                # -------------------------------------------------------------------------------------------------------
              

                # 텍스트 좌표 계산
                hip_text_coord_x = hip_coord[0] + 10
                knee_text_coord_x = knee_coord[0] + 15
                ankle_text_coord_x = ankle_coord[0] + 10
                
                # 프레임 뒤집은 경우, 택스트 좌표 번대로 설정
                if self.flip_frame:
                    frame = cv2.flip(frame, 1)
                    hip_text_coord_x = frame_width - hip_coord[0] + 10
                    knee_text_coord_x = frame_width - knee_coord[0] + 15
                    ankle_text_coord_x = frame_width - ankle_coord[0] + 10

                
                
                if 's3' in self.state_tracker['state_seq'] or current_state == 's1':
                    self.state_tracker['LOWER_HIPS'] = False

                self.state_tracker['COUNT_FRAMES'][self.state_tracker['DISPLAY_TEXT']]+=1

                # 피드백 시각화
                frame = self._show_feedback(frame, self.state_tracker['COUNT_FRAMES'], self.FEEDBACK_ID_MAP, self.state_tracker['LOWER_HIPS'])


                # 비활동 시간에 대한 처리
                if display_inactivity:
                    # cv2.putText(frame, 'Resetting COUNTERS due to inactivity!!!', (10, frame_height - 20), self.font, 0.5, self.COLORS['blue'], 2, lineType=self.linetype)
                    self.state_tracker['start_inactive_time'] = time.perf_counter()
                    self.state_tracker['INACTIVE_TIME'] = 0.0

                # 프레임에 엉덩이, 무릎, 발목의  수직 각도를 나타내는 텍스트 표시
                cv2.putText(frame, str(int(hip_vertical_angle)), (hip_text_coord_x, hip_coord[1]), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)
                cv2.putText(frame, str(int(knee_vertical_angle)), (knee_text_coord_x, knee_coord[1]+10), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)
                cv2.putText(frame, str(int(ankle_vertical_angle)), (ankle_text_coord_x, ankle_coord[1]), self.font, 0.4, self.COLORS['light_green'], 2, lineType=cv2.LINE_4)

                # 올바른 스쿼트 카운트 정보 표시
                draw_text(
                    frame, 
                    "CORRECT: " + str(self.state_tracker['SQUAT_COUNT']), 
                    pos=(int(frame_width*0.68), 30),
                    text_color=(255, 255, 230),
                    font_scale=0.7,
                    text_color_bg=(18, 185, 0)
                )  
                
                # 잘못된 스쿼트 카운트 정보 표시
                draw_text(
                    frame, 
                    "INCORRECT: " + str(self.state_tracker['IMPROPER_SQUAT']), 
                    pos=(int(frame_width*0.68), 80),
                    text_color=(255, 255, 230),
                    font_scale=0.7,
                    text_color_bg=(221, 0, 0),
                    
                )  
                
                # 초기화
                self.state_tracker['DISPLAY_TEXT'][self.state_tracker['COUNT_FRAMES'] > self.thresholds['CNT_FRAME_THRESH']] = False
                self.state_tracker['COUNT_FRAMES'][self.state_tracker['COUNT_FRAMES'] > self.thresholds['CNT_FRAME_THRESH']] = 0    
                self.state_tracker['prev_state'] = current_state
                                  

       
        # 아니면 이전 상태를 현재 상태로 업데이트
        else:

            if self.flip_frame:
                frame = cv2.flip(frame, 1)

            end_time = time.perf_counter()
            self.state_tracker['INACTIVE_TIME'] += end_time - self.state_tracker['start_inactive_time']

            display_inactivity = False

            if self.state_tracker['INACTIVE_TIME'] >= self.thresholds['INACTIVE_THRESH']:
                self.state_tracker['SQUAT_COUNT'] = 0
                self.state_tracker['IMPROPER_SQUAT'] = 0
                # cv2.putText(frame, 'Resetting SQUAT_COUNT due to inactivity!!!', (10, frame_height - 25), self.font, 0.7, self.COLORS['blue'], 2)
                display_inactivity = True

            self.state_tracker['start_inactive_time'] = end_time

            draw_text(
                    frame, 
                    "CORRECT: " + str(self.state_tracker['SQUAT_COUNT']), 
                    pos=(int(frame_width*0.68), 30),
                    text_color=(255, 255, 230),
                    font_scale=0.7,
                    text_color_bg=(18, 185, 0)
                )  
                

            draw_text(
                    frame, 
                    "INCORRECT: " + str(self.state_tracker['IMPROPER_SQUAT']), 
                    pos=(int(frame_width*0.68), 80),
                    text_color=(255, 255, 230),
                    font_scale=0.7,
                    text_color_bg=(221, 0, 0),
                )  

            if display_inactivity:
                self.state_tracker['start_inactive_time'] = time.perf_counter()
                self.state_tracker['INACTIVE_TIME'] = 0.0
            
            
            # Reset all other state variables
            
            self.state_tracker['prev_state'] =  None
            self.state_tracker['curr_state'] = None
            self.state_tracker['INACTIVE_TIME_FRONT'] = 0.0
            self.state_tracker['INCORRECT_POSTURE'] = False
            self.state_tracker['DISPLAY_TEXT'] = np.full((5,), False)
            self.state_tracker['COUNT_FRAMES'] = np.zeros((5,), dtype=np.int64)
            self.state_tracker['start_inactive_time_front'] = time.perf_counter()
            
            
        return frame

                    