import cv2
import mediapipe as mp
import numpy as np
from PIL import ImageFont, ImageDraw, Image

# 이미지에 둥근 사각형을 그리는 함수
def draw_rounded_rect(img, rect_start, rect_end, corner_width, box_color):

    x1, y1 = rect_start
    x2, y2 = rect_end
    w = corner_width

    # draw filled rectangles 
    cv2.rectangle(img, (x1 + w, y1), (x2 - w, y1 + w), box_color, -1)
    cv2.rectangle(img, (x1 + w, y2 - w), (x2 - w, y2), box_color, -1)
    cv2.rectangle(img, (x1, y1 + w), (x1 + w, y2 - w), box_color, -1)
    cv2.rectangle(img, (x2 - w, y1 + w), (x2, y2 - w), box_color, -1)
    cv2.rectangle(img, (x1 + w, y1 + w), (x2 - w, y2 - w), box_color, -1)

    # draw filled ellipses
    cv2.ellipse(img, (x1 + w, y1 + w), (w, w),
                angle=0, startAngle=-90, endAngle=-180, color=box_color, thickness=-1)

    cv2.ellipse(img, (x2 - w, y1 + w), (w, w),
                angle=0, startAngle=0, endAngle=-90, color=box_color, thickness=-1)

    cv2.ellipse(img, (x1 + w, y2 - w), (w, w),
                angle=0, startAngle=90, endAngle=180, color=box_color, thickness=-1)

    cv2.ellipse(img, (x2 - w, y2 - w), (w, w),
                angle=0, startAngle=0, endAngle=90, color=box_color, thickness=-1)

    return img


# 이미지에 점선을 그리는 함수
def draw_dotted_line(frame, lm_coord, start, end, line_color):
    pix_step = 0

    for i in range(start, end+1, 8):
        cv2.circle(frame, (lm_coord[0], i+pix_step),
                1, line_color, -1, lineType=cv2.LINE_AA)

    return frame

# 이미지에 텍스트를 그리는 함수
def draw_text(
    img,
    msg,
    width=8,
    font=cv2.FONT_HERSHEY_SIMPLEX,
    pos=(0, 0),
    font_scale=1,
    font_thickness=1,
    text_color=(0, 255, 0),
    text_color_bg=(0, 0, 0),
    box_offset=(18, 8),
):

    offset = box_offset
    x, y = pos
    text_size, _ = cv2.getTextSize(msg, font, font_scale, font_thickness)
    text_w, text_h = text_size
    rec_start = tuple(p - o for p, o in zip(pos, offset))
    rec_end = tuple(m + n - o for m, n,
                    o in zip((x + text_w, y + text_h), offset, (25, 0)))

    img = draw_rounded_rect(img, rec_start, rec_end, width, text_color_bg)

    cv2.putText(
        img,
        msg,
        (int(rec_start[0] + 6), int(y + text_h + font_scale - 1)),
        font,
        font_scale,
        text_color,
        font_thickness,
        cv2.LINE_AA,
    )

    return text_size

def draw_text_kor(frame, text, pos, text_color, text_color_bg):
    
    # `frame` 배열을 `uint8` 형식으로 변환합니다.
    frame = frame.astype('uint8')
    pil_image = Image.fromarray(frame)
    draw = ImageDraw.Draw(pil_image)
    # `NanumGothic.ttf` 폰트를 사용하여 폰트 객체를 생성합니다.
    font = ImageFont.truetype('AI/fonts/NanumGothic.ttf', size=30)
    draw.text(pos, text, fill=(255, 255, 230), font=font)
    return np.array(pil_image)


# 두 점 사이의 각도를 계산하는 함수
def find_angle(p1, p2, ref_pt=np.array([0, 0])):
    p1_ref = p1 - ref_pt
    p2_ref = p2 - ref_pt

    cos_theta = (np.dot(p1_ref, p2_ref)) / \
        (1.0 * np.linalg.norm(p1_ref) * np.linalg.norm(p2_ref))
    theta = np.arccos(np.clip(cos_theta, -1.0, 1.0))

    degree = int(180 / np.pi) * theta

    return int(degree)

def hip_find_angle(pt1, pt2, pt3):
    # pt1에서 pt2로, pt1에서 pt3로 향하는 벡터를 계산합니다.
    vector12 = np.array([pt1[0]-pt2[0], pt1[1]-pt2[1]])
    vector13 = np.array([pt1[0]-pt3[0], pt1[1]-pt3[1]])

    # 이 두 벡터 사이의 각도의 코사인 값을 계산합니다.
    cos_angle = np.dot(vector12, vector13) / (np.linalg.norm(vector12) * np.linalg.norm(vector13))

    # 이 값을 각도로 변환합니다(단위: 도).
    angle = np.degrees(np.arccos(cos_angle))

    return angle

# 미디어파이프에서 반환된 랜드마크 좌표를 이미지의 실제 좌표로 변환하는 함수
def get_landmark_array(pose_landmark, key, frame_width, frame_height):

    denorm_x = int(pose_landmark[key].x * frame_width)
    denorm_y = int(pose_landmark[key].y * frame_height)

    return np.array([denorm_x, denorm_y])


# 랜드마크 결과와 랜드마크 기능 사전, 기능, 프레임의 너비와 높이를 입력받아 해당 기능의 좌표를 반환하는 함수.
def get_landmark_features(kp_results, dict_features, feature, frame_width, frame_height):

    if feature == 'nose':
        return get_landmark_array(kp_results, dict_features[feature], frame_width, frame_height)

    elif feature == 'left' or 'right':
        shldr_coord = get_landmark_array(
            kp_results, dict_features[feature]['shoulder'], frame_width, frame_height)
        elbow_coord = get_landmark_array(
            kp_results, dict_features[feature]['elbow'], frame_width, frame_height)
        wrist_coord = get_landmark_array(
            kp_results, dict_features[feature]['wrist'], frame_width, frame_height)
        hip_coord = get_landmark_array(
            kp_results, dict_features[feature]['hip'], frame_width, frame_height)
        knee_coord = get_landmark_array(
            kp_results, dict_features[feature]['knee'], frame_width, frame_height)
        ankle_coord = get_landmark_array(
            kp_results, dict_features[feature]['ankle'], frame_width, frame_height)
        foot_coord = get_landmark_array(
            kp_results, dict_features[feature]['foot'], frame_width, frame_height)

        return shldr_coord, elbow_coord, wrist_coord, hip_coord, knee_coord, ankle_coord, foot_coord

    else:
        raise ValueError("feature needs to be either 'nose', 'left' or 'right")

# 미디어파이프의 포즈 모듈 생성 함수
def get_mediapipe_pose(
    static_image_mode=False,
    model_complexity=1,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5

):
    pose = mp.solutions.pose.Pose(
        static_image_mode=static_image_mode,
        model_complexity=model_complexity,
        smooth_landmarks=smooth_landmarks,
        min_detection_confidence=min_detection_confidence,
        min_tracking_confidence=min_tracking_confidence
    )
    return pose