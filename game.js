// キャンバスとコンテキストの設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲーム変数
let score = 0;
let lives = 3;
let gameRunning = false;
let baseSpeed = 5; // ボールの基本速度

// ボールの設定
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: baseSpeed,
    dy: -baseSpeed,
    radius: 10
};

// パドルの設定
const paddle = {
    width: 100,
    height: 15,
    x: (canvas.width - 100) / 2,
    speed: 8
};

// ブロックの設定
const brickRowCount = 5;
const brickColumnCount = 10;
const brickWidth = 65;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 30;

// ブロック配列の初期化
let bricks = [];
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// キー入力の状態
const keys = {
    right: false,
    left: false
};

// キーダウンイベントリスナー
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        keys.right = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        keys.left = true;
    }
});

// キーアップイベントリスナー
document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        keys.right = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        keys.left = false;
    }
});

// ボタンイベントリスナー
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('resetButton').addEventListener('click', resetGame);

// ボール速度スライダーのイベントリスナー
const ballSpeedSlider = document.getElementById('ballSpeed');
const speedValueText = document.getElementById('speedValue');

ballSpeedSlider.addEventListener('input', (e) => {
    const speedValue = parseInt(e.target.value);
    speedValueText.textContent = speedValue;
    updateBallSpeed(speedValue);
});

// ボールの速度を更新する関数
function updateBallSpeed(speedValue) {
    baseSpeed = speedValue;
    
    // 現在の方向を維持しながら速度を変更
    const dirX = ball.dx > 0 ? 1 : -1;
    const dirY = ball.dy > 0 ? 1 : -1;
    
    ball.dx = dirX * baseSpeed;
    ball.dy = dirY * baseSpeed;
}

// ボールの描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// パドルの描画
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// ブロックの描画
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                
                // 行ごとに色を変える
                const colors = ['#FF6347', '#FF8C00', '#FFD700', '#32CD32', '#1E90FF'];
                ctx.fillStyle = colors[r];
                
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// スコアの描画
function drawScore() {
    document.getElementById('scoreValue').textContent = score;
}

// 衝突検出
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ball.x > b.x &&
                    ball.x < b.x + brickWidth &&
                    ball.y > b.y &&
                    ball.y < b.y + brickHeight
                ) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    drawScore();
                    
                    // すべてのブロックが消えたかチェック
                    let allBricksGone = true;
                    for (let c = 0; c < brickColumnCount; c++) {
                        for (let r = 0; r < brickRowCount; r++) {
                            if (bricks[c][r].status === 1) {
                                allBricksGone = false;
                                break;
                            }
                        }
                        if (!allBricksGone) break;
                    }
                    
                    if (allBricksGone) {
                        alert('おめでとう！すべてのブロックを崩しました！');
                        resetGame();
                    }
                }
            }
        }
    }
}

// ゲームスタート
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        draw();
    }
}

// ゲームリセット
function resetGame() {
    gameRunning = false;
    score = 0;
    lives = 3;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    
    // スライダーの現在の値を使用してボールの初期速度を設定
    const speedValue = parseInt(ballSpeedSlider.value);
    ball.dx = speedValue;
    ball.dy = -speedValue;
    
    paddle.x = (canvas.width - paddle.width) / 2;
    initBricks();
    drawScore();
    draw();
}

// メインの描画処理
function draw() {
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 要素の描画
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    
    // 衝突検出
    collisionDetection();
    
    // 壁との衝突処理
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // パドルとの衝突チェック
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            // パドルの位置に応じて反射角度を変える
            const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            ball.dx = hitPoint * (baseSpeed * 1.5); // baseSpeedに基づいて調整
            ball.dy = -Math.abs(ball.dy); // 常に上向きに反射
        } else {
            // ゲームオーバー
            lives--;
            if (lives <= 0) {
                alert('ゲームオーバー！スコア: ' + score);
                resetGame();
                return;
            } else {
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                const speedValue = parseInt(ballSpeedSlider.value);
                ball.dx = speedValue;
                ball.dy = -speedValue;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        }
    }
    
    // パドルの移動
    if (keys.right && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (keys.left && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    
    // ボールの移動
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // ゲームが続いていれば次のフレームを描画
    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

// 初期化処理
initBricks();
draw();