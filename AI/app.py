import os
import cv2

from utils import get_mediapipe_pose
from process_frame_squat import ProcessFrame as ProcessFrameSquat
from process_frame_lunge import ProcessFrame as ProcessFrameLunge
from process_frame_pushup import ProcessFrame as ProcessFramePushup
from thresholds import thresholds_squat, thresholds_lunge, thresholds_pushup

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 모든 엔드포인트에 대해 CORS를 활성화

# url_path = []
thresholds = None 
pose = get_mediapipe_pose()
output_video_file = f'output_recorded.mp4'
@app.route('/test', methods=['POST', 'GET'])
def test():
    # 업로드된 url, type
    if request.method == 'POST':
        raw_filename = request.json.get('url').split('\\')[-1][:-4]
        url_path = 'C:\\Users\\gjaischool\\Desktop\\24.7\\BackEnd\\nodejs\\' + request.json.get('url') 
        ex_type = request.json.get('type')
        
        output_video_file = f'C:\\Users\\gjaischool\\Desktop\\24.7\\BackEnd\\nodejs\\public\\uploads\\video\\{raw_filename}_0.mp4'
        # print(url_path, ex_type)
        # ------------------------------------------------------
        if url_path and ex_type :

            try:

                vf = cv2.VideoCapture(url_path)

                # ---------------------  Write the processed video frame. --------------------
                fps = int(vf.get(cv2.CAP_PROP_FPS))
                width = int(vf.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(vf.get(cv2.CAP_PROP_FRAME_HEIGHT))
                frame_size = (width, height)
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                video_output = cv2.VideoWriter(output_video_file, fourcc, fps, frame_size)
                # -----------------------------------------------------------------------------

                if ex_type == 'Squat':
                    thresholds = thresholds_squat()
                    upload_process_frame = ProcessFrameSquat(thresholds=thresholds, fps=fps, frame_size=frame_size, file_name=raw_filename )
                elif ex_type == 'Lunge':
                    thresholds = thresholds_lunge()
                    upload_process_frame = ProcessFrameLunge(thresholds=thresholds,fps=fps, frame_size=frame_size, file_name=raw_filename)
                elif ex_type == 'Pushup':
                    thresholds = thresholds_pushup()
                    upload_process_frame = ProcessFramePushup(thresholds=thresholds, fps=fps, frame_size=frame_size, file_name=raw_filename)
                    

                # 영상이 끝날때까지 프레임을 반복해서 읽으며 분석
                while vf.isOpened():
                    ret, frame = vf.read()
                    if not ret:
                        break

                    # 각 프레임에 대한 자세 추정 및 운동 분석
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    out_frame, sep_list, last_file, score_list = upload_process_frame.process(frame, pose)
                    video_output.write(out_frame[...,::-1])
                    

                
                vf.release()
                video_output.release()
                last_file.release()
                os.remove(sep_list[-1])
                
            except AttributeError:
                print('error occured')
                
                
        # node로 보낼 데이터 : 분석된 영상, 전체점수, 분리된 분석 영상, 횟수별 점수 리스트
        # return jsonify({'result':'test'})
        return jsonify({'score': sum(score_list)/len(score_list),
                        'sep_score': score_list,
                        'anly_video_url': f'{raw_filename}_0',
                        'sep_video_url' : 'hmm'})
    
    # ------------------------------------------------------
    
    
if __name__ == '__main__':
    app.debug = True
    app.run()
