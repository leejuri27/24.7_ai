# 스쿼트 자세 범위
def thresholds_squat():

    _ANGLE_HIP_KNEE_VERT = {
                            'NORMAL' : (165, 180),
                            'TRANS'  : (120, 160),
                            'PASS'   : (0, 120)
                        }    

    thresholds = {
                    'HIP_KNEE_VERT': _ANGLE_HIP_KNEE_VERT,

                    'OFFSET_THRESH'    : 35.0
                }

    return thresholds

# 런지 자세 범위
def thresholds_lunge():

    _ANGLE_HIP_BACK_KNEE = {
                            'NORMAL' : (115, 180),
                            # 'TRANS'  : (100 , 140),
                            'PASS'   : (0, 110)
                        }     
        
    thresholds = {
                    'HIP_BACK_KNEE_VERT': _ANGLE_HIP_BACK_KNEE,

                    'OFFSET_THRESH'    : 35.0,
                }
                
    return thresholds

# 푸쉬업 자세 범위
def thresholds_pushup():

    _ANGLE_SHLDR_ELBOW_VERT = {
                            'NORMAL' : (0,  18),
                            'PASS'  : (20, 120)
                        }    
        
    thresholds = {
                    'SHLDR_ELBOW_VERT': _ANGLE_SHLDR_ELBOW_VERT,

                    'OFFSET_THRESH'    : 35.0
                }
                
    return thresholds