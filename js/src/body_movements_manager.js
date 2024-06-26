const Pose = {
  NORMAL: 'NORMAL',
  JUMPING: 'JUMPING',
  CROUCHING: 'CROUCHING'
};

const CameraSection = {
  COMPLETE: 'COMPLETE',
  BOTTOM: 'BOTTOM',
};

class BodyMovementsManager {
  constructor() {
    this.model = poseDetection.SupportedModels.MoveNet;
    this.detector = null;
    this.webcam = null;
    this.canvas = null;
    this.state = Pose.NORMAL;
    this.prevPose = null;
    this.leftBoundary = null;
    this.rightBoundary = null;
    this.jumpThreshold = null;

    this.cameraSection = null;
    
    this.requiredKeypoints = {
      [CameraSection.COMPLETE]: ["left_ankle", "right_ankle", "left_hip", "right_hip", "left_knee", "right_knee", "left_shoulder", "right_shoulder"],
      [CameraSection.BOTTOM]: ["left_ankle", "right_ankle", "left_hip", "right_hip", "left_knee", "right_knee"]
    };
    this.keypointsToDraw = {
      [CameraSection.COMPLETE]: ['left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_ankle', 'right_ankle'],
      [CameraSection.BOTTOM]: ["left_ankle", "right_ankle", "left_hip", "right_hip", "left_knee", "right_knee"]
    }
    this.init();
  }
  setCameraSection(cameraSection) {
    console.log("Set camera section to " + cameraSection);
    this.cameraSection = cameraSection;
  }
  getCameraSection() {
    return this.cameraSection;
  }
  getKeypointsToDraw() {
    return this.keypointsToDraw[this.cameraSection];
  }
  getRequiredKeypoints() {
    return this.requiredKeypoints[this.cameraSection];
  }
  init() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.webcam = document.getElementById('webcam');
        this.webcam.srcObject = stream;
        //check when its loaded
        this.webcam.onloadedmetadata = () => {
          this.canvas = document.getElementById('canvas');
          const ratio = this.webcam.videoWidth / this.webcam.videoHeight;
          this.canvas.width = this.canvas.height * ratio;
        };

