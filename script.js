// Polyfill requestAnimationFrame
window.requestAnimationFrame = window.__requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (function() {
    return function(callback, element) {
      var lastTime = element.__lastTime;
      if (lastTime === undefined) lastTime = 0;
      var currTime = Date.now();
      var timeToCall = Math.max(1, 33 - (currTime - lastTime));
      window.setTimeout(callback, timeToCall);
      element.__lastTime = currTime + timeToCall;
    };
  })();

// Phát hiện thiết bị
window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
  ((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()
));

var loaded = false;
var init = function() {
  if (loaded) return;
  loaded = true;

  var mobile = window.isDevice;
  var koef = mobile ? 0.5 : 1;
  var canvas = document.getElementById('heart');
  var ctx = canvas.getContext('2d');
  var width = canvas.width = koef * innerWidth;
  var height = canvas.height = koef * innerHeight;
  var rand = Math.random;

  // Cấu hình
  var config = {
    speed: 1.0,
    particleCount: mobile ? 80 : 150,
    traceCount: mobile ? 15 : 40,
    color: '#ff1744',
    showText: true,
    text: '❤ Yêu Thương ❤',
    traceK: 0.4,
    timeDelta: 0.01,
    showShootingStars: true // Thêm cấu hình cho sao băng
  };

  // Bảng màu
  var colorMap = {
    red: { hue: 0, sat: 80, light: 50 },
    pink: { hue: 340, sat: 70, light: 65 },
    purple: { hue: 280, sat: 70, light: 55 },
    blue: { hue: 220, sat: 80, light: 55 },
    green: { hue: 140, sat: 80, light: 50 },
    gold: { hue: 45, sat: 90, light: 55 },
    white: { hue: 0, sat: 0, light: 90 }
  };

  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, width, height);

  // === TẠO HIỆU ỨNG SAO BĂNG ===
  
  // Tạo các ngôi sao nền
  var stars = [];
  var starCount = mobile ? 80 : 150;
  for (var i = 0; i < starCount; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      size: rand() * 2 + 0.5,
      opacity: rand() * 0.5 + 0.3,
      twinkleSpeed: rand() * 0.02 + 0.01,
      twinkleOffset: rand() * Math.PI * 2
    });
  }

  // Tạo sao băng
  var shootingStars = [];
  var maxShootingStars = mobile ? 6 : 12;

  var createShootingStar = function() {
    // Random vị trí xuất phát từ các góc khác nhau
    var fromX, fromY, angle;
    var corner = Math.floor(rand() * 4);
    
    switch(corner) {
      case 0: // Góc trên trái
        fromX = rand() * width * 0.3;
        fromY = rand() * height * 0.2;
        angle = Math.PI / 4 + rand() * 0.3; // 45-60 độ
        break;
      case 1: // Góc trên phải
        fromX = width - rand() * width * 0.3;
        fromY = rand() * height * 0.2;
        angle = Math.PI * 3/4 - rand() * 0.3; // 120-135 độ
        break;
      case 2: // Góc trái
        fromX = rand() * width * 0.1;
        fromY = rand() * height * 0.5;
        angle = Math.PI / 6 + rand() * 0.2; // 30-45 độ
        break;
      case 3: // Góc phải
        fromX = width - rand() * width * 0.1;
        fromY = rand() * height * 0.5;
        angle = Math.PI * 5/6 - rand() * 0.2; // 135-150 độ
        break;
    }

    var length = mobile ? rand() * 100 + 50 : rand() * 200 + 100;
    var speed = mobile ? rand() * 3 + 2 : rand() * 5 + 3;

    return {
      x: fromX,
      y: fromY,
      length: length,
      angle: angle,
      speed: speed * (0.8 + rand() * 0.4),
      opacity: rand() * 0.5 + 0.5,
      life: 1,
      maxLife: 1,
      tail: [],
      color: config.color,
      width: rand() * 2 + 1,
      active: true
    };
  };

  // Khởi tạo vài sao băng ban đầu
  for (var i = 0; i < Math.min(3, maxShootingStars); i++) {
    var star = createShootingStar();
    star.life = rand() * 0.5; // Random trạng thái ban đầu
    shootingStars.push(star);
  }

  // Hàm vẽ sao băng
  var drawShootingStars = function() {
    if (!config.showShootingStars) return;

    // Vẽ ngôi sao nền
    for (var i = 0; i < stars.length; i++) {
      var star = stars[i];
      var twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
      var alpha = star.opacity * twinkle;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255,255,255,0.2)';
      ctx.fillRect(star.x, star.y, star.size, star.size);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    // Tạo sao băng mới nếu chưa đủ
    if (shootingStars.length < maxShootingStars && rand() < 0.01 * config.speed) {
      shootingStars.push(createShootingStar());
    }

    // Cập nhật và vẽ sao băng
    for (var i = shootingStars.length - 1; i >= 0; i--) {
      var star = shootingStars[i];
      
      if (!star.active) {
        shootingStars.splice(i, 1);
        continue;
      }

      // Cập nhật vị trí
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.life -= 0.005 * config.speed;

      // Lưu lại vết (tail)
      star.tail.push({ x: star.x, y: star.y });
      if (star.tail.length > Math.floor(star.length / 3)) {
        star.tail.shift();
      }

      // Kiểm tra nếu hết đời hoặc ra khỏi màn hình
      if (star.life <= 0 || 
          star.x < -50 || star.x > width + 50 || 
          star.y < -50 || star.y > height + 50) {
        star.active = false;
        shootingStars.splice(i, 1);
        continue;
      }

      // Vẽ sao băng
      ctx.save();
      
      // Vẽ đuôi (tail)
      var tailLength = star.tail.length;
      for (var j = 0; j < tailLength; j++) {
        var progress = j / tailLength;
        var alpha = star.opacity * star.life * progress * 0.8;
        
        // Gradient màu từ màu chính sang trắng
        var colorInfo = colorMap[config.color] || colorMap.red;
        var hue = colorInfo.hue + (1 - progress) * 20;
        var sat = colorInfo.sat - (1 - progress) * 20;
        var light = colorInfo.light + (1 - progress) * 30;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'hsla(' + hue + ',' + sat + '%,' + light + '%,1)';
        
        var size = star.width * (1 - progress * 0.5);
        ctx.shadowBlur = 20 * (1 - progress);
        ctx.shadowColor = config.color;
        ctx.fillRect(star.tail[j].x - size/2, star.tail[j].y - size/2, size, size);
      }
      
      // Vẽ đầu sao băng (sáng nhất)
      ctx.globalAlpha = star.opacity * star.life;
      ctx.shadowBlur = 40;
      ctx.shadowColor = config.color;
      ctx.fillStyle = '#ffffff';
      var headSize = star.width * 2;
      ctx.beginPath();
      ctx.arc(star.x, star.y, headSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Vẽ glow xung quanh đầu
      ctx.globalAlpha = star.opacity * star.life * 0.3;
      ctx.shadowBlur = 80;
      ctx.shadowColor = config.color;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, headSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  };

  // === KẾT THÚC HIỆU ỨNG SAO BĂNG ===

  // Hàm tạo trái tim
  var heartPosition = function(rad) {
    return [
      Math.pow(Math.sin(rad), 3),
      -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
    ];
  };

  var scaleAndTranslate = function(pos, sx, sy, dx, dy) {
    return [dx + pos[0] * sx, dy + pos[1] * sy];
  };

  // Tạo điểm cho trái tim
  var generateHeartPoints = function() {
    var points = [];
    var dr = mobile ? 0.25 : 0.1;
    var scales = mobile ? [
      [160, 10],
      [120, 7],
      [70, 4]
    ] : [
      [210, 13],
      [150, 9],
      [90, 5]
    ];
    
    for (var s = 0; s < scales.length; s++) {
      for (var i = 0; i < Math.PI * 2; i += dr) {
        points.push(scaleAndTranslate(
          heartPosition(i),
          scales[s][0],
          scales[s][1],
          0, 0
        ));
      }
    }
    return points;
  };

  var pointsOrigin = generateHeartPoints();
  var heartPointsCount = pointsOrigin.length;
  var targetPoints = [];

  var pulse = function(kx, ky) {
    for (var i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + width / 2,
        ky * pointsOrigin[i][1] + height / 2
      ];
    }
  };

  // Tạo hạt
  var particles = [];
  var createParticles = function(count) {
    particles = [];
    var color = config.color;
    var colorInfo = colorMap[color] || colorMap.red;
    
    for (var i = 0; i < count; i++) {
      var x = rand() * width;
      var y = rand() * height;
      var hue = colorInfo.hue + (rand() - 0.5) * 20;
      var sat = colorInfo.sat + (rand() - 0.5) * 20;
      var light = colorInfo.light + (rand() - 0.5) * 30;
      
      particles[i] = {
        vx: 0,
        vy: 0,
        R: mobile ? 1.5 : 2,
        speed: (rand() + 3) * 0.8,
        q: ~~(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.6,
        f: "hsla(" + hue + "," + sat + "%," + light + "%,0.4)",
        trace: []
      };
      
      // Tạo trace
      var traceCount = config.traceCount;
      for (var k = 0; k < traceCount; k++) {
        particles[i].trace[k] = { x: x, y: y };
      }
    }
  };

  createParticles(config.particleCount);

  // Biến điều khiển
  var time = 0;
  var textX = width / 2;
  var textY = height / 2 + 120;

  // Hàm vẽ chữ
  var drawText = function() {
    if (!config.showText) return;
    
    var text = config.text;
    var fontSize = Math.min(width / 12, height / 8, 70);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Vị trí chữ: phía trên trái tim
    var textYOffset = -height / 2.5;
    
    // Tạo gradient cho chữ
    var gradient = ctx.createLinearGradient(
        textX - fontSize * 2, 
        textY + textYOffset - fontSize/2,
        textX + fontSize * 2, 
        textY + textYOffset + fontSize/2
    );
    
    // Lấy màu từ config
    var colorInfo = colorMap[config.color] || colorMap.red;
    gradient.addColorStop(0, 'hsla(' + colorInfo.hue + ',' + colorInfo.sat + '%,' + (colorInfo.light + 20) + '%,1)');
    gradient.addColorStop(0.5, 'hsla(' + (colorInfo.hue + 20) + ',' + (colorInfo.sat + 10) + '%,' + (colorInfo.light + 40) + '%,1)');
    gradient.addColorStop(1, 'hsla(' + colorInfo.hue + ',' + colorInfo.sat + '%,' + (colorInfo.light + 20) + '%,1)');
    
    ctx.font = '700 ' + fontSize + 'px "Dancing Script", cursive, sans-serif';
    
    // Hiệu ứng đổ bóng nhiều lớp
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(text, textX + 3, textY + textYOffset + 3);
    
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = gradient;
    ctx.fillText(text, textX, textY + textYOffset);
    
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 80;
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, textX, textY + textYOffset);
    ctx.globalAlpha = 1;
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeText(text, textX, textY + textYOffset);
    
    // Hiệu ứng sparkle
    var sparkleCount = 8;
    for (var i = 0; i < sparkleCount; i++) {
        var angle = (i / sparkleCount) * Math.PI * 2 + time * 0.5;
        var radius = fontSize * 0.8 + Math.sin(time * 2 + i) * 10;
        var sx = textX + Math.cos(angle) * radius;
        var sy = textY + textYOffset + Math.sin(angle) * radius * 0.3;
        
        var size = 2 + Math.sin(time * 3 + i * 1.5) * 1;
        ctx.shadowBlur = 15;
        ctx.shadowColor = config.color;
        ctx.globalAlpha = 0.4 + Math.sin(time * 2 + i) * 0.2;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1, size), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    } 
    
    ctx.restore();
  };

  // Vòng lặp animation
  var loop = function() {
    var speedMultiplier = config.speed;
    var n = -Math.cos(time);
    var pulseAmount = (1 + n) * 0.5;
    
    pulse(pulseAmount, pulseAmount);
    
    var timeStep = ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? 0.2 : 1) * config.timeDelta * speedMultiplier;
    time += timeStep;
    
    // Xóa mờ
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, width, height);
    
    // Vẽ sao băng (vẽ trước các hạt để nằm dưới)
    drawShootingStars();
    
    // Cập nhật và vẽ hạt
    var particleCount = particles.length;
    for (var i = particleCount - 1; i >= 0; i--) {
      var u = particles[i];
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);
      
      if (10 > length) {
        if (0.95 < rand()) {
          u.q = ~~(rand() * heartPointsCount);
        } else {
          if (0.99 < rand()) {
            u.D *= -1;
          }
          u.q += u.D;
          u.q %= heartPointsCount;
          if (0 > u.q) {
            u.q += heartPointsCount;
          }
        }
      }
      
      u.vx += -dx / length * u.speed;
      u.vy += -dy / length * u.speed;
      u.trace[0].x += u.vx;
      u.trace[0].y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;
      
      for (var k = 0; k < u.trace.length - 1; k++) {
        var T = u.trace[k];
        var N = u.trace[k + 1];
        N.x -= config.traceK * (N.x - T.x);
        N.y -= config.traceK * (N.y - T.y);
      }
      
      ctx.fillStyle = u.f;
      var traceLen = u.trace.length;
      for (var k = 0; k < traceLen; k++) {
        ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
      }
    }
    
    // Vẽ chữ
    drawText();
    
    // Vẽ glow trái tim
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 100;
    ctx.fillStyle = config.color;
    for (var i = 0; i < targetPoints.length; i += 10) {
      ctx.fillRect(targetPoints[i][0], targetPoints[i][1], 4, 4);
    }
    ctx.restore();
    
    window.requestAnimationFrame(loop, canvas);
  };

  // === ĐIỀU KHIỂN ===

  // Lấy các element
  var toggleBtn = document.getElementById('toggleControlsBtn');
  var controls = document.getElementById('controls');
  var hideBtn = document.getElementById('hideControls');

  // Mặc định: controls hiển thị, nút toggle ẩn
  if (controls) {
    controls.classList.remove('hidden');
  }
  if (toggleBtn) {
    toggleBtn.classList.add('hidden-btn');
  }

  // Ẩn controls (khi nhấn nút "Ẩn điều khiển")
  if (hideBtn) {
    hideBtn.addEventListener('click', function() {
      if (controls) {
        controls.classList.add('hidden');
      }
      if (toggleBtn) {
        toggleBtn.classList.remove('hidden-btn'); // Hiện nút toggle
      }
    });
  }

  // Hiện controls (khi nhấn nút ⚙️)
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      if (controls) {
        controls.classList.remove('hidden');
      }
      if (toggleBtn) {
        toggleBtn.classList.add('hidden-btn'); // Ẩn nút toggle
      }
    });
  }

  // Tốc độ
  var speedControl = document.getElementById('speedControl');
  if (speedControl) {
    speedControl.addEventListener('input', function(e) {
      config.speed = parseFloat(e.target.value);
      var speedValue = document.getElementById('speedValue');
      if (speedValue) speedValue.textContent = config.speed.toFixed(1);
    });
  }

  // Số lượng hạt
  var particleControl = document.getElementById('particleControl');
  var particleTimeout;
  if (particleControl) {
    particleControl.addEventListener('input', function(e) {
      var val = parseInt(e.target.value);
      var particleValue = document.getElementById('particleValue');
      if (particleValue) particleValue.textContent = val;

      clearTimeout(particleTimeout);
      particleTimeout = setTimeout(function() {
        config.particleCount = val;
        createParticles(val);
      }, 300);
    });
  }

  // Màu sắc
  document.querySelectorAll('.color-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.color-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');

      var colorName = this.dataset.color;
      config.color = colorName;

      var colorInfo = colorMap[colorName] || colorMap.red;
      for (var i = 0; i < particles.length; i++) {
        var u = particles[i];
        var hue = colorInfo.hue + (rand() - 0.5) * 20;
        var sat = colorInfo.sat + (rand() - 0.5) * 20;
        var light = colorInfo.light + (rand() - 0.5) * 30;
        u.f = "hsla(" + hue + "," + sat + "%," + light + "%,0.4)";
      }
    });
  });

  // Hiển thị chữ
  var textToggle = document.getElementById('textToggle');
  if (textToggle) {
    textToggle.addEventListener('change', function(e) {
      config.showText = e.target.checked;
    });
  }

  // Cập nhật chữ
  var updateTextBtn = document.getElementById('updateTextBtn');
  var textInput = document.getElementById('textInput');
  
  if (updateTextBtn) {
    updateTextBtn.addEventListener('click', function() {
      if (textInput) {
        var newText = textInput.value.trim();
        if (newText) {
          config.text = newText;
        }
      }
    });
  }

  if (textInput) {
    textInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        if (updateTextBtn) updateTextBtn.click();
      }
    });
  }

  // Bật/tắt sao băng
  var starToggle = document.getElementById('starToggle');
  if (starToggle) {
    starToggle.addEventListener('change', function(e) {
      config.showShootingStars = e.target.checked;
    });
  }

  // Resize
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        var newWidth = canvas.width = koef * innerWidth;
        var newHeight = canvas.height = koef * innerHeight;
        width = newWidth;
        height = newHeight;
        textX = width / 2;
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
        
        pointsOrigin = generateHeartPoints();
        heartPointsCount = pointsOrigin.length;
        targetPoints = [];
        
        for (var i = 0; i < particles.length; i++) {
            particles[i].trace.forEach(function(t) {
                t.x = rand() * width;
                t.y = rand() * height;
            });
        }
    }, 200);
  });

  // Khởi động
  loop();
};

// DOM ready
var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);