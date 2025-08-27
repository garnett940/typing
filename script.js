class JapaneseTypingGame {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.lives = 3;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentEnemy = null;
        this.typedText = '';
        this.difficulty = 'easy'; // 默认初级难度
        this.timeLimit = 15000; // 15秒时间限制（初级）
        this.timeLeft = this.timeLimit;
        this.timer = null;
        
        // 日文词汇库 - 漫威/超人主题
        this.enemies = [
            { name: 'スパイダーマン', image: '🕷️', category: '英雄' },
            { name: 'アイアンマン', image: '🤖', category: '英雄' },
            { name: 'キャプテン', image: '🛡️', category: '英雄' },
            { name: 'ソー', image: '⚡', category: '英雄' },
            { name: 'ハルク', image: '💪', category: '英雄' },
            { name: 'ブラックウィドウ', image: '🕷️', category: '英雄' },
            { name: 'ホークアイ', image: '🏹', category: '英雄' },
            { name: 'スーパーマン', image: '🦸', category: '英雄' },
            { name: 'バットマン', image: '🦇', category: '英雄' },
            { name: 'ワンダーウーマン', image: '👸', category: '英雄' },
            { name: 'フラッシュ', image: '⚡', category: '英雄' },
            { name: 'アクアマン', image: '🌊', category: '英雄' },
            { name: 'グリーンランタン', image: '💚', category: '英雄' },
            { name: 'サイボーグ', image: '🤖', category: '英雄' },
            { name: 'スカーレット', image: '🔴', category: '英雄' },
            { name: 'ビジョン', image: '👁️', category: '英雄' },
            { name: 'ファルコン', image: '🦅', category: '英雄' },
            { name: 'ウィンターソルジャー', image: '❄️', category: '英雄' },
            { name: 'アントマン', image: '🐜', category: '英雄' },
            { name: 'ワスプ', image: '🐝', category: '英雄' },
            { name: 'ドクターストレンジ', image: '🔮', category: '英雄' },
            { name: 'ブラックパンサー', image: '🐆', category: '英雄' },
            { name: 'キャプテンマーベル', image: '⭐', category: '英雄' },
            { name: 'スパイダーグウェン', image: '🕸️', category: '英雄' },
            { name: 'マイルズ', image: '🕷️', category: '英雄' },
            { name: 'デッドプール', image: '💀', category: '英雄' },
            { name: 'ウルヴァリン', image: '🦡', category: '英雄' },
            { name: 'ストーム', image: '⛈️', category: '英雄' },
            { name: 'サイクロプス', image: '👁️', category: '英雄' },
            { name: 'ジーン', image: '🧬', category: '英雄' },
            { name: 'ナイトクローラー', image: '😈', category: '英雄' }
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.createAudioContext();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.comboElement = document.getElementById('combo');
        this.livesElement = document.getElementById('lives');
        this.enemyImageElement = document.getElementById('enemy-image');
        this.enemyNameElement = document.getElementById('enemy-name');
        this.typedTextElement = document.getElementById('typed-text');
        this.remainingTextElement = document.getElementById('remaining-text');
        this.gameInput = document.getElementById('game-input');
        this.progressFill = document.getElementById('progress-fill');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // 添加难度选择按钮
        this.createDifficultyButtons();
    }
    
    createDifficultyButtons() {
        const controls = document.querySelector('.controls');
        const difficultyDiv = document.createElement('div');
        difficultyDiv.className = 'difficulty-selector';
        difficultyDiv.innerHTML = `
            <span>难度:</span>
            <button class="difficulty-btn active" data-difficulty="easy">初级</button>
            <button class="difficulty-btn" data-difficulty="medium">中级</button>
            <button class="difficulty-btn" data-difficulty="hard">高级</button>
        `;
        controls.insertBefore(difficultyDiv, controls.firstChild);
        
        // 绑定难度选择事件
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isPlaying) return; // 游戏进行中不能切换难度
                
                difficultyBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.setDifficulty();
            });
        });
    }
    
    setDifficulty() {
        switch(this.difficulty) {
            case 'easy':
                this.timeLimit = 15000; // 15秒
                break;
            case 'medium':
                this.timeLimit = 10000; // 10秒
                break;
            case 'hard':
                this.timeLimit = 7000; // 7秒
                break;
        }
        this.timeLeft = this.timeLimit;
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        this.gameInput.addEventListener('input', (e) => this.handleInput(e));
        this.gameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isPlaying && !this.isPaused) {
                this.checkAnswer();
            }
        });
        
        // 键盘事件监听 - 进一步修复游戏结束后仍有声音的问题
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying && !this.isPaused && e.key !== 'Enter' && this.lives > 0 && this.gameOverElement.classList.contains('hidden')) {
                this.playKeySound();
            }
        });
    }
    
    createAudioContext() {
        // 创建音频上下文用于音效
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    playKeySound() {
        // 播放按键音效 - 马里奥风格
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playCorrectSound() {
        // 播放正确音效 - 马里奥金币音效风格
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 马里奥金币音效的音符序列
        const notes = [523, 659, 784]; // C5, E5, G5
        notes.forEach((note, index) => {
            oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime + index * 0.1);
        });
        
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    playVictorySound() {
        // 播放胜利音效 - 马里奥升级音效风格
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 马里奥升级音效的音符序列
        const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
        notes.forEach((note, index) => {
            oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime + index * 0.08);
        });
        
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    playErrorSound() {
        // 播放错误音效 - 马里奥死亡音效风格（更温和）
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 温和的下降音调
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.2);
        
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    startGame() {
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.combo = 0;
        this.lives = 3;
        this.setDifficulty(); // 设置当前难度的时间限制
        this.updateUI();
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.gameInput.disabled = false;
        this.gameInput.focus();
        
        this.gameOverElement.classList.add('hidden');
        this.spawnNewEnemy();
    }
    
    togglePause() {
        if (this.isPaused) {
            this.isPaused = false;
            this.pauseBtn.textContent = '暂停';
            this.gameInput.disabled = false;
            this.gameInput.focus();
            this.startTimer();
        } else {
            this.isPaused = true;
            this.pauseBtn.textContent = '继续';
            this.gameInput.disabled = true;
            this.stopTimer();
        }
    }
    
    restartGame() {
        // 完全重置游戏状态
        this.stopTimer();
        this.isPlaying = false;
        this.isPaused = false;
        this.typedText = '';
        this.currentEnemy = null;
        
        // 重置UI状态
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        this.gameInput.disabled = true;
        this.gameInput.value = '';
        
        // 清空显示
        this.enemyImageElement.style.backgroundImage = '';
        this.enemyNameElement.textContent = '';
        this.typedTextElement.textContent = '';
        this.remainingTextElement.textContent = '';
        this.progressFill.style.width = '0%';
        
        // 隐藏游戏结束界面
        this.gameOverElement.classList.add('hidden');
        
        // 更新UI
        this.updateUI();
        
        // 确保游戏输入框失去焦点
        this.gameInput.blur();
    }
    
    spawnNewEnemy() {
        this.currentEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
        this.typedText = '';
        
        this.enemyImageElement.style.backgroundImage = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="60" text-anchor="middle" x="50">${this.currentEnemy.image}</text></svg>')`;
        this.enemyNameElement.textContent = this.currentEnemy.name;
        
        this.updateDisplay();
        this.startTimer();
    }
    
    handleInput(e) {
        if (!this.isPlaying || this.isPaused) return;
        
        this.typedText = e.target.value;
        this.updateDisplay();
        
        // 检查是否输入正确
        if (this.typedText === this.currentEnemy.name) {
            this.victory();
        } else if (this.currentEnemy.name.startsWith(this.typedText)) {
            // 部分正确
            this.typedTextElement.classList.add('correct');
            setTimeout(() => {
                this.typedTextElement.classList.remove('correct');
            }, 200);
        } else {
            // 错误
            this.typedTextElement.classList.add('incorrect');
            setTimeout(() => {
                this.typedTextElement.classList.remove('incorrect');
            }, 300);
        }
    }
    
    checkAnswer() {
        if (this.typedText === this.currentEnemy.name) {
            this.victory();
        } else {
            this.error();
        }
    }
    
    victory() {
        this.playVictorySound();
        this.score += 100 + (this.combo * 10);
        this.combo++;
        
        // 爆炸效果
        this.enemyImageElement.classList.add('exploding');
        this.createExplosionEffect();
        
        // 清空输入框
        this.gameInput.value = '';
        this.typedText = '';
        
        setTimeout(() => {
            this.enemyImageElement.classList.remove('exploding');
            this.spawnNewEnemy();
        }, 800);
        
        this.updateUI();
    }
    
    error() {
        this.playErrorSound();
        this.lives--;
        this.combo = 0;
        
        // 裂开效果
        this.enemyImageElement.classList.add('cracking');
        
        setTimeout(() => {
            this.enemyImageElement.classList.remove('cracking');
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.spawnNewEnemy();
            }
        }, 500);
        
        this.updateUI();
    }
    
    createExplosionEffect() {
        const container = this.enemyImageElement;
        const rect = container.getBoundingClientRect();
        
        // 创建多种类型的粒子
        const particleTypes = [
            { shape: 'circle', symbol: '●' },
            { shape: 'star', symbol: '★' },
            { shape: 'diamond', symbol: '◆' },
            { shape: 'triangle', symbol: '▲' }
        ];
        
        // 创建更多粒子，更酷炫的效果
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = rect.width / 2 + 'px';
            particle.style.top = rect.height / 2 + 'px';
            
            // 随机选择粒子类型
            const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            particle.textContent = type.symbol;
            particle.style.fontSize = (8 + Math.random() * 12) + 'px';
            
            // 随机颜色 - 漫威主题配色
            const colors = ['#ff6b6b', '#4ecdc4', '#feca57', '#ff9ff3', '#54a0ff', '#96ceb4', '#45b7d1'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.color = color;
            particle.style.textShadow = `0 0 10px ${color}`;
            
            particle.style.position = 'absolute';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            // 更复杂的运动轨迹
            const angle = (Math.PI * 2 * i) / 50;
            const velocity = 70 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            // 添加旋转和缩放
            const rotation = Math.random() * 720 - 360; // -360到360度
            const scale = 0.3 + Math.random() * 1.7;
            
            particle.style.transform = `translate(${vx}px, ${vy}px) rotate(${rotation}deg) scale(${scale})`;
            
            container.appendChild(particle);
            
            // 随机消失时间
            const disappearTime = 1200 + Math.random() * 800;
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, disappearTime);
        }
        
        // 添加屏幕震动效果
        this.addScreenShake();
        
        // 添加额外的光效
        this.addLightEffect(container);
    }
    
    addLightEffect(container) {
        // 创建闪光效果
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '999';
        flash.style.animation = 'flash 0.3s ease-out';
        
        container.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 300);
    }
    
    addScreenShake() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.animation = 'screenShake 0.3s ease-in-out';
        setTimeout(() => {
            gameContainer.style.animation = '';
        }, 300);
    }
    
    updateDisplay() {
        this.typedTextElement.textContent = this.typedText;
        this.remainingTextElement.textContent = this.currentEnemy.name.substring(this.typedText.length);
    }
    
    startTimer() {
        this.timeLeft = this.timeLimit;
        this.updateProgress();
        
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft -= 100;
                this.updateProgress();
                
                if (this.timeLeft <= 0) {
                    this.error();
                }
            }
        }, 100);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateProgress() {
        const progress = ((this.timeLimit - this.timeLeft) / this.timeLimit) * 100;
        this.progressFill.style.width = progress + '%';
        
        // 根据时间改变颜色 - 漫威主题配色
        if (this.timeLeft < 2000) {
            this.progressFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4444)';
            this.progressFill.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.8)';
        } else if (this.timeLeft < 5000) {
            this.progressFill.style.background = 'linear-gradient(90deg, #feca57, #ff9ff3)';
            this.progressFill.style.boxShadow = '0 0 15px rgba(254, 202, 87, 0.8)';
        } else {
            this.progressFill.style.background = 'linear-gradient(90deg, #4ecdc4, #45b7d1)';
            this.progressFill.style.boxShadow = '0 0 15px rgba(78, 205, 196, 0.8)';
        }
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.comboElement.textContent = this.combo;
        this.livesElement.textContent = this.lives;
    }
    
    gameOver() {
        // 完全停止游戏
        this.isPlaying = false;
        this.isPaused = false;
        this.stopTimer();
        
        // 禁用输入
        this.gameInput.disabled = true;
        this.gameInput.value = '';
        this.gameInput.blur();
        
        // 清空当前敌人显示
        this.enemyImageElement.style.backgroundImage = '';
        this.enemyNameElement.textContent = '';
        this.typedTextElement.textContent = '';
        this.remainingTextElement.textContent = '';
        this.progressFill.style.width = '0%';
        
        // 显示游戏结束界面
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
        
        // 重置按钮状态
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new JapaneseTypingGame();
    
    // 添加一些额外的视觉效果
    document.addEventListener('mousemove', (e) => {
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const distance = Math.sqrt(x * x + y * y);
            
            if (distance < 50) {
                particle.style.transform += ' scale(1.2)';
            }
        });
    });
});
