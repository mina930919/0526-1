let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = '';
let circleIndex = 0; // 用於控制圓圈移動的索引
let circleTimer = 0; // 用於控制圓圈移動的時間

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 facemesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 handpose
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture();
  });
}

function modelReady() {
  console.log('模型載入完成');
}

function draw() {
  image(video, 0, 0, width, height);

  // 繪製臉部辨識結果
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 定義臉部的關鍵點
    const facePoints = [
      keypoints[10], // 額頭
      keypoints[33], // 左眼
      keypoints[263], // 右眼
      keypoints[234], // 左臉頰
      keypoints[454] // 右臉頰
    ];

    // 每隔一段時間移動圓圈
    if (millis() - circleTimer > 1000) { // 每 1 秒移動一次
      circleIndex = (circleIndex + 1) % facePoints.length;
      circleTimer = millis();
    }

    // 繪製移動的圓圈
    drawCircle(facePoints[circleIndex], [255, 0, 0], 25);
  }

  // 顯示手勢辨識結果
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(gesture, width / 2, height - 50);
}

function drawCircle(point, color, size = 20) {
  const [x, y] = point;
  noFill();
  stroke(...color);
  strokeWeight(4);
  ellipse(x, y, size, size);
}

function detectGesture() {
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 簡單判斷剪刀、石頭、布
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const distanceThumbIndex = dist(
      thumbTip[0],
      thumbTip[1],
      indexTip[0],
      indexTip[1]
    );
    const distanceIndexMiddle = dist(
      indexTip[0],
      indexTip[1],
      middleTip[0],
      middleTip[1]
    );

    if (distanceThumbIndex < 50 && distanceIndexMiddle < 50) {
      gesture = '石頭';
    } else if (distanceThumbIndex > 50 && distanceIndexMiddle > 50) {
      gesture = '剪刀';
    } else {
      gesture = '布';
    }
  }
}