        console.log('WEBCAM INITIALIZED')
      })
      .catch((err) => {
        console.log(err);
      });

    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      minPoseScore: 0.3
    };

    poseDetection.createDetector(this.model, detectorConfig).then(detector => {
      this.detector = detector;
      console.log('DETECTOR INITIALIZED')
    }).catch(err => {
      console.log(err);
      console.log("DETECTOR NOT INITIALIZED (ERROR)");
    });
  }

  setFullScreen() {
    this.webcam.classList.remove('minimize');
    this.webcam.classList.add('fullscreen');

    this.canvas.classList.remove('minimize');
    this.canvas.classList.add('fullscreen');
  }

  resetFullScreen() {
    this.webcam.classList.remove('fullscreen');
    this.webcam.classList.add('minimize');

    this.canvas.classList.remove('fullscreen');
    this.canvas.classList.add('minimize');
  }


  pointsExist(pose, keypoints_names) {
    const poseKeypointNames = pose.keypoints.map(keypoint => keypoint.name);
    return keypoints_names.every(name => poseKeypointNames.includes(name));
  }

  getKeypointFromPose(pose, keypointName) {
    if(pose == undefined) return;
    if(!pose.keypoints) return;
    if(pose && pose.keypoints){
      return pose.keypoints.find(keypoint => keypoint.name === keypointName);
    }
  }


  getKeypoint(keypointName) {
    if(!this.prevPose) return;
    return this.getKeypointFromPose(this.prevPose, keypointName)
  }

  averageYPointsKeypoints(pose, keypoints) {
    const sum = keypoints.reduce((acc, keypointName) => {
      const keypoint = this.getKeypointFromPose(pose, keypointName);
      if(!keypoint) return acc;
      return acc + keypoint.y;
    }, 0);

    return sum / pose.keypoints.length;
  }
  averageYpoints(pose) {
    switch (this.cameraSection) {
      case CameraSection.BOTTOM:
        return this.averageYPointsKeypoints(pose, ["left_hip", "right_hip", "left_knee", "right_knee"]);
      case CameraSection.COMPLETE:
        return this.averageYPointsKeypoints(pose, ["nose", "left_eye", "right_eye", "left_ear", "right_ear", "left_shoulder", "right_shoulder", "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle"]);
      default:
        console.error("Unknown camera section " + this.cameraSection);
        break;
    }
  }

  isCrouching(pose){
    const middle = this.averageYpoints(pose);
    return middle > this.crouchingThreshold;
  }

  isJumping(currentPose) {
    if(!this.prevPose) return false;
    const prevAnkleLeft = this.getKeypointFromPose(this.prevPose, "left_ankle");
    const prevAnkleRight = this.getKeypointFromPose(this.prevPose, "right_ankle");
    const currentAnkleLeft = this.getKeypointFromPose(currentPose, "left_ankle");
    const currentAnkleRight = this.getKeypointFromPose(currentPose, "right_ankle");

    return (prevAnkleLeft.y - currentAnkleLeft.y) > this.jumpThreshold && (prevAnkleRight.y - currentAnkleRight.y) > this.jumpThreshold;
  }

  enoughConfidence(keypointNames, threshold) {
    const pose = this.prevPose;
    if(!pose) return false;

    // Verify if all keypoints have better score than threshold
    return keypointNames.every(keypointName => {
      const keypoint = this.getKeypointFromPose(pose, keypointName);
      return keypoint.score > threshold;
    });
  }

  isPoseT(keypointNames) {
    const threshold = 0.3;
    if (!this.enoughConfidence(keypointNames, threshold)) {
      return false;
    }
    const pose = this.prevPose;

    // Verifiy if arms are straight;
    // get min and max y of all keypoints
    const armKeypoints = ["left_shoulder", "right_shoulder", "left_wrist", "right_wrist", "left_elbow", "right_elbow"];
    const keypoints = armKeypoints.map(keypointName => this.getKeypointFromPose(pose, keypointName));
    const minY = Math.min(...keypoints.map(keypoint => keypoint.y));
    const maxY = Math.max(...keypoints.map(keypoint => keypoint.y));
    const variation = 30;
    
    const armsCondition = (maxY - minY) < variation;
    return armsCondition;
  }

  clearCanvas() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGraySides() {
    const widthProportion = this.canvas.width / this.webcam.videoWidth;
    const ctx = this.canvas.getContext('2d');

    ctx.beginPath();
    ctx.rect(0, 0, this.rightBoundary * widthProportion, this.canvas.height);
    ctx.rect(this.leftBoundary * widthProportion, 0, this.canvas.width - this.leftBoundary * widthProportion, this.canvas.height);
    ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
    ctx.fill();
  }

  drawKeypoints(pose) {
    this.clearCanvas();
    
    const heightProportion = this.canvas.height / this.webcam.videoHeight;
    const widthProportion = this.canvas.width / this.webcam.videoWidth;
    const ctx = this.canvas.getContext('2d');

    const keypointsToDraw = this.getKeypointsToDraw();
    keypointsToDraw.forEach(keypointName => {
      const kp = this.getKeypointFromPose(pose, keypointName);
      if(!kp) return;
      ctx.beginPath();
      ctx.arc(kp.x * widthProportion, kp.y * heightProportion, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'green';
      ctx.fill();
    });
  }

  update() {
    if (this.detector) {
      this.detector.estimatePoses(this.webcam).then(poses => {
        const pose = poses[0];
        if(!pose || !pose.keypoints) return;
        this.drawKeypoints(pose);
        this.drawGraySides();

        //pose.keypoints = pose.keypoints.filter(keypoint => keypoint.score >= 0.30);

        // Check if jumping
        if (this.isJumping(pose) && this.state == Pose.NORMAL) {
          this.state = Pose.JUMPING;
          input.setKey('space', true);
        }
        if(!this.isJumping(pose) && this.state == Pose.JUMPING){
          this.state = Pose.NORMAL;
          input.setKey('space', false);
        }

        // Check if crouching
        if (this.isCrouching(pose) && this.state == Pose.NORMAL && !this.isJumping(pose)) {
          this.state = Pose.CROUCHING;
          input.setKey('down', true);
        }
        if(!this.isCrouching(pose) && this.state == Pose.CROUCHING){
          this.state = Pose.NORMAL;
          input.setKey('down', false);
        }

        this.strafe(pose);


        this.prevPose = pose;
      });
    }
  }

  calibrationUpdate() {
    // print object istance id
    if(this.detector){
      this.detector.estimatePoses(this.webcam).then(poses => {
        const pose = poses[0];
        if(!pose || !pose.keypoints) return;
        this.drawKeypoints(pose);
        this.prevPose = pose;
      });
    }
  }

  setBounds(left=null, right=null){
    if (left == null || right == null) {
      this.leftBoundary = this.webcam.videoWidth * 3 / 4;
      this.rightBoundary = this.webcam.videoWidth / 4;
    }
    else {
      this.leftBoundary = left;
      this.rightBoundary = right;
    }
    console.log("Bounds set", this.leftBoundary, this.rightBoundary);
  }

  setJumpThreshold(threshold){
    this.jumpThreshold = threshold;
  }
  setCrouchThreshold(threshold) {
    this.crouchingThreshold = threshold;
  }

  strafe(pose) {
    // get middle point between feet
    const leftAnkle = this.getKeypointFromPose(pose, "left_ankle");
    const rightAnkle = this.getKeypointFromPose(pose, "right_ankle");
    

    if(!leftAnkle || !rightAnkle) return;

  
    const leftBoundary = this.leftBoundary ? this.leftBoundary : this.webcam.videoWidth / 4;
    const rightBoundary = this.rightBoundary ? this.rightBoundary : 3 * this.webcam.videoWidth / 4 ;

    const playableWidth = leftBoundary - rightBoundary;

    const middlePoint = (leftAnkle.x + rightAnkle.x) / 2;

    let position =  (middlePoint - rightBoundary) / (playableWidth);


    // left boundary = 250
    // 500
    // right boundary = 750
    // maxwidth 1000
    
    // if is left moveToPosition = 0
    // if middle  = 0.5
    // if is right moveToPosition = 1

    if(position < 0){
      position = 0;
    } else if (position > 1){
      position = 1;
    }

    player.moveToPosition = position; // TODO:: improve
    
  }
}