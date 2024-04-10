/**
 * Player class.
 * @type {CalibrationManager}
 */

class CalibrationManager {
    
    constructor() {
        this.isCalibrated = false;    
        this.timeLeft = 0.5;
    }

    canPlay(){
        return this.isCalibrated;
    }
    listenToKeyPress() {
        input.addKeyCallback('enter', 'justPressed', () => {
            console.log("Pressed enter");
            if (!this.isCalibrated) {
                this.finishCalibration();
            }
        });
    }
    update(timeDelta){
        if (!this.isCalibrated){
            webcam_input.calibrationUpdate();

            switch (webcam_input.getCameraSection()) {
                case CameraSection.BOTTOM:
                    // const isInCorrectPosition = webcam_input.isCalibrationPose(["left_ankle", "right_ankle", "left_hip", "right_hip", "left_knee", "right_knee"]);
                    break;
                case CameraSection.COMPLETE:
                    const isInCorrectPosition = webcam_input.isPoseT(['left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow']);

                    // Check if required number of samples have been collected
                    if (isInCorrectPosition){
                        this.timeLeft -= timeDelta;
                        if (this.timeLeft <= 0){
                            this.finishCalibration();
                        }
                    } else {
                        this.timeLeft = 0.5; // 2 seconds
                    }    
                    break;
            }
        }
    }

    finishCalibrationComplete() {
        this.isCalibrated = true;
        
        // Get left and right arm x positions
        const leftWrist = webcam_input.getKeypoint('left_wrist');
        const rightWrist = webcam_input.getKeypoint('right_wrist');

        const leftHip = webcam_input.getKeypoint('left_hip');
        const rightHip = webcam_input.getKeypoint('right_hip');
        const leftKnee = webcam_input.getKeypoint('left_knee');
        const rightKnee = webcam_input.getKeypoint('right_knee');
        const leftAnkle = webcam_input.getKeypoint('left_ankle');
        const rightAnkle = webcam_input.getKeypoint('right_ankle');

        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
            this.isCalibrated = false;
            return;
        }
        const nose = webcam_input.getKeypoint('nose');
        const middleAnkle = (leftAnkle.y + rightAnkle.y) / 2;
        const personHeight = middleAnkle - nose.y;

        const avg = Math.abs((leftKnee.y - leftAnkle.y + rightKnee.y - rightAnkle.y) / 2)
        const femurLength = Math.abs((leftHip.y - leftKnee.y) + (rightHip.y - rightKnee.y) / 2)
       
        // console.log("Calibration finished", leftWrist, rightWrist);

        webcam_input.setBounds(leftWrist.x, rightWrist.x);
        webcam_input.setJumpThreshold(avg / 15);
        const middle = webcam_input.averageYpoints(webcam_input.prevPose);
        webcam_input.setCrouchThreshold(middle * 1.15)
    }
    finishCalibrationBottom() {
        this.isCalibrated = true;

        const leftHip = webcam_input.getKeypoint('left_hip');
        const rightHip = webcam_input.getKeypoint('right_hip');
        const leftKnee = webcam_input.getKeypoint('left_knee');
        const rightKnee = webcam_input.getKeypoint('right_knee');
        const leftAnkle = webcam_input.getKeypoint('left_ankle');
        const rightAnkle = webcam_input.getKeypoint('right_ankle');

        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
            this.isCalibrated = false;
            return;
        }
        const middleAnkle = (leftAnkle.y + rightAnkle.y) / 2;

        const avg = Math.abs((leftKnee.y - leftAnkle.y + rightKnee.y - rightAnkle.y) / 2)
        const femurLength = Math.abs((leftHip.y - leftKnee.y) + (rightHip.y - rightKnee.y) / 2)

        // console.log("Calibration finished", leftWrist, rightWrist);

        webcam_input.setBounds();
        webcam_input.setJumpThreshold(avg / 10);
        const middle = webcam_input.averageYpoints(webcam_input.prevPose);
        webcam_input.setCrouchThreshold(middle * 1.1);
    }
    finishCalibration() {
        this.isCalibrated = true;

        // Get left and right arm x positions
        const leftWrist = webcam_input.getKeypoint('left_wrist');
        const rightWrist = webcam_input.getKeypoint('right_wrist');

        const leftHip = webcam_input.getKeypoint('left_hip');
        const rightHip = webcam_input.getKeypoint('right_hip');
        const leftKnee = webcam_input.getKeypoint('left_knee');
        const rightKnee = webcam_input.getKeypoint('right_knee');
        const leftAnkle = webcam_input.getKeypoint('left_ankle');
        const rightAnkle = webcam_input.getKeypoint('right_ankle');

        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
            this.isCalibrated = false;
            return;
        }
        const nose = webcam_input.getKeypoint('nose');
        const middleAnkle = (leftAnkle.y + rightAnkle.y) / 2;
        const personHeight = middleAnkle - nose.y;

        const avg = Math.abs((leftKnee.y - leftAnkle.y + rightKnee.y - rightAnkle.y) / 2)
        const femurLength = Math.abs((leftHip.y - leftKnee.y) + (rightHip.y - rightKnee.y) / 2)
       
        // console.log("Calibration finished", leftWrist, rightWrist);

        let middle;
        switch (webcam_input.getCameraSection()) {
            case CameraSection.BOTTOM:
                webcam_input.setBounds();
                webcam_input.setJumpThreshold(avg / 10);
                middle = webcam_input.averageYpoints(webcam_input.prevPose);
                webcam_input.setCrouchThreshold(middle * 1.1);
                break;
            case CameraSection.COMPLETE:
                webcam_input.setBounds(leftWrist.x, rightWrist.x);
                webcam_input.setJumpThreshold(avg / 15);
                middle = webcam_input.averageYpoints(webcam_input.prevPose);
                webcam_input.setCrouchThreshold(middle * 1.15)
                break;
        }
    }

    reset(){
        this.isCalibrated = false;
        this.timeLeft = 0.5;
    }
  }